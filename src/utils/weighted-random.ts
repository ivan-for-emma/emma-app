// adopted from https://hackernoon.com/implementing-the-weighted-random-algorithm-with-javascript
export function weightedRandom(
  chance: Chance.Chance,
  data: { weight: number }[]
) {
  const cumulativeWeights = [];
  for (let index = 0; index < data.length; index++) {
    cumulativeWeights.push(
      data[index].weight +
        (cumulativeWeights[cumulativeWeights.length - 1] || 0)
    );
  }

  const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
  const randomNumber =
    maxCumulativeWeight * chance.floating({ min: 0, max: 1 });

  for (let index = 0; index < data.length; index++) {
    if (cumulativeWeights[index] >= randomNumber) {
      return index;
    }
  }
}
