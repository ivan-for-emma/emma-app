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

### Weighted random algorithm

- https://hackernoon.com/implementing-the-weighted-random-algorithm-with-javascript

## Assumptions

### Why we can't just buy right before transfering to a customer

Because if a customer is redeeming at night (when broker doesn't work), we can't buy and customer is disapointed.

### How frequent should we top up our reward account?

I implemented a private method to run manually to buy shares

## Concerns

- Worst case: no shares left in reward account, customers post to social media about it
  - Depending on marketing campaign terms, we can redeploy with other weights and keep providing service

## Abbreviated for simplicity

- Auth
- Distributed lock on operation for current user (prevent race conditions)
- Check if user already received free share
- Validation request/response schemas
