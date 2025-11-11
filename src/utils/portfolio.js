/**
 * Calculate an optimized portfolio using a simplified Sharpe ratio heuristic.
 *
 * @param {Array} stocks - Array of stock objects with keys: kod, yillikGetiri, volatilite, sektor.
 * @param {Object} options - Configuration options for the optimization.
 * @param {number} [options.riskFreeRate=0.1] - Risk free rate expressed as a decimal.
 * @param {number} [options.maxWeight=0.3] - Maximum individual asset weight in the optimized portfolio.
 * @param {number} [options.minWeight=0.05] - Minimum threshold weight for inclusion.
 * @param {number} [options.selectionCount=8] - Number of top scoring assets to consider.
 * @returns {{dagitim: Array, beklenenGetiri: string, sharpeOrani: string, maxDusus: string, sektorSayisi: number}}
 */
export function optimizePortfolio(
  stocks,
  {
    riskFreeRate = 0.1,
    maxWeight = 0.3,
    minWeight = 0.05,
    selectionCount = 8,
  } = {}
) {
  if (!Array.isArray(stocks) || stocks.length === 0) {
    return {
      dagitim: [],
      beklenenGetiri: '0.00',
      sharpeOrani: '0.00',
      maxDusus: '0.00',
      sektorSayisi: 0,
    };
  }

  const scored = stocks
    .map((stock) => ({
      ...stock,
      skor: stock.volatilite !== 0 ? (stock.yillikGetiri - riskFreeRate) / stock.volatilite : -Infinity,
    }))
    .sort((a, b) => b.skor - a.skor)
    .slice(0, selectionCount);

  let totalWeight = 0;
  const distribution = [];

  scored.forEach((stock, index) => {
    const remainingSlots = scored.length - index;
    const weight = Math.min(maxWeight, (1 - totalWeight) / remainingSlots);

    if (weight >= minWeight) {
      distribution.push({ ...stock, agirlik: weight });
      totalWeight += weight;
    }
  });

  if (distribution.length === 0 || totalWeight === 0) {
    return {
      dagitim: [],
      beklenenGetiri: '0.00',
      sharpeOrani: '0.00',
      maxDusus: '0.00',
      sektorSayisi: 0,
    };
  }

  const normalizer = 1 / totalWeight;
  const normalizedDistribution = distribution.map((entry) => ({
    ...entry,
    agirlik: entry.agirlik * normalizer,
  }));

  const expectedReturn = normalizedDistribution.reduce(
    (sum, entry) => sum + entry.yillikGetiri * entry.agirlik,
    0,
  );

  const portfolioVolatility = Math.sqrt(
    normalizedDistribution.reduce(
      (sum, entry) => sum + (entry.volatilite * entry.agirlik) ** 2,
      0,
    ),
  );

  const sharpeRatio = portfolioVolatility
    ? (expectedReturn - riskFreeRate) / portfolioVolatility
    : 0;

  return {
    dagitim: normalizedDistribution,
    beklenenGetiri: (expectedReturn * 100).toFixed(2),
    sharpeOrani: sharpeRatio.toFixed(2),
    maxDusus: (-18).toFixed(2),
    sektorSayisi: new Set(normalizedDistribution.map((entry) => entry.sektor)).size,
  };
}

/**
 * Calculate portfolio metrics using holdings and market data.
 *
 * @param {Array} holdings - Array of holdings containing kod, miktar, maliyet.
 * @param {Array} stocks - Array of stock information with kod and fiyat.
 * @returns {{toplamDeger: string, toplamMaliyet: string, karZarar: string, getiriYuzdesi: string}}
 */
export function calculatePortfolioMetrics(holdings, stocks) {
  if (!Array.isArray(holdings) || holdings.length === 0) {
    return {
      toplamDeger: '0.00',
      toplamMaliyet: '0.00',
      karZarar: '0.00',
      getiriYuzdesi: '0.00',
    };
  }

  let totalCost = 0;
  let totalValue = 0;

  holdings.forEach((holding) => {
    const stockData = stocks.find((stock) => stock.kod === holding.kod);
    if (!stockData) return;

    const cost = holding.miktar * holding.maliyet;
    const value = holding.miktar * stockData.fiyat;
    totalCost += cost;
    totalValue += value;
  });

  const profit = totalValue - totalCost;
  const returnPct = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  return {
    toplamDeger: totalValue.toFixed(2),
    toplamMaliyet: totalCost.toFixed(2),
    karZarar: profit.toFixed(2),
    getiriYuzdesi: returnPct.toFixed(2),
  };
}
