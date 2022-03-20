import { createApp } from './server';
import { env } from './config';

const { fastify } = createApp({
  seed: Math.random(),
  algorithm:
    env.ALGORITHM === 'basic'
      ? { type: 'basic', weights: env.WEIGHTS }
      : {
          type: 'CPA',
          targetCPA: env.TARGET_CPA,
          minPrice: env.MIN_PRICE,
          maxPrice: env.MAX_PRICE,
        },
});

fastify.listen({ port: env.PORT }, (err) => {
  if (err) throw err;
});
