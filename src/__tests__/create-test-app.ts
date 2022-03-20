import axios, { AxiosInstance } from 'axios';
import { promisify } from 'util';
import { Algorithm } from '../config';
import { createApp } from '../server';

export interface TestAppContext {
  agent: AxiosInstance;
  close: () => Promise<void>;
}

export async function createTestApp({
  seed,
  algorithm,
}: {
  seed: number;
  algorithm: Algorithm;
}): Promise<TestAppContext> {
  const { fastify } = createApp({
    seed,
    algorithm,
  });
  await fastify.listen(0); // 0 means random port

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
