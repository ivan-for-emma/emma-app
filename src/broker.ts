export class BrokerApi implements IBrokerApi {
  tickers = {
    AA: {
      sharePrice: 5,
      quantity: 0,
    },
    BB: {
      sharePrice: 7,
      quantity: 0,
    },
    CC: {
      sharePrice: 10,
      quantity: 0,
    },
    DD: {
      sharePrice: 25,
      quantity: 0,
    },
    EE: {
      sharePrice: 150,
      quantity: 0,
    },
  } as Record<string, { quantity: number; sharePrice: number }>;

  tickerSymbols = Object.keys(this.tickers).map((tickerSymbol) => ({
    tickerSymbol,
  }));

  // To fetch a list of assets available for trading
  async listTradableAssets(): Promise<{ tickerSymbol: string }[]> {
    return this.tickerSymbols;
  }

  // To fetch the latest price for an asset
  async getLatestPrice(tickerSymbol: string): Promise<{ sharePrice: number }> {
    const ticker = this.tickers[tickerSymbol];

    if (!ticker) {
      throw new Error(`ticker not found: ${tickerSymbol}`);
    }

    return { sharePrice: ticker.sharePrice };
  }

  // To check if the stock market is currently open or closed
  async isMarketOpen(): Promise<{
    open: boolean;
    nextOpeningTime: string;
    nextClosingTime: string;
  }> {
    return {
      open: true,
      nextOpeningTime: new Date(Date.now() + 10 * 24 * 60 * 60).toISOString(),
      nextClosingTime: new Date(Date.now() + 20 * 24 * 60 * 60).toISOString(),
    };
  }

  // To purchase a share in our Firm's rewards account.
  // NOTE: this works only while the stock market is open otherwise throws an error.
  // NOTE 2: quantity is an integer, no fractional shares allowed.
  async buySharesInRewardsAccount(
    tickerSymbol: string,
    quantity: number
  ): Promise<{ success: boolean; sharePricePaid: number }> {
    const marketState = await this.isMarketOpen();

    if (!marketState.open) {
      throw new Error(`market is not opened`);
    }

    const latestPrice = await this.getLatestPrice(tickerSymbol);

    const ticker = this.tickers[tickerSymbol];
    if (!ticker) {
      throw new Error(`ticker not found: ${tickerSymbol}`);
    }

    ticker.quantity += quantity;

    return {
      success: true,
      sharePricePaid: quantity * latestPrice.sharePrice,
    };
  }

  // To view the shares that are available in the Firm's rewards account
  async getRewardsAccountPositions(): Promise<
    { tickerSymbol: string; quantity: number; sharePrice: number }[]
  > {
    return Object.entries(this.tickers).map(
      ([tickerSymbol, { quantity, sharePrice }]) => ({
        tickerSymbol,
        quantity,
        sharePrice,
      })
    );
  }

  // To move shares from our Firm's rewards account to a user's own account
  async moveSharesFromRewardsAccount(
    toAccount: string,
    tickerSymbol: string,
    quantity: number
  ): Promise<{ success: boolean }> {
    const ticker = this.tickers[tickerSymbol];

    if (!ticker) {
      throw new Error(`ticker not found: ${tickerSymbol}`);
    }

    if (ticker.quantity - quantity < 0) {
      throw new Error(`not enough ticker quantity left`);
    }

    ticker.quantity -= quantity;
    return { success: true };
  }
}

interface IBrokerApi {
  // To fetch a list of assets available for trading
  listTradableAssets(): Promise<Array<{ tickerSymbol: string }>>;

  // To fetch the latest price for an asset
  getLatestPrice(tickerSymbol: string): Promise<{ sharePrice: number }>;

  // To check if the stock market is currently open or closed
  isMarketOpen(): Promise<{
    open: boolean;
    nextOpeningTime: string;
    nextClosingTime: string;
  }>;

  // To purchase a share in our Firm's rewards account.
  // NOTE: this works only while the stock market is open otherwise throws an error.
  // NOTE 2: quantity is an integer, no fractional shares allowed.
  buySharesInRewardsAccount(
    tickerSymbol: string,
    quantity: number
  ): Promise<{ success: boolean; sharePricePaid: number }>;

  // To view the shares that are available in the Firm's rewards account
  getRewardsAccountPositions(): Promise<
    Array<{ tickerSymbol: string; quantity: number; sharePrice: number }>
  >;

  // To move shares from our Firm's rewards account to a user's own account
  moveSharesFromRewardsAccount(
    toAccount: string,
    tickerSymbol: string,
    quantity: number
  ): Promise<{ success: boolean }>;
}
