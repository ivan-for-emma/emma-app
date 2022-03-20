import Fastify from 'fastify';
import Chance from 'chance';
import { BrokerApi } from './broker';
import { env, Weight } from './config';
import { weightedRandom } from './utils/weighted-random';

export function createApp({
  seed,
  weights,
}: {
  seed: number;
  weights: Weight[];
}) {
  const fastify = Fastify({
    logger: !env.isTest,
  });

  const chance = new Chance(seed);
  const brokerApi = new BrokerApi();

  fastify.post<{
    Body: { accountId: string };
  }>('/claim-free-share', async ({ body }, reply) => {
    const randomResult = weightedRandom(chance, weights);
    const bucket = env.WEIGHTS[randomResult];

    const prices = await brokerApi.getRewardsAccountPositions();
    const share = prices.find(
      ({ sharePrice, quantity }) =>
        sharePrice >= bucket.min && sharePrice <= bucket.max && quantity > 0
    );

    if (!share) {
      throw new Error(`no available shares`);
    }

    const result = await brokerApi.moveSharesFromRewardsAccount(
      body.accountId,
      share.tickerSymbol,
      1
    );

    if (result.success) {
      reply.send({ status: 'success', share });
    } else {
      reply.status(500).send({ status: 'error', code: 'internal-error' });
    }
  });

  fastify.get<{
    Body: { accountId: string };
  }>('/private/shares', async ({ body }, reply) => {
    const tickers = await brokerApi.listTradableAssets();
    const prices = await Promise.all(
      tickers.map(async ({ tickerSymbol }) => {
        const { sharePrice } = await brokerApi.getLatestPrice(tickerSymbol);
        return { tickerSymbol, sharePrice };
      })
    );

    reply.send({ prices });
  });

  fastify.post<{
    Body: { targets: { tickerSymbol: string; quantity: number }[] };
  }>('/private/shares/buy', async ({ body }, reply) => {
    const result = [];
    let totalPrice = 0;

    for (const target of body.targets) {
      const { sharePricePaid } = await brokerApi.buySharesInRewardsAccount(
        target.tickerSymbol,
        target.quantity
      );

      result.push({
        ...target,
        sharePricePaid,
      });

      totalPrice += sharePricePaid;
    }

    reply.send({ status: 'success', result, totalPrice });
  });

  return {
    fastify,
  };
}
