import { cleanEnv, num, json, str } from 'envalid';

export const env = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
  ALGORITHM: str({ choices: ['CPA', 'basic'], default: 'basic' }),
  TARGET_CPA: num({ default: 0 }),
  MIN_PRICE: num({ default: 0 }),
  MAX_PRICE: num({ default: 0 }),
  WEIGHTS: json<Weight[]>({
    default: [
      { min: 3, max: 10, weight: 95 },
      { min: 10, max: 25, weight: 3 },
      { min: 25, max: 200, weight: 2 },
    ],
  }),
});

if (env.ALGORITHM === 'CPA' && !env.TARGET_CPA) {
  throw new Error(`TARGET_CPA is required with ALGORITHM=CPA`);
}

if (env.ALGORITHM === 'CPA' && !env.MIN_PRICE) {
  throw new Error(`MIN_PRICE is required with ALGORITHM=CPA`);
}

if (env.ALGORITHM === 'CPA' && !env.MAX_PRICE) {
  throw new Error(`MAX_PRICE is required with ALGORITHM=CPA`);
}

export interface Weight {
  min: number;
  max: number;
  weight: number;
}

export interface BasicAlgorithm {
  type: 'basic';
  weights: Weight[];
}

export interface CpaAlgorithm {
  type: 'CPA';
  minPrice: number;
  maxPrice: number;
  targetCPA: number;
  state?: {
    value: number;
    count: number;
  };
}

export type Algorithm = BasicAlgorithm | CpaAlgorithm;
