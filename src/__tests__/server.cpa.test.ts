import { createTestApp, TestAppContext } from './create-test-app';

describe('cpa algorithm', () => {
  let ctx: TestAppContext;
  const targetCPA = 15;
  const initialState = {
    value: 1000,
    count: 100,
  };
  const initialCPA = initialState.value / initialState.count;

  beforeEach(async () => {
    ctx = await createTestApp({
      seed: 0,
      algorithm: {
        type: 'CPA',
        targetCPA: 15,
        minPrice: 3,
        maxPrice: 50,
        state: { ...initialState },
      },
    });
  });

  afterEach(() => {
    if (ctx) {
      ctx.close();
    }
  });

  test('success', async () => {
    await preBuyShares(100);

    const result = {};
    const iterations = 100;
    for (let i = 0; i < iterations; i++) {
      const { data } = await ctx.agent.post('/claim-free-share', {
        accountId: `acc-${i}`,
      });

      const key = `${data.share.tickerSymbol}-£${data.share.sharePrice}`;
      result[key] = (result[key] || 0) + 1;
    }

    const {
      data: { state },
    } = await ctx.agent.get('/private/cpa');

    expect({ result, state, targetCPA, initialState, initialCPA, iterations }).
toMatchInlineSnapshot(`
Object {
  "initialCPA": 10,
  "initialState": Object {
    "count": 100,
    "value": 1000,
  },
  "iterations": 100,
  "result": Object {
    "AA-£5": 4,
    "CC-£10": 61,
    "DD-£25": 31,
    "EE-£150": 4,
  },
  "state": Object {
    "count": 200,
    "cpa": 15.025,
    "value": 3005,
  },
  "targetCPA": 15,
}
`);
  });

  async function preBuyShares(quantity: number) {
    const {
      data: { shares },
    } = await ctx.agent.get('/private/shares');

    await ctx.agent.post('/private/shares/buy', {
      targets: shares.map(({ tickerSymbol }) => ({
        tickerSymbol,
        quantity,
      })),
    });
  }
});
