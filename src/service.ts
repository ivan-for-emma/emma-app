import Chance from 'chance';
import { BrokerApi } from './broker';
import { Algorithm, BasicAlgorithm, CpaAlgorithm } from './config';
import { weightedRandom } from './utils/weighted-random';

export class Service {
  chance: Chance.Chance;
  brokerApi: BrokerApi;
  algorithm: Algorithm;

  state: {
    value: number;
    count: number;
    cpa: number;
  };

  constructor({ seed, algorithm }: { seed: number; algorithm: Algorithm }) {
    this.chance = new Chance(seed);
    this.algorithm = algorithm;
    this.brokerApi = new BrokerApi();

    this.state = {
      value: (algorithm.type === 'CPA' && algorithm.state?.value) || 0,
      count: (algorithm.type === 'CPA' && algorithm.state?.count) || 0,
      cpa: 0,
    };

    if (this.state.count > 0) {
      this.state.cpa = this.state.value / this.state.count;
    }
  }

  async claimFreeShare(accountId: string) {
    const prices = await this.brokerApi.getRewardsAccountPositions();
    const share =
      this.algorithm.type === 'basic'
        ? this.findAvailableShareBasic(prices, this.algorithm)
        : this.findAvailableShareCPA(prices, this.algorithm);

    if (!share) {
      throw new Error(`no available shares`);
    }

    const result = await this.brokerApi.moveSharesFromRewardsAccount(
      accountId,
      share.tickerSymbol,
      1
    );

    this.state.value += share.sharePrice;
    this.state.count++;
    this.state.cpa = this.state.value / this.state.count;

    return { result, share };
  }

  findAvailableShareBasic(
    prices: { tickerSymbol: string; quantity: number; sharePrice: number }[],
    algorithm: BasicAlgorithm
  ) {
    const randomResult = weightedRandom(this.chance, algorithm.weights);
    const bucket = algorithm.weights[randomResult];

    return prices.find(
      ({ sharePrice, quantity }) =>
        sharePrice >= bucket.min && sharePrice <= bucket.max && quantity > 0
    );
  }

  findAvailableShareCPA(
    prices: { tickerSymbol: string; quantity: number; sharePrice: number }[],
    algorithm: CpaAlgorithm
  ) {
    let minDiff: number = Number.MAX_VALUE;
    let share: { tickerSymbol: string; quantity: number; sharePrice: number };

    prices.forEach((aShare) => {
      if (
        aShare.sharePrice <= algorithm.minPrice &&
        aShare.sharePrice >= algorithm.maxPrice
      ) {
        return;
      }

      const expectedCpa =
        (aShare.sharePrice + this.state.value) / (this.state.count + 1);
      const diff = Math.abs(expectedCpa - algorithm.targetCPA);

      if (diff < minDiff) {
        share = aShare;
        minDiff = diff;
      }
    });

    return share;
  }

  async getShares() {
    const tickers = await this.brokerApi.listTradableAssets();
    const shares = await Promise.all(
      tickers.map(async ({ tickerSymbol }) => {
        const { sharePrice } = await this.brokerApi.getLatestPrice(
          tickerSymbol
        );
        return { tickerSymbol, sharePrice };
      })
    );

    return shares;
  }

  async buyShares(targets: { tickerSymbol: string; quantity: number }[]) {
    const result = [];
    let totalPrice = 0;

    for (const target of targets) {
      const { sharePricePaid } = await this.brokerApi.buySharesInRewardsAccount(
        target.tickerSymbol,
        target.quantity
      );

      result.push({
        ...target,
        sharePricePaid,
      });

      totalPrice += sharePricePaid;
    }

    return {
      result,
      totalPrice,
    };
  }
}
