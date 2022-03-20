import axios, { AxiosInstance } from 'axios';
import { promisify } from 'util';
import { Weight } from '../config';
import { createApp } from '../server';

export interface TestAppContext {
  agent: AxiosInstance;
  close: () => Promise<void>;
}

export async function createTestApp({
  seed,
  weights,
}: {
  seed: number;
  weights: Weight[];
}): Promise<TestAppContext> {
  const { fastify } = createApp({
    seed,
    weights,
  });
  await fastify.listen(0);

  const address = fastify.server.address();
  if (typeof address === 'string') {
    throw new Error(`unexpected string`);
  }

  const agent = axios.create({
    baseURL: `http://localhost:${address.port}`,
  });

  return {
    agent,
    async close() {
      await promisify(fastify.server.close.bind(fastify.server))();
    },
  };
}
