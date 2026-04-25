# Storage-Optimized Subgraph

## Goal

This profile is for a fresh reindex.

Target:

- keep current dashboard behavior
- cut raw event storage
- cut index size on hot mutable tables
- keep `indexerHints.prune: auto`

The Graph still recommends pruning plus `Bytes` IDs for non-human keys and immutable event entities where possible:

- [Pruning best practices](https://thegraph.com/docs/en/subgraphs/best-practices/pruning/)
- [Bytes IDs and immutable entities](https://thegraph.com/docs/en/subgraphs/cookbook/immutable-entities-bytes-as-ids/)
- [Schema guidance](https://thegraph.com/docs/en/subgraphs/developing/creating/ql-schema/)

## Reward Pool Shape

Raw reward history is now one table only:

- `RewardPoolTransfer`

New fields:

- `kind: RewardPoolTransferKind!`
- `reason: String`

Removed raw reward entities:

- `RewardPoolDeposit`
- `RewardPoolWithdraw`
- `RewardPoolDistribution`

Removed duplicate link fields from `RewardPoolTransfer`:

- `deposit`
- `withdraw`
- `distribution`

Use queries like:

```graphql
query RewardFeed($app: Bytes!, $round: String!) {
  rewardPoolTransfers(
    first: 100
    orderBy: timestamp
    orderDirection: desc
    where: { app: $app, round: $round }
  ) {
    id
    timestamp
    kind
    reason
    amountExact
    from {
      id
    }
    to {
      id
    }
  }
}
```

## Removed Raw Histories

These raw entities are gone:

- `PassportScore`
- `DelegateVotesChanged`

These summary surfaces stay:

- `RoundStatistic.totalActionScores`
- `AppRoundSummary.passportScore`
- `AccountRoundSustainability.passportScore`
- `VoteWeight`
- `VoteDelegation`

Compact passport counters now live on `Account`:

- `passportActionCount`
- `passportScoreTotal`
- `lastActivityTimestamp`

## Byte IDs

The following hot synthetic IDs now use `Bytes`:

- `Transaction`
- `RewardPoolTransfer`
- `RewardClaimed`
- `ERC20Balance`
- `VBDBalance`
- `ERC20Approval`
- `AccountSustainability`
- `AccountRoundSustainability`
- `AppRoundSummary`
- `SustainabilityStats`

Event entities use `event.transaction.hash.concatI32(event.logIndex.toI32())`.

Summary tables use fixed byte composite IDs or hashed byte composite IDs from [`src/ids.ts`](../src/ids.ts).

Because these IDs are not human-friendly, prefer filter queries over direct `id` lookups:

```graphql
query AppRoundSummary($app: Bytes!, $round: String!) {
  appRoundSummaries(first: 1, where: { app: $app, round: $round }) {
    id
    activeUserCount
    poolBalanceExact
    poolDepositsExact
    poolWithdrawalsExact
    poolDistributionsExact
    passportScore
    sustainabilityStats {
      rewards
      newUserCount
      actionCount
    }
  }
}
```

```graphql
query AccountRewardSummary($account: Bytes!, $app: Bytes!, $round: String!) {
  accountSustainabilities(first: 1, where: { account: $account, app: $app }) {
    receivedRewards
  }

  accountRoundSustainabilities(
    first: 1
    where: { account: $account, app: $app, round: $round }
  ) {
    receivedRewards
    passportScore
  }
}
```

## Zero-Row Semantics

Zero-value snapshots are removed from store for:

- `ERC20Balance`
- `VBDBalance`
- `ERC20Approval`

Meaning:

- missing balance row = zero balance
- missing approval row = zero allowance

Use filters instead of assuming the row exists:

```graphql
query TokenState($contract: Bytes!, $account: Bytes!, $spender: Bytes!) {
  erc20Balances(first: 1, where: { contract: $contract, account: $account }) {
    valueExact
  }

  erc20Approvals(
    first: 1
    where: { contract: $contract, owner: $account, spender: $spender }
  ) {
    valueExact
  }
}
```

## Reindex Notes

- This schema is not graft-compatible with older raw-history deployments.
- Rebuild as a fresh namespace, such as `sgd48`.
- After reindex, validate namespace size, removed tables, and zero-row counts for `erc20_balance`, `vbd_balance`, and `erc20_approval`.
