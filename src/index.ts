import { createApp } from './server';
import { env } from './config';

const { fastify } = createApp({ seed: Math.random(), weights: env.WEIGHTS });
fastify.listen({ port: env.PORT }, (err) => {
  if (err) throw err;
});
