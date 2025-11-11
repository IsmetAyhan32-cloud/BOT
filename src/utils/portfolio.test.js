import { describe, it, expect } from 'vitest';
import { optimizePortfolio, calculatePortfolioMetrics } from './portfolio.js';

const sampleStocks = [
  { kod: 'AAA', sektor: 'Tech', fiyat: 100, yillikGetiri: 0.3, volatilite: 0.25 },
  { kod: 'BBB', sektor: 'Finance', fiyat: 200, yillikGetiri: 0.2, volatilite: 0.2 },
  { kod: 'CCC', sektor: 'Energy', fiyat: 150, yillikGetiri: 0.18, volatilite: 0.22 },
  { kod: 'DDD', sektor: 'Retail', fiyat: 90, yillikGetiri: 0.16, volatilite: 0.18 },
  { kod: 'EEE', sektor: 'Utilities', fiyat: 80, yillikGetiri: 0.14, volatilite: 0.15 },
  { kod: 'FFF', sektor: 'Health', fiyat: 110, yillikGetiri: 0.22, volatilite: 0.19 },
  { kod: 'GGG', sektor: 'Industry', fiyat: 95, yillikGetiri: 0.19, volatilite: 0.21 },
  { kod: 'HHH', sektor: 'Materials', fiyat: 70, yillikGetiri: 0.17, volatilite: 0.2 },
];

describe('optimizePortfolio', () => {
  it('returns normalized weights that sum to 1', () => {
    const result = optimizePortfolio(sampleStocks, { riskFreeRate: 0.1, selectionCount: 6 });
    const weightSum = result.dagitim.reduce((sum, item) => sum + item.agirlik, 0);

    expect(weightSum).toBeCloseTo(1, 6);
    expect(result.dagitim.length).toBeGreaterThan(0);
  });

  it('respects max weight constraints', () => {
    const maxWeight = 0.25;
    const result = optimizePortfolio(sampleStocks, { maxWeight });

    const exceedsMax = result.dagitim.some((item) => item.agirlik > maxWeight + 1e-6);
    expect(exceedsMax).toBe(false);
  });

  it('handles empty stock arrays gracefully', () => {
    const result = optimizePortfolio([]);

    expect(result).toEqual({
      dagitim: [],
      beklenenGetiri: '0.00',
      sharpeOrani: '0.00',
      maxDusus: '0.00',
      sektorSayisi: 0,
    });
  });
});

describe('calculatePortfolioMetrics', () => {
  it('calculates totals and returns percentages with two decimals', () => {
    const holdings = [
      { kod: 'AAA', miktar: 10, maliyet: 80 },
      { kod: 'BBB', miktar: 5, maliyet: 150 },
    ];

    const expectedValue = 10 * 100 + 5 * 200;
    const expectedCost = 10 * 80 + 5 * 150;
    const expectedProfit = expectedValue - expectedCost;
    const expectedReturn = (expectedProfit / expectedCost) * 100;

    const result = calculatePortfolioMetrics(holdings, sampleStocks);

    expect(result.toplamDeger).toBe(expectedValue.toFixed(2));
    expect(result.toplamMaliyet).toBe(expectedCost.toFixed(2));
    expect(result.karZarar).toBe(expectedProfit.toFixed(2));
    expect(result.getiriYuzdesi).toBe(expectedReturn.toFixed(2));
  });

  it('returns zeros for empty holdings', () => {
    const result = calculatePortfolioMetrics([], sampleStocks);

    expect(result).toEqual({
      toplamDeger: '0.00',
      toplamMaliyet: '0.00',
      karZarar: '0.00',
      getiriYuzdesi: '0.00',
    });
  });
});
