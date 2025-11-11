import { describe, expect, it } from 'vitest';
import {
  deriveWeightsFromHoldings,
  runMonteCarloSimulation,
  __private__,
} from './simulation';

const createDeterministicRandom = (sequence) => {
  let index = 0;
  return () => {
    const value = sequence[index % sequence.length];
    index += 1;
    return value;
  };
};

describe('deriveWeightsFromHoldings', () => {
  it('normalizes holding values into weights', () => {
    const holdings = [
      { kod: 'AAA', miktar: 10, maliyet: 5 },
      { kod: 'BBB', miktar: 5, maliyet: 20 },
    ];

    const stocks = [
      { kod: 'AAA', fiyat: 8 },
      { kod: 'BBB', fiyat: 12 },
    ];

    const weights = deriveWeightsFromHoldings(holdings, stocks);

    expect(weights).toEqual([
      { kod: 'AAA', weight: 0.5714285714285714 },
      { kod: 'BBB', weight: 0.42857142857142855 },
    ]);
  });

  it('returns empty array when holdings have no value', () => {
    const weights = deriveWeightsFromHoldings(
      [{ kod: 'CCC', miktar: 0, maliyet: 5 }],
      [{ kod: 'CCC', fiyat: 10 }],
    );

    expect(weights).toEqual([]);
  });
});

describe('runMonteCarloSimulation', () => {
  const stockUniverse = [
    { kod: 'AAA', yillikGetiri: 0.1, volatilite: 0.2 },
    { kod: 'BBB', yillikGetiri: 0.15, volatilite: 0.25 },
  ];

  it('produces deterministic results with seeded randomness', () => {
    const result = runMonteCarloSimulation({
      portfolioWeights: [
        { kod: 'AAA', weight: 0.6 },
        { kod: 'BBB', weight: 0.4 },
      ],
      stockUniverse,
      initialCapital: 1000,
      days: 1,
      simulations: 2,
      randomFn: createDeterministicRandom([0.135, 0.864, 0.5, 0.5]),
    });

    expect(result.timeSeries).toHaveLength(2);
    expect(result.timeSeries[0].mean).toBeCloseTo(1000, 6);
    expect(result.timeSeries[1].mean).toBeCloseTo(999.5627289145643, 6);
    expect(result.summary.expectedFinalValue).toBeCloseTo(999.5627289145643, 6);
    expect(result.summary.probabilityOfLoss).toBeCloseTo(0.5, 6);

    const totalSimulations = result.distribution.reduce(
      (sum, bucket) => sum + bucket.count,
      0,
    );
    expect(totalSimulations).toBe(2);
  });
});

describe('computePercentile', () => {
  it('interpolates percentile within sorted values', () => {
    const values = [1, 3, 5, 7, 9];
    expect(__private__.computePercentile(values, 50)).toBe(5);
    expect(__private__.computePercentile(values, 10)).toBeCloseTo(1.8, 6);
    expect(__private__.computePercentile(values, 90)).toBeCloseTo(8.2, 6);
  });
});
