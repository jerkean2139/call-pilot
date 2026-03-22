// WHO Child Growth Standards - simplified percentile data
// Weight (lbs), Height (inches), Head Circumference (inches)
// Data for ages 0-36 months, percentiles: 3rd, 15th, 50th, 85th, 97th

interface PercentilePoint {
  ageMonths: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

// Weight-for-age (lbs) - Boys (WHO approximation)
export const weightBoysLbs: PercentilePoint[] = [
  { ageMonths: 0, p3: 5.5, p15: 6.2, p50: 7.3, p85: 8.4, p97: 9.3 },
  { ageMonths: 1, p3: 7.1, p15: 8.0, p50: 9.4, p85: 10.8, p97: 11.9 },
  { ageMonths: 2, p3: 8.8, p15: 10.0, p50: 11.5, p85: 13.2, p97: 14.5 },
  { ageMonths: 3, p3: 10.2, p15: 11.5, p50: 13.2, p85: 15.0, p97: 16.5 },
  { ageMonths: 4, p3: 11.2, p15: 12.7, p50: 14.6, p85: 16.5, p97: 18.1 },
  { ageMonths: 5, p3: 12.0, p15: 13.6, p50: 15.6, p85: 17.6, p97: 19.4 },
  { ageMonths: 6, p3: 12.7, p15: 14.4, p50: 16.5, p85: 18.7, p97: 20.5 },
  { ageMonths: 9, p3: 14.3, p15: 16.2, p50: 18.5, p85: 20.9, p97: 23.0 },
  { ageMonths: 12, p3: 15.7, p15: 17.8, p50: 20.3, p85: 22.9, p97: 25.1 },
  { ageMonths: 15, p3: 16.8, p15: 19.0, p50: 21.8, p85: 24.6, p97: 27.0 },
  { ageMonths: 18, p3: 17.8, p15: 20.2, p50: 23.1, p85: 26.1, p97: 28.7 },
  { ageMonths: 24, p3: 19.6, p15: 22.3, p50: 25.6, p85: 29.1, p97: 32.0 },
  { ageMonths: 30, p3: 21.2, p15: 24.2, p50: 27.9, p85: 31.8, p97: 35.1 },
  { ageMonths: 36, p3: 22.7, p15: 26.0, p50: 30.0, p85: 34.3, p97: 38.0 },
];

// Weight-for-age (lbs) - Girls
export const weightGirlsLbs: PercentilePoint[] = [
  { ageMonths: 0, p3: 5.1, p15: 5.8, p50: 6.8, p85: 7.9, p97: 8.7 },
  { ageMonths: 1, p3: 6.5, p15: 7.4, p50: 8.6, p85: 9.9, p97: 10.9 },
  { ageMonths: 2, p3: 7.9, p15: 9.0, p50: 10.4, p85: 12.0, p97: 13.2 },
  { ageMonths: 3, p3: 9.0, p15: 10.3, p50: 11.9, p85: 13.6, p97: 15.0 },
  { ageMonths: 4, p3: 9.9, p15: 11.3, p50: 13.0, p85: 14.9, p97: 16.4 },
  { ageMonths: 5, p3: 10.6, p15: 12.1, p50: 13.9, p85: 15.9, p97: 17.5 },
  { ageMonths: 6, p3: 11.2, p15: 12.8, p50: 14.7, p85: 16.8, p97: 18.5 },
  { ageMonths: 9, p3: 12.6, p15: 14.3, p50: 16.5, p85: 18.9, p97: 20.8 },
  { ageMonths: 12, p3: 13.8, p15: 15.7, p50: 18.1, p85: 20.7, p97: 22.8 },
  { ageMonths: 15, p3: 14.8, p15: 16.9, p50: 19.5, p85: 22.3, p97: 24.6 },
  { ageMonths: 18, p3: 15.8, p15: 18.0, p50: 20.7, p85: 23.8, p97: 26.2 },
  { ageMonths: 24, p3: 17.5, p15: 20.1, p50: 23.1, p85: 26.6, p97: 29.4 },
  { ageMonths: 30, p3: 19.1, p15: 21.9, p50: 25.4, p85: 29.3, p97: 32.5 },
  { ageMonths: 36, p3: 20.5, p15: 23.6, p50: 27.5, p85: 31.8, p97: 35.3 },
];

// Height-for-age (inches) - Boys
export const heightBoysIn: PercentilePoint[] = [
  { ageMonths: 0, p3: 18.1, p15: 18.7, p50: 19.7, p85: 20.5, p97: 21.1 },
  { ageMonths: 1, p3: 19.5, p15: 20.2, p50: 21.2, p85: 22.0, p97: 22.6 },
  { ageMonths: 2, p3: 20.8, p15: 21.5, p50: 22.6, p85: 23.4, p97: 24.1 },
  { ageMonths: 3, p3: 21.8, p15: 22.6, p50: 23.8, p85: 24.6, p97: 25.4 },
  { ageMonths: 4, p3: 22.7, p15: 23.5, p50: 24.7, p85: 25.7, p97: 26.4 },
  { ageMonths: 6, p3: 24.0, p15: 24.9, p50: 26.2, p85: 27.3, p97: 28.1 },
  { ageMonths: 9, p3: 25.8, p15: 26.8, p50: 28.2, p85: 29.4, p97: 30.3 },
  { ageMonths: 12, p3: 27.3, p15: 28.4, p50: 29.9, p85: 31.2, p97: 32.1 },
  { ageMonths: 18, p3: 29.6, p15: 30.8, p50: 32.4, p85: 33.9, p97: 34.9 },
  { ageMonths: 24, p3: 31.5, p15: 32.8, p50: 34.6, p85: 36.2, p97: 37.3 },
  { ageMonths: 30, p3: 33.2, p15: 34.6, p50: 36.5, p85: 38.2, p97: 39.4 },
  { ageMonths: 36, p3: 34.7, p15: 36.2, p50: 38.2, p85: 40.0, p97: 41.2 },
];

// Height-for-age (inches) - Girls
export const heightGirlsIn: PercentilePoint[] = [
  { ageMonths: 0, p3: 17.7, p15: 18.3, p50: 19.3, p85: 20.1, p97: 20.7 },
  { ageMonths: 1, p3: 19.0, p15: 19.7, p50: 20.7, p85: 21.5, p97: 22.1 },
  { ageMonths: 2, p3: 20.1, p15: 20.9, p50: 21.9, p85: 22.8, p97: 23.5 },
  { ageMonths: 3, p3: 21.1, p15: 21.9, p50: 23.0, p85: 23.9, p97: 24.6 },
  { ageMonths: 4, p3: 21.9, p15: 22.8, p50: 23.9, p85: 24.9, p97: 25.6 },
  { ageMonths: 6, p3: 23.2, p15: 24.1, p50: 25.4, p85: 26.5, p97: 27.3 },
  { ageMonths: 9, p3: 25.0, p15: 26.0, p50: 27.4, p85: 28.6, p97: 29.5 },
  { ageMonths: 12, p3: 26.4, p15: 27.5, p50: 29.1, p85: 30.4, p97: 31.3 },
  { ageMonths: 18, p3: 28.8, p15: 30.1, p50: 31.7, p85: 33.2, p97: 34.2 },
  { ageMonths: 24, p3: 30.8, p15: 32.2, p50: 33.9, p85: 35.6, p97: 36.7 },
  { ageMonths: 30, p3: 32.6, p15: 34.0, p50: 35.9, p85: 37.7, p97: 38.8 },
  { ageMonths: 36, p3: 34.1, p15: 35.6, p50: 37.6, p85: 39.4, p97: 40.7 },
];

export function getPercentileData(
  metric: 'weight' | 'height' | 'head',
  gender?: 'boy' | 'girl' | 'other'
): PercentilePoint[] | null {
  if (metric === 'head') return null; // Head circumference percentiles are less commonly needed
  const isBoy = gender !== 'girl';
  if (metric === 'weight') return isBoy ? weightBoysLbs : weightGirlsLbs;
  return isBoy ? heightBoysIn : heightGirlsIn;
}
