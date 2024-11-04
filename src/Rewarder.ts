
import {
    RewardClaimed as RewardClaimedEvent,
    VoteRegistered as VoteRegisteredEvent,
} from '../generated/rewarder/Rewarder'
import { RewardClaimed, VeDelegateAccount } from '../generated/schema'
import { decimals, transactions } from '@amxx/graphprotocol-utils'
import { fetchRound, fetchStatistic } from './XAllocationVoting'
import { fetchAccount } from '@openzeppelin/subgraphs/src/fetch/account'

export function handleReward(event: RewardClaimedEvent): void {
    const id = event.params.cycle.toString()

    const round = fetchRound(id)
    const roundStats = fetchStatistic(round.id, "")
    roundStats.totalRewardsClaimedExact = roundStats.totalRewardsClaimedExact.plus(event.params.reward)
    roundStats.totalRewardsClaimed = decimals.toDecimals(roundStats.totalRewardsClaimedExact, 18)
    roundStats.save()

    const veAccount = VeDelegateAccount.load(event.params.voter)
    if (veAccount != null) {
        const veDelegateStatistic = fetchStatistic(round.id, "vedelegate")
        veDelegateStatistic.totalRewardsClaimedExact = veDelegateStatistic.totalRewardsClaimedExact.plus(event.params.reward)
        veDelegateStatistic.totalRewardsClaimed = decimals.toDecimals(veDelegateStatistic.totalRewardsClaimedExact, 18)
        veDelegateStatistic.save()
    }

    const ev = new RewardClaimed([event.params.voter.toHexString(), event.params.cycle.toString()].join('/'))
    ev.emitter = event.address
    ev.voter = fetchAccount(event.params.voter).id
    ev.round = round.id
    ev.rewardExact = event.params.reward
    ev.reward = decimals.toDecimals(ev.rewardExact, 18)
    ev.timestamp = event.block.timestamp
    ev.transaction = transactions.log(event).id
    ev.save()
}


export function handleVoteRegistered(event: VoteRegisteredEvent): void {
    const roundId = event.params.cycle.toString()
    const veAccount = VeDelegateAccount.load(event.params.voter)

    const stats = fetchStatistic(roundId, "")
    const veDelegateStats = fetchStatistic(roundId, "vedelegate")

    stats.weightTotalExact = stats.weightTotalExact.plus(event.params.rewardWeightedVote)
    stats.weightTotal = decimals.toDecimals(stats.weightTotalExact, 18)
    stats.save()

    if (veAccount != null) {
        veDelegateStats.weightTotalExact = veDelegateStats.weightTotalExact.plus(event.params.rewardWeightedVote)
        veDelegateStats.weightTotal = decimals.toDecimals(veDelegateStats.weightTotalExact, 18)
        veDelegateStats.save()
    }
}
