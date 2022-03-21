import axios from 'axios';

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const agent = axios.create({
    baseURL: 'http://localhost:3000',
  });

  const {
    data: { shares },
  } = await agent.get('/private/shares');

  const quantity = process.argv[2] ? Number(process.argv[2]) : 100;

  await agent.post('/private/shares/buy', {
    targets: shares.map(({ tickerSymbol }) => ({
      tickerSymbol,
      quantity,
    })),
  });

  console.log(
    `Bought ${quantity} shares of ${shares
      .map(({ tickerSymbol }) => tickerSymbol)
      .join(',')}`
  );
}
