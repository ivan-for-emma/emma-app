import { createTestApp, TestAppContext } from './create-test-app';
import { groupByTicker } from './utils/group-by-ticker';

describe('cpa algorithm (cold)', () => {
  let ctx: TestAppContext;
  const targetCPA = 15;

  beforeEach(async () => {
    ctx = await createTestApp({
      seed: 0,
      algorithm: {
        type: 'CPA',
        targetCPA: 15,
        minPrice: 3,
        maxPrice: 50,
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

    const result = [];
    const iterations = 100;
    for (let i = 0; i < iterations; i++) {
      const { data } = await ctx.agent.post('/claim-free-share', {
        accountId: `acc-${i}`,
      });

      result.push(data);
    }

    const {
      data: { state },
    } = await ctx.agent.get('/private/cpa');

    expect({
  result: groupByTicker(result),
  state,
  targetCPA,
  iterations }).
toMatchInlineSnapshot(`
Object {
  "iterations": 100,
  "result": Object {
    "CC-£10": 67,
    "DD-£25": 33,
  },
  "state": Object {
    "count": 100,
    "cpa": 14.95,
    "value": 1495,
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
