import { createTestApp, TestAppContext } from './create-test-app';

describe('test', () => {
  let ctx: TestAppContext;

  beforeEach(async () => {
    ctx = await createTestApp({
      seed: 0,
      weights: [
        { min: 3, max: 10, weight: 95 },
        { min: 10, max: 25, weight: 3 },
        { min: 25, max: 200, weight: 2 },
      ],
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
    for (let i = 0; i < 100; i++) {
      const { data } = await ctx.agent.post('/claim-free-share', {
        accountId: `acc-${i}`,
      });

      const key = `${data.share.tickerSymbol}-£${data.share.sharePrice}`;
      result[key] = (result[key] || 0) + 1;
    }

    expect(result).toMatchInlineSnapshot(`
Object {
  "AA-£5": 96,
  "CC-£10": 4,
}
`);
  });

  test('not enough available shares', async () => {
    await preBuyShares(1);

    const result = {};
    let i: number;

    for (i = 0; i < 100; i++) {
      try {
        const { data } = await ctx.agent.post('/claim-free-share', {
          accountId: `acc-${i}`,
        });

        const key = `${data.share.tickerSymbol}-£${data.share.sharePrice}`;
        result[key] = (result[key] || 0) + 1;
      } catch (err) {
        expect(err.response.data.message).toBe('no available shares');
        break;
      }
    }

    expect({ result, errorIndex: i }).toMatchInlineSnapshot(`
Object {
  "errorIndex": 3,
  "result": Object {
    "AA-£5": 1,
    "BB-£7": 1,
    "CC-£10": 1,
  },
}
`);
  });

  async function preBuyShares(quantity: number) {
    const {
      data: { prices },
    } = await ctx.agent.get('/private/shares');

    await ctx.agent.post('/private/shares/buy', {
      targets: prices.map(({ tickerSymbol }) => ({
        tickerSymbol,
        quantity,
      })),
    });
  }
});
