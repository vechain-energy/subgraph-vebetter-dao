import {
    RewardClaimed as RewardClaimedEvent,
    RewardClaimedV2 as RewardClaimedV2Event,
    VoteRegistered as VoteRegisteredEvent,
    GMVoteRegistered as GMVoteRegisteredEvent,
} from '../generated/rewarder/Rewarder'
import { RewardClaimed, VeDelegateAccount, GMVoteLevel } from '../generated/schema'
import { store, Entity } from '@graphprotocol/graph-ts'
import { constants, decimals, transactions } from '@amxx/graphprotocol-utils'
import { fetchRound, fetchStatistic } from './XAllocationVoting'
import { fetchAccount } from '@openzeppelin/subgraphs/src/fetch/account'
import { incrementLock2EarnTermRewards } from './Lock2Earn'

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


export function handleReward2(event: RewardClaimedV2Event): void {
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

    // Wire in Lock2Earn reward increment
    if (veAccount && veAccount.asLock2EarnTerm && veAccount.lock2EarnTermId != null) {
        incrementLock2EarnTermRewards(veAccount.lock2EarnTermId as string, event.params.reward.plus(event.params.gmReward))
    }

    const ev = new RewardClaimed([event.params.voter.toHexString(), event.params.cycle.toString()].join('/'))
    ev.emitter = event.address
    ev.voter = fetchAccount(event.params.voter).id
    ev.round = round.id
    ev.rewardExact = event.params.reward.plus(event.params.gmReward)
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


export function handleGMVoteRegistered(event: GMVoteRegisteredEvent): void {
    const roundId = event.params.cycle.toString()
    const stats = fetchStatistic(roundId, "")

    // Deduplicate voter count per cycle by tokenId
    const cycleTokenKey = [roundId, event.params.tokenId.toString()].join('/')
    let isNewCycleToken = false
    if (store.get('GMVoteCycleToken', cycleTokenKey) == null) {
        const e = new Entity()
        store.set('GMVoteCycleToken', cycleTokenKey, e)
        isNewCycleToken = true
    }

    if (isNewCycleToken) {
        stats.gmVotersCount = stats.gmVotersCount.plus(constants.BIGINT_ONE)
    }
    stats.gmWeightTotal = stats.gmWeightTotal.plus(event.params.multiplier)
    stats.save()

    // Track level-specific stats
    const levelId = [roundId, event.params.level.toString()].join('/')
    let levelStats = GMVoteLevel.load(levelId)

    if (levelStats == null) {
        levelStats = new GMVoteLevel(levelId)
        levelStats.roundStatistic = stats.id
        levelStats.level = event.params.level
        levelStats.voterCount = constants.BIGINT_ZERO
        levelStats.weightTotal = constants.BIGINT_ZERO
    }

    // Use the same deduplication check for level stats
    if (isNewCycleToken) {
        levelStats.voterCount = levelStats.voterCount.plus(constants.BIGINT_ONE)
    }
    levelStats.weightTotal = levelStats.weightTotal.plus(event.params.multiplier)
    levelStats.save()
}
