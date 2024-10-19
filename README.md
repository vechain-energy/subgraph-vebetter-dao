This subgraph indexes different data from VeChain's VeBetterDAO:

1. B3TR, VOT3 and veB3TR Tokens with OpenZeppelin's ERC20 Template
2. Government contracts based on OpenZeppelin's voting, timelock, and governor templates
3. Rounds, with information about:
    - Allocation Votes
    - Reward Claims
4. Apps including their IPFS Metadata
5. Proposals including their IPFS Metadata
6. veDelegate.vet Token Bound Accounts (NFTs + Account Abstraction Wallets)
7. Timeseries of Allocation votes by app and round
8. Sustainability Proofs including Timeseries of impacts
9. Passport scoring and linking

The data provided offers information about:

1. Generic Token Activity
2. Round Statistics
3. App Allocation Voting Behavior
4. Insight into a subset of veDelegate.vet behavior
5. Proposal Metadata
6. Insight into Sustainability Proofs
7. Balance and activity of users (single or all tokens aggregated)
8. Passports (delegations, entities and scores)

The subgraph is deployed publicly on: https://graph.vet/subgraphs/name/vebetter/dao  
It powers the statistic pages on https://veDelegate.vet/stats 

To deploy locally, run a graph-node connected to VeChain as explained in [vechain-energy/graph-node](https://github.com/vechain-energy/graph-node) and deploy it with:


```shell
npx graph codegen subgraph.yaml
npx graph create vebetter/dao --node http://127.0.0.1:8020
npx graph deploy vebetter/dao --ipfs http://127.0.0.1:5001 --node http://127.0.0.1:8020 subgraph.yaml --version-label 1
```

--

Contributions to improve the indexing or widen the scope are very welcome!