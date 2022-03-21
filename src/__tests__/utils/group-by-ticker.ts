export function groupByTicker(data) {
  const result = {};

  for (const datum of data) {
    const key = `${datum.share.ticker}-£${datum.share.price}`;
    result[key] = (result[key] || 0) + 1;
  }

  return result;
}
