# V2 Composition

V2 runs beside the current v1 subgraph. V1 stays live while consumers migrate.

Source subgraphs stay immutable event/document graphs. `dao-dev-v2` is the mutable composed read-model graph. Rewards are split from app metadata so low-volume app data can be redeployed and reindexed without replaying reward transfers.

## Source Graphs

- `apps-source`: app registration, metadata URI changes, blacklist/eligibility, endorsement events, and rounds.
- `rewards-source`: allocation votes, reward transfers, reward claims, allocation funding, sustainability proof documents, and reward aggregates.
- `tokens-source`: B3TR, VOT3, and veB3TR transfer/approval events.
- `governance-source`: governor, timelock, VOT3 delegation, proposal events, and proposal metadata documents.
- `identity-source`: passport, veDelegate, node, Stargate, Lock2Earn, and vet.domains events.

Every event row keeps stable join fields:

- `id`: `txHash.concatI32(logIndex)`
- `txHash`
- `logIndex`
- `blockNumber`
- `timestamp`
- account IDs as `Bytes`
- app IDs as `Bytes`
- round IDs as `String`

## Composed API

Use v1-style roots from `dao-dev-v2`:

```graphql
query AppScreen($app: Bytes!) {
  app(id: $app) {
    id
    name
    metadataURI
    metadata { title description logoUrl bannerUrl }
    createdAt
    createdAtBlockNumber
    updatedAtBlockNumber
    votingEligibility
    isBlacklisted
    endorsed
    participantsCount
    poolBalanceExact
    poolDepositsExact
    poolWithdrawalsExact
    poolDistributionsExact
    poolAllocationsExact
  }

  appRewardTransfers(first: 20, orderBy: timestamp, orderDirection: desc, where: { app: $app }) {
    kind
    amountExact
    round
    timestamp
  }
}
```

`App`, `Round`, `Proposal`, `Account`, token balances, NFT state, passport state, node state, vet.domains names, `Lock2EarnTerm`, and `Lock2EarnStats` are read models built only from source rows.

## Deploy Order

1. Deploy source graphs first.
2. Update `subgraphs/v2/dao-v2-composed/source-deployments.json`.
3. Run composed codegen with the same IPFS node used for deployment.
4. Build composed.
5. Deploy `vebetter/dao-dev-v2`.

```sh
IPFS_NODE_URL=$IPFS_NODE_URL GRAPH_NODE_URL=$GRAPH_NODE_URL npm run deploy:v2:apps
IPFS_NODE_URL=$IPFS_NODE_URL GRAPH_NODE_URL=$GRAPH_NODE_URL npm run deploy:v2:rewards
IPFS_NODE_URL=$IPFS_NODE_URL GRAPH_NODE_URL=$GRAPH_NODE_URL npm run deploy:v2:tokens
IPFS_NODE_URL=$IPFS_NODE_URL GRAPH_NODE_URL=$GRAPH_NODE_URL npm run deploy:v2:governance
IPFS_NODE_URL=$IPFS_NODE_URL GRAPH_NODE_URL=$GRAPH_NODE_URL npm run deploy:v2:identity

IPFS_NODE_URL=$IPFS_NODE_URL npm run codegen:v2:composed
IPFS_NODE_URL=$IPFS_NODE_URL npm run build:v2:composed
IPFS_NODE_URL=$IPFS_NODE_URL GRAPH_NODE_URL=$GRAPH_NODE_URL npm run deploy:v2:composed
```

`source-deployments.json`, generated composed `subgraph.yaml`, and generated composed `src/mapping.ts` are ignored by git because deployment IDs change.

## Historical Backfill

`identity-source` uses historical start blocks for passport, veDelegate, node, Stargate, Lock2Earn, and vet.domains state. This gives parity, but the source must backfill from old ThorNode/vet.domains history before composed has complete identity read models.

Composition currently waits for source deployments to catch up. If `dao-dev-v2` stays at its start block, check source sync first.

## Status

```sh
IPFS_NODE_URL=$IPFS_NODE_URL GRAPH_NODE_URL=$GRAPH_NODE_URL npm run status
```

The status table prints current, pending, and old failed deployments by default. It includes health, synced state, item count, indexed block, chain head, deployment ID, and fatal errors for every v2 source plus composed.

Use `npm run status -- --current` when you only want Graph Node's current version for each subgraph name.

Old failed rows can remain in Graph Node history after a fixed deployment is added. Check the `version` and `deployment` columns before treating an old failure as active.
