import Fastify from 'fastify';
import { env, Algorithm } from './config';
import { Service } from './service';

export function createApp({
  seed,
  algorithm,
}: {
  seed: number;
  algorithm: Algorithm;
}) {
  const fastify = Fastify({
    logger: !env.isTest,
  });

  const service = new Service({
    seed,
    algorithm,
  });

  fastify.post<{
    Body: { accountId: string };
  }>('/claim-free-share', async ({ body }, reply) => {
    const { result, share } = await service.claimFreeShare(body.accountId);

    if (result.success) {
      reply.send({ status: 'success', share });
    } else {
      reply.status(500).send({ status: 'error', code: 'internal-error' });
    }
  });

  fastify.get('/private/cpa', async (_req, reply) => {
    reply.send({ state: service.state });
  });

  fastify.get('/private/shares', async ({ body }, reply) => {
    const shares = await service.getShares();
    reply.send({ shares });
  });

  fastify.post<{
    Body: { targets: { tickerSymbol: string; quantity: number }[] };
  }>('/private/shares/buy', async ({ body }, reply) => {
    const { result, totalPrice } = await service.buyShares(body.targets);
    reply.send({ status: 'success', result, totalPrice });
  });

  return {
    fastify,
  };
}
