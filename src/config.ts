import { cleanEnv, num, json } from 'envalid';

export const env = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
  WEIGHTS: json<Weight[]>({
    default: [
      { min: 3, max: 10, weight: 95 },
      { min: 10, max: 25, weight: 3 },
      { min: 25, max: 200, weight: 2 },
    ],
  }),
});

export interface Weight {
  min: number;
  max: number;
  weight: number;
}
