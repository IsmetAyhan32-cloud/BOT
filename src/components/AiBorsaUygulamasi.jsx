import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  AlertCircle,
  PlusCircle,
  Trash2,
  User,
  Send,
  Loader2,
} from 'lucide-react';
import { optimizePortfolio, calculatePortfolioMetrics } from '../utils/portfolio';
// Firebase Imports (Firestore is used for persistent, multi-user apps)
import { initializeApp } from 'firebase/app';
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
  query,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Tailwind CSS is assumed to be available.

const AiBorsaUygulamasi = () => {
  const [activeTab, setActiveTab] = useState('portfoy');
  const [seciliHisse, setSeciliHisse] = useState('THYAO');

  // Firebase & Auth States (Mandatory Setup)
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // USER DEFINED PORTFOLIO STATE (Currently Local State, but structured for Firestore)
  const [userPortfoy, setUserPortfoy] = useState([
    { kod: 'THYAO', miktar: 100, maliyet: 250, id: 'a1' },
    { kod: 'EREGL', miktar: 500, maliyet: 40, id: 'b2' },
  ]);

  // AI CHAT STATES
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'ai',
      text: 'Merhaba! Ben BIST piyasaları konusunda uzmanlaşmış Yapay Zeka Asistanınızım. Portföyünüz, teknik analiz veya güncel piyasa durumu hakkında ne bilmek istersiniz?',
    },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Input states for adding new stock
  const [yeniHisseKod, setYeniHisseKod] = useState('THYAO');
  const [yeniHisseMiktar, setYeniHisseMiktar] = useState('');
  const [yeniHisseMaliyet, setYeniHisseMaliyet] = useState('');

  // Simulated Stock Data
  const hisseler = [
    { kod: 'THYAO', sektor: 'Ulaştırma', fiyat: 285.5, yillikGetiri: 0.32, volatilite: 0.28 },
    { kod: 'EREGL', sektor: 'Metal', fiyat: 42.8, yillikGetiri: 0.25, volatilite: 0.35 },
    { kod: 'TUPRS', sektor: 'Enerji', fiyat: 156.2, yillikGetiri: 0.28, volatilite: 0.30 },
    { kod: 'AKBNK', sektor: 'Finans', fiyat: 58.4, yillikGetiri: 0.22, volatilite: 0.26 },
    { kod: 'SAHOL', sektor: 'Holding', fiyat: 94.6, yillikGetiri: 0.20, volatilite: 0.24 },
    { kod: 'KCHOL', sektor: 'Holding', fiyat: 152.8, yillikGetiri: 0.18, volatilite: 0.22 },
    { kod: 'PETKM', sektor: 'Kimya', fiyat: 78.9, yillikGetiri: 0.26, volatilite: 0.29 },
    { kod: 'SISE', sektor: 'Cam', fiyat: 45.3, yillikGetiri: 0.15, volatilite: 0.20 },
    { kod: 'ASELS', sektor: 'Savunma', fiyat: 68.5, yillikGetiri: 0.35, volatilite: 0.32 },
    { kod: 'BIMAS', sektor: 'Perakende', fiyat: 142.5, yillikGetiri: 0.24, volatilite: 0.27 },
    { kod: 'GARAN', sektor: 'Finans', fiyat: 94.2, yillikGetiri: 0.21, volatilite: 0.24 },
    { kod: 'PGSUS', sektor: 'Turizm', fiyat: 265.5, yillikGetiri: 0.29, volatilite: 0.28 },
    { kod: 'FROTO', sektor: 'Otomotiv', fiyat: 285.5, yillikGetiri: 0.24, volatilite: 0.28 },
    { kod: 'CCOLA', sektor: 'Gıda', fiyat: 125.5, yillikGetiri: 0.21, volatilite: 0.23 },
    { kod: 'GUBRF', sektor: 'Kimya', fiyat: 158.5, yillikGetiri: 0.22, volatilite: 0.26 },
  ];

  // --- FIREBASE INITIALIZATION AND AUTHENTICATION ---
  useEffect(() => {
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const firebaseConfig =
        typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
      const initialAuthToken =
        typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

      if (firebaseConfig) {
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const authentication = getAuth(app);
        setDb(firestore);
        setAuth(authentication);

        onAuthStateChanged(authentication, async (user) => {
          if (!user) {
            // Sign in using the provided token or anonymously
            if (initialAuthToken) {
              await signInWithCustomToken(authentication, initialAuthToken);
            } else {
              await signInAnonymously(authentication);
            }
          }
          setUserId(authentication.currentUser?.uid || crypto.randomUUID());
          setIsAuthReady(true);
        });
      } else {
        setUserId(crypto.randomUUID());
        setIsAuthReady(true);
      }
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      setIsAuthReady(true);
    }
  }, []);

  // --- PORTFOLIO OPTIMIZATION LOGIC (SHARPE RATIO) ---

  const portfoyData = optimizePortfolio(hisseler);

  // --- USER PORTFOLIO LOGIC ---

  const userPortfoyMetrics = calculatePortfolioMetrics(userPortfoy, hisseler);

  const handleAddHisse = (e) => {
    e.preventDefault();
    const miktar = parseFloat(yeniHisseMiktar);
    const maliyet = parseFloat(yeniHisseMaliyet);

    if (!yeniHisseKod || Number.isNaN(miktar) || Number.isNaN(maliyet) || miktar <= 0 || maliyet <= 0) {
      console.error('Lütfen geçerli değerler girin.');
      return;
    }

    const newHolding = {
      kod: yeniHisseKod,
      miktar,
      maliyet,
      id: Date.now().toString(), // Simple unique ID for local state
    };

    // Check if Firestore is ready for potential future integration
    // if (isAuthReady && db && userId) {
    //   const portfolioRef = collection(db, `artifacts/${__app_id}/users/${userId}/portfolio`);
    //   addDoc(portfolioRef, { ...newHolding, created: serverTimestamp() }).catch(console.error);
    // }
    setUserPortfoy([...userPortfoy, newHolding]);

    // Reset form
    setYeniHisseMiktar('');
    setYeniHisseMaliyet('');
  };

  const handleDeleteHisse = (id) => {
    setUserPortfoy(userPortfoy.filter((h) => h.id !== id));
    // Future Firestore delete logic here
  };

  // --- AI CHAT FUNCTIONALITY ---

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentInput.trim() || isLoading) return;

    const userMessage = currentInput.trim();
    setCurrentInput('');
    setIsLoading(true);

    const newUserMessage = { role: 'user', text: userMessage };

    // Prepare chat history for API call
    const newChatHistory = [...chatHistory, newUserMessage].map((msg) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));
    setChatHistory((prev) => [...prev, newUserMessage]);

    const systemPrompt =
      'Sen, Borsa İstanbul (BIST) ve global finans piyasaları konusunda uzmanlaşmış bir Yapay Zeka (AI) Finansal Asistansın. Kullanıcının yatırım, hisse analizi, temel/teknik metrikler ve piyasa genel bilgileri hakkındaki sorularını yanıtla. Cevaplarını güncel ve doğru bilgilerle temellendirmek için Google Search aracını kullan. Cevaplarını Türkçe, net ve profesyonel bir tonda sun. Kısa ve öz cevaplar vermeye odaklan.';
    const apiKey = '';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: newChatHistory,
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
          break; // Success, exit loop
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        attempt += 1;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        } else {
          console.error('API Call Failed after maximum retries:', error);
          responseText =
            'Maalesef şu anda piyasa verilerine erişimde sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.';
        }
      }
    }

    setChatHistory((prev) => [...prev, { role: 'ai', text: responseText }]);
    setIsLoading(false);
  };

  // --- OTHER ANALYSIS LOGIC (UNCHANGED) ---

  // Simulated Technical Analysis Data
  const getTeknikAnaliz = (kod) => {
    const hisse = hisseler.find((h) => h.kod === kod);
    if (!hisse) return null;

    const gunlukFiyatlar = [];
    let fiyat = hisse.fiyat;
    for (let i = 60; i >= 0; i -= 1) {
      // Random daily price change simulation
      fiyat = fiyat * (1 + (Math.random() - 0.5) * 0.03);
      gunlukFiyatlar.push({
        gun: 60 - i,
        fiyat: parseFloat(fiyat.toFixed(2)),
        hacim: Math.floor(Math.random() * 5000000 + 1000000),
      });
    }

    return {
      gunlukFiyatlar,
      rsi: parseFloat((45 + Math.random() * 30).toFixed(2)),
      macd: {
        macd: parseFloat((Math.random() - 0.5).toFixed(2)),
        signal: parseFloat((Math.random() - 0.5).toFixed(2)),
      },
      bollinger: { ust: hisse.fiyat * 1.05, orta: hisse.fiyat, alt: hisse.fiyat * 0.95 },
      destek: hisse.fiyat * 0.92,
      direnc: hisse.fiyat * 1.08,
    };
  };

  // Simulated Fundamental Analysis Data
  const getTemelAnaliz = (kod) => {
    const hisse = hisseler.find((h) => h.kod === kod);
    if (!hisse) return null;

    return {
      fk: parseFloat((8 + Math.random() * 12).toFixed(2)),
      pd: parseFloat((0.5 + Math.random() * 2).toFixed(2)),
      roe: parseFloat((10 + Math.random() * 20).toFixed(2)),
      karMarji: parseFloat((5 + Math.random() * 15).toFixed(2)),
      borcOrani: parseFloat((20 + Math.random() * 40).toFixed(2)),
      ceyrekSatis: [
        { ceyrek: 'Ç1', satis: 1200, kar: 180 },
        { ceyrek: 'Ç2', satis: 1350, kar: 210 },
        { ceyrek: 'Ç3', satis: 1480, kar: 245 },
        { ceyrek: 'Ç4', satis: 1620, kar: 285 },
      ],
      analistTavsiye: { al: 8, tut: 3, sat: 2 },
      hedefFiyat: hisse.fiyat * 1.15,
    };
  };

  // Simulated Price Forecast Data (Time Series Prediction)
  const getFiyatTahmini = (kod) => {
    const hisse = hisseler.find((h) => h.kod === kod);
    if (!hisse) return null;

    const tahminler = [];
    for (let gun = 1; gun <= 7; gun += 1) {
      // Simple forecast based on annual return and random walk
      const tahmin =
        hisse.fiyat * (1 + (hisse.yillikGetiri / 252) * gun + (Math.random() - 0.5) * 0.02);
      const aralik = tahmin * hisse.volatilite * 0.6; // Confidence Interval width
      tahminler.push({
        gun,
        tahmin: parseFloat(tahmin.toFixed(2)),
        min: parseFloat((tahmin - aralik).toFixed(2)),
        max: parseFloat((tahmin + aralik).toFixed(2)),
      });
    }

    return {
      guncel: hisse.fiyat,
      tahminler,
      mae: parseFloat((hisse.volatilite * hisse.fiyat * 0.08).toFixed(2)), // Simulated Mean Absolute Error
      rSquare: parseFloat((0.75 + Math.random() * 0.2).toFixed(2)), // Simulated R-squared
    };
  };

  // State initialization for analysis data
  const [teknikAnaliz, setTeknikAnaliz] = useState(getTeknikAnaliz(seciliHisse));
  const [temelAnaliz, setTemelAnaliz] = useState(getTemelAnaliz(seciliHisse));

  // Update analysis data when selected stock changes
  useEffect(() => {
    setTeknikAnaliz(getTeknikAnaliz(seciliHisse));
    setTemelAnaliz(getTemelAnaliz(seciliHisse));
  }, [seciliHisse]);

  // Simulated Broker Distribution Data
  const araciKurumlar = [
    { kurum: 'Garanti Yatırım', alis: 25, satis: 18, net: 7 },
    { kurum: 'İş Yatırım', alis: 22, satis: 20, net: 2 },
    { kurum: 'Yapı Kredi Yatırım', alis: 18, satis: 22, net: -4 },
    { kurum: 'Ak Yatırım', alis: 20, satis: 15, net: 5 },
    { kurum: 'Halk Yatırım', alis: 15, satis: 19, net: -4 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#84cc16'];

  // Custom Tooltip for Price Forecast
  const ForecastTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/90 p-4 rounded-lg shadow-xl border border-slate-700 text-sm">
          <p className="font-bold text-blue-400">Gün {data.gun}</p>
          <p>
            Tahmin: <span className="text-blue-300 font-medium">₺{data.tahmin}</span>
          </p>
          <p>
            Min Aralığı: <span className="text-red-400 font-medium">₺{data.min}</span>
          </p>
          <p>
            Max Aralığı: <span className="text-green-400 font-medium">₺{data.max}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI Borsa Analiz Platformu
        </h1>
        <p className="text-slate-300 mb-8 text-lg">Yapay Zeka Destekli Yatırım Asistanınız</p>

        {isAuthReady && userId && (
          <div className="mb-4 flex items-center space-x-2 text-sm text-slate-400 p-3 bg-slate-800/50 rounded-lg">
            <User className="w-4 h-4 text-blue-400" />
            <span>Kullanıcı Kimliği: {userId}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 border-b border-slate-700">
          {[
            { id: 'portfoy', label: 'Portföy Optimizasyonu' },
            { id: 'tahmin', label: 'Fiyat Tahmini (AI)' },
            { id: 'teknik', label: 'Teknik Analiz' },
            { id: 'temel', label: 'Temel Analiz' },
            { id: 'ai_chat', label: 'AI Asistan' }, // New AI Chat Tab
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition duration-300 text-lg ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* AI CHAT ASSISTANT TAB */}
        {activeTab === 'ai_chat' && (
          <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-green-300 flex items-center space-x-3">
              <Brain className="w-6 h-6" />
              <span>AI Borsa Asistanı</span>
            </h2>

            {/* Chat Messages Area */}
            <div className="h-[450px] overflow-y-auto p-4 space-y-4 bg-slate-900 rounded-xl mb-6 border border-slate-700">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-xl shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-700 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <span className="font-semibold text-xs opacity-70 block mb-1">
                      {msg.role === 'user' ? 'Siz' : 'AI Asistan'}
                    </span>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-xl bg-slate-700 text-slate-200 rounded-tl-none">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    <span className="text-sm">Yanıtlanyor...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Sorunuzu buraya yazın..."
                className="flex-grow bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`p-3 rounded-xl transition duration-200 ${
                  isLoading ? 'bg-slate-600 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                disabled={isLoading}
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        )}

        {/* Portföy Optimizasyonu Tab */}
        {activeTab === 'portfoy' && (
          <div className="space-y-8">
            {/* AI OPTIMIZED PORTFOLIO */}
            <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-purple-300">AI Önerilen Optimize Portföy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 shadow-xl border border-blue-600/50 flex items-center space-x-4">
                  <TrendingUp className="w-8 h-8 text-blue-300" />
                  <div>
                    <div className="text-sm text-blue-200">Beklenen Yıllık Getiri</div>
                    <div className="text-4xl font-extrabold">%{portfoyData.beklenenGetiri}</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-6 shadow-xl border border-purple-600/50 flex items-center space-x-4">
                  <Brain className="w-8 h-8 text-purple-300" />
                  <div>
                    <div className="text-sm text-purple-200">Optimize Sharpe Oranı</div>
                    <div className="text-4xl font-extrabold">{portfoyData.sharpeOrani}</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-pink-700 to-pink-900 rounded-3xl p-6 shadow-xl border border-pink-600/50 flex items-center space-x-4">
                  <TrendingDown className="w-8 h-8 text-pink-300" />
                  <div>
                    <div className="text-sm text-pink-200">Max. Düşüş (Sim.)</div>
                    <div className="text-4xl font-extrabold">{portfoyData.maxDusus}%</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-700 to-orange-900 rounded-3xl p-6 shadow-xl border border-orange-600/50 flex items-center space-x-4">
                  <Activity className="w-8 h-8 text-orange-300" />
                  <div>
                    <div className="text-sm text-orange-200">Çeşitlilik (Sektör)</div>
                    <div className="text-4xl font-extrabold">{portfoyData.sektorSayisi}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Portföy Dağılım Grafiği */}
                <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300">Dağılım Grafiği</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={portfoyData.dagitim}
                        dataKey="agirlik"
                        nameKey="kod"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        paddingAngle={5}
                        labelLine={false}
                        label={({ kod, agirlik }) => `${kod} ${(agirlik * 100).toFixed(1)}%`}
                      >
                        {portfoyData.dagitim.map((entry, index) => (
                          <Cell key={entry.kod} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `${(value * 100).toFixed(2)}%`}
                        labelFormatter={(label) => `Hisse: ${label}`}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Hisse Detay Tablosu */}
                <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300">Önerilen Hisseler</h3>
                  <div className="h-[300px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-700/80 backdrop-blur-sm">
                        <tr>
                          <th className="p-3 text-left">Kod</th>
                          <th className="p-3 text-left hidden sm:table-cell">Sektör</th>
                          <th className="p-3 text-right">Ağırlık (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfoyData.dagitim.map((hisse) => (
                          <tr key={hisse.kod} className="border-t border-slate-700 hover:bg-slate-700/50 transition">
                            <td className="p-3 font-semibold text-blue-400">{hisse.kod}</td>
                            <td className="p-3 text-slate-400 hidden sm:table-cell">{hisse.sektor}</td>
                            <td className="p-3 text-right font-bold text-green-400">
                              {(hisse.agirlik * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* USER CUSTOM PORTFOLIO */}
            <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-green-300">Kendi Portföyünüzü Takip Edin</h2>

              {/* Portföy Özet Kartları */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-700 rounded-2xl p-4 shadow-md">
                  <div className="text-sm text-slate-300">Toplam Piyasa Değeri</div>
                  <div className="text-2xl font-bold text-blue-300">₺{userPortfoyMetrics.toplamDeger}</div>
                </div>
                <div className="bg-slate-700 rounded-2xl p-4 shadow-md">
                  <div className="text-sm text-slate-300">Toplam Maliyet</div>
                  <div className="text-2xl font-bold text-slate-200">₺{userPortfoyMetrics.toplamMaliyet}</div>
                </div>
                <div className="bg-slate-700 rounded-2xl p-4 shadow-md">
                  <div className="text-sm text-slate-300">Kar/Zarar</div>
                  <div
                    className={`text-2xl font-bold ${
                      userPortfoyMetrics.karZarar >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {userPortfoyMetrics.karZarar}₺
                  </div>
                </div>
                <div className="bg-slate-700 rounded-2xl p-4 shadow-md">
                  <div className="text-sm text-slate-300">Getiri (%)</div>
                  <div
                    className={`text-2xl font-bold ${
                      userPortfoyMetrics.getiriYuzdesi >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    %{userPortfoyMetrics.getiriYuzdesi}
                  </div>
                </div>
              </div>

              {/* Hisse Ekleme Formu */}
              <form onSubmit={handleAddHisse} className="grid grid-cols-4 gap-4 p-4 mb-8 bg-slate-700/50 rounded-xl">
                <select
                  value={yeniHisseKod}
                  onChange={(e) => setYeniHisseKod(e.target.value)}
                  className="col-span-4 sm:col-span-1 bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white"
                >
                  {hisseler.map((hisse) => (
                    <option key={hisse.kod} value={hisse.kod}>
                      {hisse.kod}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Miktar (Adet)"
                  value={yeniHisseMiktar}
                  onChange={(e) => setYeniHisseMiktar(e.target.value)}
                  required
                  className="col-span-2 sm:col-span-1 bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400"
                />

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Maliyet (₺)"
                  value={yeniHisseMaliyet}
                  onChange={(e) => setYeniHisseMaliyet(e.target.value)}
                  required
                  className="col-span-2 sm:col-span-1 bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400"
                />

                <button
                  type="submit"
                  className="col-span-4 sm:col-span-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Hisse Ekle</span>
                </button>
              </form>

              {/* Portföy Tablosu */}
              <h3 className="text-xl font-semibold mb-4 text-blue-300">Varlıklarınız</h3>
              <div className="h-[300px] overflow-y-auto border border-slate-700 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-700/80 backdrop-blur-sm">
                    <tr>
                      <th className="p-3 text-left">Kod</th>
                      <th className="p-3 text-right">Miktar</th>
                      <th className="p-3 text-right">Maliyet (₺)</th>
                      <th className="p-3 text-right hidden sm:table-cell">Güncel Fiyat (₺)</th>
                      <th className="p-3 text-right">K/Z (%)</th>
                      <th className="p-3 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPortfoy.map((holding) => {
                      const stock = hisseler.find((s) => s.kod === holding.kod);
                      if (!stock) return null;

                      const mevcutDeger = holding.miktar * stock.fiyat;
                      const maliyetToplami = holding.miktar * holding.maliyet;
                      const karZararYuzdesi = ((mevcutDeger / maliyetToplami) - 1) * 100;

                      return (
                        <tr key={holding.id} className="border-t border-slate-700 hover:bg-slate-700/50 transition">
                          <td className="p-3 font-semibold text-blue-400">{holding.kod}</td>
                          <td className="p-3 text-right text-slate-300">{holding.miktar}</td>
                          <td className="p-3 text-right text-yellow-400">{holding.maliyet.toFixed(2)}</td>
                          <td className="p-3 text-right hidden sm:table-cell text-green-400">
                            {stock.fiyat.toFixed(2)}
                          </td>
                          <td
                            className={`p-3 text-right font-bold ${
                              karZararYuzdesi >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            %{karZararYuzdesi.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteHisse(holding.id)}
                              className="text-red-500 hover:text-red-400 transition"
                            >
                              <Trash2 className="w-5 h-5 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700 flex items-start space-x-4">
              <AlertCircle className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-yellow-300">Yatırım Notu</h3>
                <p className="text-slate-400 mt-1">
                  Bu portföy, yüksek getiri potansiyelini (Sharpe oranı {portfoyData.sharpeOrani}) sektörel çeşitlilikle birleştirerek risk-getiri optimizasyonu sağlamaktadır. Simülasyon verileri kullanılmıştır, gerçek piyasa koşulları farklılık gösterebilir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fiyat Tahmini Tab (UNCHANGED) */}
        {activeTab === 'tahmin' && getFiyatTahmini(seciliHisse) && (
          <div className="space-y-8">
            <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
              <label className="block text-xl font-semibold mb-4 text-blue-300">Hisse Seçin</label>
              <select
                value={seciliHisse}
                onChange={(e) => setSeciliHisse(e.target.value)}
                className="w-full md:w-96 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-blue-500 focus:border-blue-500 transition"
              >
                {hisseler.map((hisse) => (
                  <option key={hisse.kod} value={hisse.kod}>
                    {hisse.kod} - {hisse.sektor}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 shadow-xl border border-blue-600/50">
                <div className="text-sm text-blue-200">Güncel Fiyat</div>
                <div className="text-4xl font-extrabold">₺{getFiyatTahmini(seciliHisse).guncel}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-6 shadow-xl border border-purple-600/50">
                <div className="text-sm text-purple-200">Tahmin Hata Payı (MAE)</div>
                <div className="text-4xl font-extrabold">{getFiyatTahmini(seciliHisse).mae}</div>
              </div>
              <div className="bg-gradient-to-br from-pink-700 to-pink-900 rounded-3xl p-6 shadow-xl border border-pink-600/50">
                <div className="text-sm text-pink-200">Model Doğruluğu (R² Skoru)</div>
                <div className="text-4xl font-extrabold">{getFiyatTahmini(seciliHisse).rSquare}</div>
              </div>
            </div>

            <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
              <h3 className="text-xl font-semibold mb-4 text-blue-300">7 Günlük AI Fiyat Tahmini ve Güven Aralığı</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={getFiyatTahmini(seciliHisse).tahminler} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="gun" stroke="#9ca3af" label={{ value: 'Günler', position: 'bottom', fill: '#9ca3af' }} />
                  <YAxis stroke="#9ca3af" domain={['auto', 'auto']} />
                  <Tooltip content={<ForecastTooltip />} />
                  <Legend />
                  {/* Confidence Interval Area */}
                  <Area type="monotone" dataKey="min" stroke="#ef4444" fill="url(#colorMin)" strokeWidth={0} />
                  <Area type="monotone" dataKey="max" stroke="#10b981" fill="url(#colorMax)" strokeWidth={0} />
                  {/* Central Forecast Line */}
                  <Line type="monotone" dataKey="tahmin" stroke="#3b82f6" strokeWidth={4} name="AI Tahmini" dot={{ r: 6 }} />

                  {/* Gradient definitions for Area Chart */}
                  <defs>
                    <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Teknik Analiz Tab (UNCHANGED) */}
        {activeTab === 'teknik' && teknikAnaliz && (
          <div className="space-y-8">
            <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
              <label className="block text-xl font-semibold mb-4 text-blue-300">Hisse Seçin</label>
              <select
                value={seciliHisse}
                onChange={(e) => setSeciliHisse(e.target.value)}
                className="w-full md:w-96 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-blue-500 focus:border-blue-500 transition"
              >
                {hisseler.map((hisse) => (
                  <option key={hisse.kod} value={hisse.kod}>
                    {hisse.kod} - {hisse.sektor}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 shadow-xl border border-blue-600/50">
                <div className="text-sm text-blue-200">RSI (14)</div>
                <div
                  className={`text-4xl font-extrabold ${
                    teknikAnaliz.rsi > 70
                      ? 'text-red-400'
                      : teknikAnaliz.rsi < 30
                      ? 'text-green-400'
                      : 'text-blue-400'
                  }`}
                >
                  {teknikAnaliz.rsi}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-6 shadow-xl border border-purple-600/50">
                <div className="text-sm text-purple-200">MACD (Fark)</div>
                <div
                  className={`text-4xl font-extrabold ${
                    teknikAnaliz.macd.macd > teknikAnaliz.macd.signal ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {teknikAnaliz.macd.macd}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-3xl p-6 shadow-xl border border-green-600/50">
                <div className="text-sm text-green-200">Destek Seviyesi</div>
                <div className="text-4xl font-extrabold">₺{teknikAnaliz.destek.toFixed(2)}</div>
              </div>
              <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-3xl p-6 shadow-xl border border-red-600/50">
                <div className="text-sm text-red-200">Direnç Seviyesi</div>
                <div className="text-4xl font-extrabold">₺{teknikAnaliz.direnc.toFixed(2)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fiyat Grafiği */}
              <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">Fiyat Grafiği (Son 60 Gün)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={teknikAnaliz.gunlukFiyatlar}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="gun"
                      stroke="#9ca3af"
                      label={{ value: 'Gün', position: 'bottom', fill: '#9ca3af' }}
                    />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Line type="monotone" dataKey="fiyat" stroke="#3b82f6" strokeWidth={2} name="Fiyat (₺)" />
                    {/* Bollinger Bands (Simulated) */}
                    <Line
                      type="monotone"
                      dataKey={() => teknikAnaliz.bollinger.orta}
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="Ortalama"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Aracı Kurum Dağılımı */}
              <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">Aracı Kurum Dağılımı (Sim.)</h3>
                <div className="h-[300px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-700/80 backdrop-blur-sm">
                      <tr>
                        <th className="p-3 text-left">Kurum</th>
                        <th className="p-3 text-right">Alış %</th>
                        <th className="p-3 text-right">Satış %</th>
                        <th className="p-3 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {araciKurumlar.map((kurum) => (
                        <tr key={kurum.kurum} className="border-t border-slate-700 hover:bg-slate-700/50 transition">
                          <td className="p-3">{kurum.kurum}</td>
                          <td className="p-3 text-right text-green-400">{kurum.alis}%</td>
                          <td className="p-3 text-right text-red-400">{kurum.satis}%</td>
                          <td
                            className={`p-3 text-right font-medium ${kurum.net > 0 ? 'text-green-400' : 'text-red-400'}`}
                          >
                            {kurum.net > 0 ? '+' : ''}
                            {kurum.net}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Temel Analiz Tab (UNCHANGED) */}
        {activeTab === 'temel' && temelAnaliz && (
          <div className="space-y-8">
            <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
              <label className="block text-xl font-semibold mb-4 text-blue-300">Hisse Seçin</label>
              <select
                value={seciliHisse}
                onChange={(e) => setSeciliHisse(e.target.value)}
                className="w-full md:w-96 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-blue-500 focus:border-blue-500 transition"
              >
                {hisseler.map((hisse) => (
                  <option key={hisse.kod} value={hisse.kod}>
                    {hisse.kod} - {hisse.sektor}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 shadow-xl border border-blue-600/50">
                <div className="text-sm text-blue-200">Fiyat/Kazanç (F/K)</div>
                <div className="text-4xl font-extrabold">{temelAnaliz.fk}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-6 shadow-xl border border-purple-600/50">
                <div className="text-sm text-purple-200">PD/Defter Değeri</div>
                <div className="text-4xl font-extrabold">{temelAnaliz.pd}</div>
              </div>
              <div className="bg-gradient-to-br from-pink-700 to-pink-900 rounded-3xl p-6 shadow-xl border border-pink-600/50">
                <div className="text-sm text-pink-200">Özsermaye Karlılığı (ROE)</div>
                <div className="text-4xl font-extrabold">%{temelAnaliz.roe}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-700 to-orange-900 rounded-3xl p-6 shadow-xl border border-orange-600/50">
                <div className="text-sm text-orange-200">Net Kar Marjı</div>
                <div className="text-4xl font-extrabold">%{temelAnaliz.karMarji.toFixed(1)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Çeyreksel Performans Grafiği */}
              <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">Çeyreksel Satış ve Kar (Milyon ₺)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={temelAnaliz.ceyrekSatis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="ceyrek" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Legend />
                    <Bar dataKey="satis" fill="#3b82f6" name="Satışlar" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="kar" fill="#10b981" name="Net Kar" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Analist ve Hedef Fiyat Kartları */}
              <div className="flex flex-col space-y-6">
                <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700 flex-grow">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300">Analist Tavsiyeleri</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg p-2 rounded-lg bg-green-900/40 border-l-4 border-green-400">
                      <span>Al</span>
                      <span className="text-green-400 font-bold">{temelAnaliz.analistTavsiye.al}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg p-2 rounded-lg bg-yellow-900/40 border-l-4 border-yellow-400">
                      <span>Tut</span>
                      <span className="text-yellow-400 font-bold">{temelAnaliz.analistTavsiye.tut}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg p-2 rounded-lg bg-red-900/40 border-l-4 border-red-400">
                      <span>Sat</span>
                      <span className="text-red-400 font-bold">{temelAnaliz.analistTavsiye.sat}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-700 to-purple-800 rounded-3xl p-6 shadow-2xl border border-blue-600/50">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300">Ortalama Hedef Fiyat</h3>
                  <div className="text-center">
                    <div className="text-5xl font-extrabold text-blue-300 mb-2">
                      ₺{temelAnaliz.hedefFiyat.toFixed(2)}
                    </div>
                    <div className="text-green-400 text-lg font-semibold">
                      +
                      {(
                        (temelAnaliz.hedefFiyat / hisseler.find((hisse) => hisse.kod === seciliHisse).fiyat - 1) *
                        100
                      ).toFixed(1)}
                      % Potansiyel
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiBorsaUygulamasi;
