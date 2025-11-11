import React, { useEffect, useMemo, useState } from 'react';
import {
  initializeApp,
} from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  orderBy,
  query,
} from 'firebase/firestore';
import { optimizePortfolio, calculatePortfolioMetrics } from '../utils/portfolio';
import { runMonteCarloSimulation, deriveWeightsFromHoldings } from '../utils/simulation';
import DEFAULT_STOCKS from '../constants/stocks';
import {
  BROKER_DISTRIBUTION,
  generateTechnicalAnalysis,
  generateFundamentalAnalysis,
  generatePriceForecast,
} from '../utils/analysis';
import AuthStatusBanner from './ai-borsa/AuthStatusBanner';
import TabNavigation from './ai-borsa/TabNavigation';
import SimulationTab from './ai-borsa/SimulationTab';
import PortfolioTab from './ai-borsa/PortfolioTab';
import PriceForecastTab from './ai-borsa/PriceForecastTab';
import TechnicalAnalysisTab from './ai-borsa/TechnicalAnalysisTab';
import FundamentalAnalysisTab from './ai-borsa/FundamentalAnalysisTab';
import ChatTab from './ai-borsa/ChatTab';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const readFirebaseBootstrap = () => {
  const globalScope = typeof globalThis !== 'undefined' ? globalThis : {};
  const appId =
    typeof globalScope.__app_id !== 'undefined' && globalScope.__app_id
      ? globalScope.__app_id
      : 'default-app-id';

  let firebaseConfig = null;
  if (typeof globalScope.__firebase_config === 'string') {
    try {
      firebaseConfig = JSON.parse(globalScope.__firebase_config);
    } catch (error) {
      console.error('Firebase yapılandırması ayrıştırılamadı:', error);
    }
  }

  const initialAuthToken =
    typeof globalScope.__initial_auth_token === 'string'
      ? globalScope.__initial_auth_token
      : null;

  return { appId, firebaseConfig, initialAuthToken };
};

