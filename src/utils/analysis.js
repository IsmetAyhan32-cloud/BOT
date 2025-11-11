export const BROKER_DISTRIBUTION = [
  { kurum: 'Garanti Yatırım', alis: 25, satis: 18, net: 7 },
  { kurum: 'İş Yatırım', alis: 22, satis: 20, net: 2 },
  { kurum: 'Yapı Kredi Yatırım', alis: 18, satis: 22, net: -4 },
  { kurum: 'Ak Yatırım', alis: 20, satis: 15, net: 5 },
  { kurum: 'Halk Yatırım', alis: 15, satis: 19, net: -4 },
];

const clampTwoDecimals = (value) => Number.parseFloat(value.toFixed(2));

export const generateTechnicalAnalysis = (stock) => {
  if (!stock) {
    return null;
  }

  const gunlukFiyatlar = [];
  let fiyat = stock.fiyat;
  for (let i = 60; i >= 0; i -= 1) {
    fiyat = fiyat * (1 + (Math.random() - 0.5) * 0.03);
    gunlukFiyatlar.push({
      gun: 60 - i,
      fiyat: Number.parseFloat(fiyat.toFixed(2)),
      hacim: Math.floor(Math.random() * 5_000_000 + 1_000_000),
    });
  }

  return {
    gunlukFiyatlar,
    rsi: clampTwoDecimals(45 + Math.random() * 30),
    macd: {
      macd: clampTwoDecimals(Math.random() - 0.5),
      signal: clampTwoDecimals(Math.random() - 0.5),
    },
    bollinger: { ust: stock.fiyat * 1.05, orta: stock.fiyat, alt: stock.fiyat * 0.95 },
    destek: stock.fiyat * 0.92,
    direnc: stock.fiyat * 1.08,
  };
};

export const generateFundamentalAnalysis = (stock) => {
  if (!stock) {
    return null;
  }

  return {
    fk: clampTwoDecimals(8 + Math.random() * 12),
    pd: clampTwoDecimals(0.5 + Math.random() * 2),
    roe: clampTwoDecimals(10 + Math.random() * 20),
    karMarji: clampTwoDecimals(5 + Math.random() * 15),
    borcOrani: clampTwoDecimals(20 + Math.random() * 40),
    ceyrekSatis: [
      { ceyrek: 'Ç1', satis: 1200, kar: 180 },
      { ceyrek: 'Ç2', satis: 1350, kar: 210 },
      { ceyrek: 'Ç3', satis: 1480, kar: 245 },
      { ceyrek: 'Ç4', satis: 1620, kar: 285 },
    ],
    analistTavsiye: { al: 8, tut: 3, sat: 2 },
    hedefFiyat: stock.fiyat * 1.15,
  };
};

export const generatePriceForecast = (stock) => {
  if (!stock) {
    return null;
  }

  const tahminler = [];
  for (let gun = 1; gun <= 7; gun += 1) {
    const tahmin = stock.fiyat * (1 + (stock.yillikGetiri / 252) * gun + (Math.random() - 0.5) * 0.02);
    const aralik = tahmin * stock.volatilite * 0.6;
    tahminler.push({
      gun,
      tahmin: Number.parseFloat(tahmin.toFixed(2)),
      min: Number.parseFloat((tahmin - aralik).toFixed(2)),
      max: Number.parseFloat((tahmin + aralik).toFixed(2)),
    });
  }

  return {
    guncel: stock.fiyat,
    tahminler,
    mae: Number.parseFloat((stock.volatilite * stock.fiyat * 0.08).toFixed(2)),
    rSquare: Number.parseFloat((0.75 + Math.random() * 0.2).toFixed(2)),
  };
};
