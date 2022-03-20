# `emma-task`

## Install

```sh
$ yarn install
$ cp .env.example .env
```

## Usage

```sh
$ yarn start:dev
```

## Tests

```sh
$ yarn test
# or
$ yarn test:watch
```

## Notes

### Bonus tasks

- Implemented alongside basic algorithm switching by env variable.
  - tests/demonstration for basic is available in `src/__tests__/server.basic.test.ts`
  - for CPA-based - in `src/__tests__/server.cpa.test.ts`
- Fractional shares: we can gift exactly how much we want (assuming we bought enough)
  - for basic algorithm - generate random number in a range and gift a fraction of preselected share instead of finding a share in a range
  - for CPA-based
    - cold start - we can hit exact CPA with gifting fractions of share equal this CPA
    - switch after using different algorithm - always buy closest fraction to `targetCPA * (totalCount + 1) - totalValue`, simplified from `(totalValue + x) / (totalCount + 1) = targetCPA`

### Weighted random algorithm

- https://hackernoon.com/implementing-the-weighted-random-algorithm-with-javascript

## Assumptions

### Why we can't just buy right before transfering to a customer

Because if a customer is redeeming at night (when broker doesn't work), we can't buy and customer is disapointed.

### How frequent should we top up our reward account?

I implemented a private POST handler to run manually to buy shares.

## Concerns

- Worst case: no shares left in reward account, customers post to social media about it
  - Depending on marketing campaign terms, we can redeploy with other weights and keep providing service

## Abbreviated for simplicity

- Auth
- Distributed lock on operation for current user (prevent race conditions)
- Check if user already received free share
- Validation request/response schemas
- Custom Errors / Error handling
- Database for keeping users info and their shares
- Something like kafka to serialize commands execution and prevent race condition (CPA)
- Check if random implementation in `chance` library is cryptographically secure