const AiBorsaUygulamasi = () => {
  const bootstrap = useMemo(() => readFirebaseBootstrap(), []);
  const hisseler = DEFAULT_STOCKS;
  const initialStock = hisseler.find((stock) => stock.kod === 'THYAO') ?? hisseler[0];

  const [activeTab, setActiveTab] = useState('portfoy');
  const [seciliHisse, setSeciliHisse] = useState(initialStock?.kod ?? '');

  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [syncState, setSyncState] = useState('local');

  const [userPortfoy, setUserPortfoy] = useState([
    { kod: 'THYAO', miktar: 100, maliyet: 250, id: 'a1' },
    { kod: 'EREGL', miktar: 500, maliyet: 40, id: 'b2' },
  ]);

  const [chatHistory, setChatHistory] = useState([
    {
      id: generateId(),
      role: 'ai',
      text: 'Merhaba! Ben BIST piyasaları konusunda uzmanlaşmış Yapay Zeka Asistanınızım. Portföyünüz, teknik analiz veya güncel piyasa durumu hakkında ne bilmek istersiniz?',
    },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [simulationTarget, setSimulationTarget] = useState('optimized');
  const [simulationCapital, setSimulationCapital] = useState('100000');
  const [simulationDays, setSimulationDays] = useState('252');
  const [simulationRuns, setSimulationRuns] = useState('500');
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulationError, setSimulationError] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const [yeniHisseKod, setYeniHisseKod] = useState(initialStock?.kod ?? '');
  const [yeniHisseMiktar, setYeniHisseMiktar] = useState('');
  const [yeniHisseMaliyet, setYeniHisseMaliyet] = useState('');

  const [teknikAnaliz, setTeknikAnaliz] = useState(() => generateTechnicalAnalysis(initialStock));
  const [temelAnaliz, setTemelAnaliz] = useState(() => generateFundamentalAnalysis(initialStock));
  const [fiyatTahmini, setFiyatTahmini] = useState(() => generatePriceForecast(initialStock));

  const formatCurrency = (value) => {
    if (!Number.isFinite(value)) {
      return '₺0';
    }

    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value) => {
    if (!Number.isFinite(value)) {
      return '0%';
    }

    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatCompactCurrency = (value) => {
    if (!Number.isFinite(value)) {
      return '0';
    }

    return new Intl.NumberFormat('tr-TR', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(value);
  };

  useEffect(() => {
    try {
      const { appId, firebaseConfig, initialAuthToken } = bootstrap;

      if (firebaseConfig) {
        setSyncState('connecting');
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const authentication = getAuth(app);
        setDb(firestore);

        onAuthStateChanged(authentication, async (user) => {
          if (!user) {
            if (initialAuthToken) {
              await signInWithCustomToken(authentication, initialAuthToken);
            } else {
              await signInAnonymously(authentication);
            }
          }
          setUserId(authentication.currentUser?.uid || generateId());
          setSyncState('syncing');
          setIsAuthReady(true);
        });
      } else {
        setUserId(generateId());
        setIsAuthReady(true);
        setSyncState('local');
      }
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      setSyncState('error');
      setIsAuthReady(true);
    }
  }, [bootstrap]);

  useEffect(() => {
    if (!db || !isAuthReady || !userId || !bootstrap.firebaseConfig) {
      return undefined;
    }

    try {
      const portfolioCollection = collection(
        db,
        'artifacts',
        bootstrap.appId,
        'users',
        userId,
        'portfolio',
      );
      const portfolioQuery = query(portfolioCollection, orderBy('created', 'asc'));

      const unsubscribe = onSnapshot(
        portfolioQuery,
        (snapshot) => {
          const holdings = snapshot.docs.map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }));
          setUserPortfoy(holdings);
          setSyncState('cloud');
        },
        (error) => {
          console.error('Firestore senkronizasyonu başarısız oldu:', error);
          setSyncState('error');
        },
      );

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Firestore dinleyicisi oluşturulamadı:', error);
      setSyncState('error');
      return undefined;
    }
  }, [db, isAuthReady, userId, bootstrap]);

  const canUseFirestore = useMemo(
    () => Boolean(db && isAuthReady && userId && bootstrap.firebaseConfig),
    [db, isAuthReady, userId, bootstrap.firebaseConfig],
  );

  const syncBadge = useMemo(() => {
    switch (syncState) {
      case 'connecting':
        return {
          text: 'Firebase bağlantısı kuruluyor…',
          className: 'bg-amber-500/10 text-amber-300 border border-amber-500/40',
        };
      case 'syncing':
        return {
          text: 'Firebase senkronizasyonu hazırlanıyor…',
          className: 'bg-blue-500/10 text-blue-300 border border-blue-500/40',
        };
      case 'cloud':
        return {
          text: 'Firebase (ücretsiz katman) ile senkronize',
          className: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40',
        };
      case 'error':
        return {
          text: 'Firebase senkronizasyonu kapalı (hata)',
          className: 'bg-rose-500/10 text-rose-300 border border-rose-500/40',
        };
      default:
        return {
          text: 'Yerel modda çalışıyor',
          className: 'bg-slate-700/70 text-slate-300 border border-slate-600/60',
        };
    }
  }, [syncState]);

  useEffect(() => {
    const selectedStock = hisseler.find((stock) => stock.kod === seciliHisse);
    setTeknikAnaliz(generateTechnicalAnalysis(selectedStock));
    setTemelAnaliz(generateFundamentalAnalysis(selectedStock));
    setFiyatTahmini(generatePriceForecast(selectedStock));
  }, [seciliHisse, hisseler]);

  const portfoyData = useMemo(() => optimizePortfolio(hisseler), [hisseler]);
  const userPortfoyMetrics = useMemo(
    () => calculatePortfolioMetrics(userPortfoy, hisseler),
    [userPortfoy, hisseler],
  );
  const userPortfolioWeights = useMemo(
    () => deriveWeightsFromHoldings(userPortfoy, hisseler),
    [userPortfoy, hisseler],
  );

  const simulationTimeSeries = useMemo(() => {
    if (!simulationResult) {
      return [];
    }

    return simulationResult.timeSeries.map((entry) => ({
      day: entry.day,
      low: entry.p10,
      median: entry.p50,
      high: entry.p90,
      mean: entry.mean,
    }));
  }, [simulationResult]);

  const simulationDistribution = useMemo(() => {
    if (!simulationResult) {
      return [];
    }

    const totalCount = simulationResult.distribution.reduce((sum, bucket) => sum + bucket.count, 0);

    return simulationResult.distribution.map((bucket, index) => ({
      ...bucket,
      index,
      midpoint: (bucket.binStart + bucket.binEnd) / 2,
      probability: totalCount ? (bucket.count / totalCount) * 100 : 0,
    }));
  }, [simulationResult]);

  useEffect(() => {
    if (simulationTarget === 'user') {
      setSimulationCapital(userPortfoyMetrics.toplamDeger || '0');
    } else if (simulationTarget === 'optimized') {
      setSimulationCapital('100000');
    }
  }, [simulationTarget, userPortfoyMetrics.toplamDeger]);

  const handleRunSimulation = (event) => {
    event.preventDefault();

    setSimulationError(null);
    setSimulationResult(null);

    const parsedCapital = Number(simulationCapital);
    const parsedDays = Number.parseInt(simulationDays, 10);
    const parsedRuns = Number.parseInt(simulationRuns, 10);

    if (!Number.isFinite(parsedCapital) || parsedCapital <= 0) {
      setSimulationError('Lütfen pozitif bir başlangıç sermayesi girin.');
      return;
    }

    if (!Number.isInteger(parsedDays) || parsedDays <= 0 || parsedDays > 730) {
      setSimulationError('Simülasyon süresi 1 ile 730 gün arasında olmalıdır.');
      return;
    }

    if (!Number.isInteger(parsedRuns) || parsedRuns <= 0 || parsedRuns > 5000) {
      setSimulationError('Simülasyon sayısı 1 ile 5000 arasında olmalıdır.');
      return;
    }

    const targetWeights =
      simulationTarget === 'optimized'
        ? portfoyData.dagitim.map((item) => ({ kod: item.kod, weight: item.agirlik }))
        : userPortfolioWeights;

    if (!targetWeights.length) {
      setSimulationError('Seçtiğiniz portföy için simülasyon yapılabilecek ağırlık bulunamadı.');
      return;
    }

    setIsSimulating(true);

    try {
      const result = runMonteCarloSimulation({
        portfolioWeights: targetWeights,
        stockUniverse: hisseler,
        initialCapital: parsedCapital,
        days: parsedDays,
        simulations: parsedRuns,
      });

      setSimulationResult(result);
    } catch (error) {
      console.error('Simülasyon başarısız oldu:', error);
      setSimulationError(
        error.message || 'Simülasyon çalıştırılırken beklenmeyen bir hata oluştu.',
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAddHisse = async (event) => {
    event.preventDefault();
    const miktar = Number.parseFloat(yeniHisseMiktar);
    const maliyet = Number.parseFloat(yeniHisseMaliyet);

    if (!yeniHisseKod || Number.isNaN(miktar) || Number.isNaN(maliyet) || miktar <= 0 || maliyet <= 0) {
      console.error('Lütfen geçerli değerler girin.');
      return;
    }

    const newHolding = {
      kod: yeniHisseKod,
      miktar,
      maliyet,
      id: generateId(),
    };

    if (canUseFirestore) {
      try {
        await addDoc(collection(db, 'artifacts', bootstrap.appId, 'users', userId, 'portfolio'), {
          kod: newHolding.kod,
          miktar: newHolding.miktar,
          maliyet: newHolding.maliyet,
          created: serverTimestamp(),
        });
      } catch (error) {
        console.error('Firestore ekleme hatası, yerel moda düşülüyor:', error);
        setSyncState('error');
        setUserPortfoy((prev) => [...prev, newHolding]);
      }
    } else {
      setUserPortfoy((prev) => [...prev, newHolding]);
    }

    setYeniHisseMiktar('');
    setYeniHisseMaliyet('');
  };

  const handleDeleteHisse = async (id) => {
    if (canUseFirestore) {
      try {
        await deleteDoc(doc(db, 'artifacts', bootstrap.appId, 'users', userId, 'portfolio', id));
        return;
      } catch (error) {
        console.error('Firestore silme hatası, yerel moda düşülüyor:', error);
        setSyncState('error');
      }
    }

    setUserPortfoy((prev) => prev.filter((holding) => holding.id !== id));
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!currentInput.trim() || isLoading) return;

    const userMessage = currentInput.trim();
    setCurrentInput('');
    setIsLoading(true);

    const newUserMessage = { id: generateId(), role: 'user', text: userMessage };

    const payloadHistory = [...chatHistory, newUserMessage].map((message) => ({
      role: message.role === 'ai' ? 'model' : 'user',
      parts: [{ text: message.text }],
    }));
    setChatHistory((prev) => [...prev, newUserMessage]);

    const systemPrompt =
      'Sen, Borsa İstanbul (BIST) ve global finans piyasaları konusunda uzmanlaşmış bir Yapay Zeka (AI) Finansal Asistansın. Kullanıcının yatırım, hisse analizi, temel/teknik metrikler ve piyasa genel bilgileri hakkındaki sorularını yanıtla. Cevaplarını güncel ve doğru bilgilerle temellendirmek için Google Search aracını kullan. Cevaplarını Türkçe, net ve profesyonel bir tonda sun. Kısa ve öz cevaplar vermeye odaklan.';
    const apiKey = '';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: payloadHistory,
      tools: [{ google_search: {} }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    let attempt = 0;
    const maxRetries = 3;
    let responseText = 'Üzgünüm, bir sorun oluştu veya yanıt alınamadı.';

    while (attempt < maxRetries) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
          responseText = candidate.content.parts[0].text;
          break;
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        attempt += 1;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
        } else {
          console.error('API Call Failed after maximum retries:', error);
          responseText =
            'Maalesef şu anda piyasa verilerine erişimde sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.';
        }
      }
    }

    setChatHistory((prev) => [...prev, { id: generateId(), role: 'ai', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI Borsa Analiz Platformu
        </h1>
        <p className="text-slate-300 mb-8 text-lg">Yapay Zeka Destekli Yatırım Asistanınız</p>

        <AuthStatusBanner isAuthReady={isAuthReady} userId={userId} syncBadge={syncBadge} />

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'simulasyon' && (
          <SimulationTab
            formatCurrency={formatCurrency}
            formatPercent={formatPercent}
            formatCompactCurrency={formatCompactCurrency}
            simulationTarget={simulationTarget}
            setSimulationTarget={setSimulationTarget}
            simulationCapital={simulationCapital}
            setSimulationCapital={setSimulationCapital}
            simulationDays={simulationDays}
            setSimulationDays={setSimulationDays}
            simulationRuns={simulationRuns}
            setSimulationRuns={setSimulationRuns}
            simulationError={simulationError}
            simulationResult={simulationResult}
            simulationTimeSeries={simulationTimeSeries}
            simulationDistribution={simulationDistribution}
            isSimulating={isSimulating}
            onRunSimulation={handleRunSimulation}
          />
        )}

        {activeTab === 'portfoy' && (
          <PortfolioTab
            portfoyData={portfoyData}
            userPortfoy={userPortfoy}
            hisseler={hisseler}
            userPortfoyMetrics={userPortfoyMetrics}
            yeniHisseKod={yeniHisseKod}
            setYeniHisseKod={setYeniHisseKod}
            yeniHisseMiktar={yeniHisseMiktar}
            setYeniHisseMiktar={setYeniHisseMiktar}
            yeniHisseMaliyet={yeniHisseMaliyet}
            setYeniHisseMaliyet={setYeniHisseMaliyet}
            onAddHolding={handleAddHisse}
            onDeleteHolding={handleDeleteHisse}
          />
        )}

        {activeTab === 'tahmin' && (
          <PriceForecastTab
            seciliHisse={seciliHisse}
            setSeciliHisse={setSeciliHisse}
            hisseler={hisseler}
            fiyatTahmini={fiyatTahmini}
          />
        )}

        {activeTab === 'teknik' && (
          <TechnicalAnalysisTab
            seciliHisse={seciliHisse}
            setSeciliHisse={setSeciliHisse}
            hisseler={hisseler}
            teknikAnaliz={teknikAnaliz}
            araciKurumlar={BROKER_DISTRIBUTION}
          />
        )}

        {activeTab === 'temel' && (
          <FundamentalAnalysisTab
            seciliHisse={seciliHisse}
            setSeciliHisse={setSeciliHisse}
            hisseler={hisseler}
            temelAnaliz={temelAnaliz}
          />
        )}

        {activeTab === 'ai_chat' && (
          <ChatTab
            chatHistory={chatHistory}
            isLoading={isLoading}
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
};

export default AiBorsaUygulamasi;
