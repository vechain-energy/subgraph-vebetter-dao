This subgraph indexes VeBetterDAO activity with a storage-cut profile tuned for fresh reindexing.

It keeps:

1. ERC20 balances, approvals, and total supply snapshots for `B3TR`, `VOT3`, and `veB3TR`
2. Governance rounds, allocation aggregates, reward claim aggregates, and proposal aggregates
3. App metadata, proposal metadata, and veDelegate account state
4. Passport delegation/linking state plus compact passport score counters
5. Reward-pool summaries plus one raw reward transfer feed

It does not keep:

1. Raw allocation vote entities
2. Raw governance vote receipt entities
3. Raw sustainability proof entities
4. Raw `PassportScore` entities
5. Raw `DelegateVotesChanged` entities
6. Raw reward-pool deposit, withdraw, and distribution entities as separate tables

## Storage Rules

- `RewardPoolTransfer` is the only raw reward-pool event entity.
- `RewardPoolTransfer.kind` is `DEPOSIT`, `WITHDRAW`, or `DISTRIBUTION`.
- `RewardPoolTransfer.reason` is only set for team withdrawals.
- Hot synthetic IDs now use `Bytes` for compact storage where human-readable IDs are not needed.
- Zero-value `ERC20Balance`, `VBDBalance`, and `ERC20Approval` rows are removed from store. Missing row means zero.
- `indexerHints.prune: auto` is enabled in [`subgraph.yaml`](subgraph.yaml).

## Query Notes

- Prefer natural-field filters over direct `id` lookups for hashed summary tables.
- Use `rewardPoolTransfers(where: { app: "...", round: "1", kind: DISTRIBUTION })` for reward history.
- Use `appRoundSummaries(where: { app: "...", round: "1" })` for app round summaries.
- Use `accountSustainabilities(where: { account: "...", app: "..." })` for account reward totals.
- Use `accountRoundSustainabilities(where: { account: "...", app: "...", round: "1" })` for per-round reward totals.
- Use `erc20Balances(where: { contract: "...", account: "..." })` and `erc20Approvals(where: { contract: "...", owner: "...", spender: "..." })` for live token state.

Full API notes live in [`docs/storage-optimized-subgraph.md`](docs/storage-optimized-subgraph.md).

## Local Work

```sh
npx graph codegen subgraph.yaml
npx graph test
npx graph build subgraph.yaml
```

For local deploys, run a `graph-node` connected to VeChain and then deploy with your normal `graph create` and `graph deploy` commands.
