const TRADING_DAYS_PER_YEAR = 252;

const clampPercentile = (value) => {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

const computePercentile = (sortedValues, percentile) => {
  if (!sortedValues.length) {
    return 0;
  }

  if (sortedValues.length === 1) {
    return sortedValues[0];
  }

  const clamped = clampPercentile(percentile);
  const rank = (clamped / 100) * (sortedValues.length - 1);
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);
  const weight = rank - lowerIndex;

  if (upperIndex >= sortedValues.length) {
    return sortedValues[lowerIndex];
  }

  return (
    sortedValues[lowerIndex] +
    (sortedValues[upperIndex] - sortedValues[lowerIndex]) * weight
  );
};

const createNormalGenerator = (randomFn) => {
  let spare = null;

  return () => {
    if (spare !== null) {
      const value = spare;
      spare = null;
      return value;
    }

    let u1 = 0;
    let u2 = 0;

    while (u1 === 0) {
      u1 = randomFn();
    }
    while (u2 === 0) {
      u2 = randomFn();
    }

    const magnitude = Math.sqrt(-2.0 * Math.log(u1));
    const z0 = magnitude * Math.cos(2.0 * Math.PI * u2);
    const z1 = magnitude * Math.sin(2.0 * Math.PI * u2);

    spare = z1;
    return z0;
  };
};

export const deriveWeightsFromHoldings = (holdings, stockUniverse) => {
  if (!Array.isArray(holdings) || !Array.isArray(stockUniverse)) {
    return [];
  }

  const valuations = holdings
    .map((holding) => {
      const stock = stockUniverse.find((item) => item.kod === holding.kod);

      if (!stock) {
        return null;
      }

      const quantity = Number(holding.miktar);
      const cost = Number(holding.maliyet);

      if (!Number.isFinite(quantity) || !Number.isFinite(cost)) {
        return null;
      }

      const currentValue = quantity * stock.fiyat;

      if (!Number.isFinite(currentValue) || currentValue <= 0) {
        return null;
      }

      return {
        kod: holding.kod,
        value: currentValue,
      };
    })
    .filter(Boolean);

  const totalValue = valuations.reduce((sum, item) => sum + item.value, 0);

  if (!Number.isFinite(totalValue) || totalValue <= 0) {
    return [];
  }

  return valuations.map((item) => ({
    kod: item.kod,
    weight: item.value / totalValue,
  }));
};

export const runMonteCarloSimulation = ({
  portfolioWeights,
  stockUniverse,
  initialCapital,
  days,
  simulations,
  randomFn = Math.random,
}) => {
  if (!Array.isArray(portfolioWeights) || portfolioWeights.length === 0) {
    throw new Error('Simülasyon için portföy ağırlıkları bulunamadı.');
  }

  if (!Array.isArray(stockUniverse) || stockUniverse.length === 0) {
    throw new Error('Geçerli bir hisse listesi gerekli.');
  }

  if (!Number.isFinite(initialCapital) || initialCapital <= 0) {
    throw new Error('Geçerli bir başlangıç sermayesi girilmelidir.');
  }

  if (!Number.isInteger(days) || days <= 0) {
    throw new Error('Simülasyon süresi en az 1 gün olmalıdır.');
  }

  if (!Number.isInteger(simulations) || simulations <= 0) {
    throw new Error('Simülasyon sayısı en az 1 olmalıdır.');
  }

  const enrichedWeights = portfolioWeights
    .map((weightItem) => {
      const stock = stockUniverse.find((item) => item.kod === weightItem.kod);

      if (!stock) {
        return null;
      }

      return {
        kod: weightItem.kod,
        weight: Number(weightItem.weight),
        stock,
      };
    })
    .filter(Boolean);

  const totalWeight = enrichedWeights.reduce((sum, item) => sum + item.weight, 0);

  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    throw new Error('Portföy ağırlıkları toplamı 0 olamaz.');
  }

  const normalizedWeights = enrichedWeights.map((item) => ({
    ...item,
    weight: item.weight / totalWeight,
  }));

  const annualReturn = normalizedWeights.reduce(
    (sum, item) => sum + item.weight * item.stock.yillikGetiri,
    0,
  );
  const annualVolatility = Math.sqrt(
    normalizedWeights.reduce(
      (sum, item) => sum + (item.weight * item.stock.volatilite) ** 2,
      0,
    ),
  );

  const dailyReturn = annualReturn / TRADING_DAYS_PER_YEAR;
  const dailyVolatility = annualVolatility / Math.sqrt(TRADING_DAYS_PER_YEAR);

  const generateNormal = createNormalGenerator(randomFn);

  const timeSeriesValues = Array.from({ length: days + 1 }, () => []);
  const finalValues = [];

  for (let simulationIndex = 0; simulationIndex < simulations; simulationIndex += 1) {
    let value = initialCapital;
    timeSeriesValues[0].push(value);

    for (let dayIndex = 1; dayIndex <= days; dayIndex += 1) {
      const shock = generateNormal();
      const growthFactor = Math.exp(
        dailyReturn - 0.5 * dailyVolatility ** 2 + dailyVolatility * shock,
      );

      value *= growthFactor;
      timeSeriesValues[dayIndex].push(value);
    }

    finalValues.push(value);
  }

  const timeSeries = timeSeriesValues.map((values, index) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

    return {
      day: index,
      mean,
      p10: computePercentile(sorted, 10),
      p50: computePercentile(sorted, 50),
      p90: computePercentile(sorted, 90),
    };
  });

  const finalStats = timeSeries[timeSeries.length - 1];
  const probabilityOfLoss =
    finalValues.filter((value) => value < initialCapital).length / simulations;

  const finalSorted = [...finalValues].sort((a, b) => a - b);
  const minValue = finalSorted[0];
  const maxValue = finalSorted[finalSorted.length - 1];
  const binCount = Math.min(20, Math.max(5, Math.round(Math.sqrt(simulations))));
  const binSize = maxValue === minValue ? 1 : (maxValue - minValue) / binCount;

  const distribution = Array.from({ length: binCount }, (_, index) => ({
    binStart: minValue + binSize * index,
    binEnd:
      index === binCount - 1
        ? maxValue
        : minValue + binSize * (index + 1),
    count: 0,
  }));

  finalValues.forEach((value) => {
    const index =
      binSize === 0
        ? 0
        : Math.min(
            distribution.length - 1,
            Math.floor((value - minValue) / binSize),
          );

    distribution[index].count += 1;
  });

  return {
    timeSeries,
    distribution,
    summary: {
      expectedFinalValue: finalStats.mean,
      medianFinalValue: finalStats.p50,
      bestCase: finalStats.p90,
      worstCase: finalStats.p10,
      expectedReturnPct: ((finalStats.mean / initialCapital) - 1) * 100,
      bestReturnPct: ((finalStats.p90 / initialCapital) - 1) * 100,
      worstReturnPct: ((finalStats.p10 / initialCapital) - 1) * 100,
      probabilityOfLoss,
    },
  };
};

export const __private__ = {
  computePercentile,
  createNormalGenerator,
};

