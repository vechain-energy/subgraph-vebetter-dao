
import {
    AllocationVoteCast as AllocationVoteCastEvent,
    RoundCreated as RoundCreatedEvent
} from '../generated/xallocationvoting/XAllocationVoting'
import { Round, AllocationVote, RoundStatistic, ERC20Balance, AllocationResult, VeDelegateAccount } from '../generated/schema'
import { decimals, transactions, constants } from '@amxx/graphprotocol-utils'
import { fetchAccount } from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'
import { fetchApp } from './XApps'

export function handleVoteCast(event: AllocationVoteCastEvent): void {
    const appCount = event.params.appsIds.length
    const roundId = event.params.roundId.toString()
    const veAccount = VeDelegateAccount.load(event.params.voter)

    const stats = fetchStatistic(roundId, "")
    const veDelegateStats = fetchStatistic(roundId, "vedelegate")

    stats.voters = stats.voters.plus(constants.BIGINT_ONE)
    if (veAccount != null) {
        veDelegateStats.voters = veDelegateStats.voters.plus(constants.BIGINT_ONE)
    }

    for (let index = 0; index < appCount; index += 1) {
        const app = event.params.appsIds[index]
        const appId = app.toHexString()
        const id = (event.block.number.toI64() * 10000000) + (event.transaction.index.toI64() * 10000) + (event.transactionLogIndex.toI64() * 100) + index
        const vote = new AllocationVote(id.toString())
        const votesCast = event.params.voteWeights[index]
        const qfWeight = votesCast.sqrt()
        vote.voter = fetchAccount(event.params.voter).id
        vote.round = roundId
        vote.app = app;
        vote.weight = decimals.toDecimals(votesCast, 18)
        vote.weightExact = votesCast

        vote.qfWeightExact = qfWeight
        vote.qfWeight = decimals.toDecimals(qfWeight, 18)
        vote.timestamp = event.block.timestamp.toI64()
        vote.transaction = transactions.log(event).id
        vote.save()

        const allocation = AllocationResult.load([roundId, appId].join('/'))!
        allocation.voters = allocation.voters.plus(constants.BIGINT_ONE)
        allocation.votesCastExact = allocation.votesCastExact.plus(votesCast)
        allocation.votesCast = decimals.toDecimals(allocation.votesCastExact, 18)
        allocation.weightExact = allocation.weightExact.plus(qfWeight)
        allocation.weight = decimals.toDecimals(allocation.weightExact, 18)
        allocation.save()

        stats.votesCastExact = stats.votesCastExact.plus(votesCast)
        stats.votesCast = decimals.toDecimals(stats.votesCastExact, 18)
        stats.weightExact = stats.weightExact.plus(qfWeight)
        stats.weight = decimals.toDecimals(stats.weightExact, 18)

        if (veAccount != null) {
            const veDelegateAllocation = AllocationResult.load([roundId, appId, 'vedelegate'].join('/'))!
            veDelegateAllocation.voters = veDelegateAllocation.voters.plus(constants.BIGINT_ONE)
            veDelegateAllocation.weightExact = veDelegateAllocation.weightExact.plus(qfWeight)
            veDelegateAllocation.weight = decimals.toDecimals(veDelegateAllocation.weightExact, 18)
            veDelegateAllocation.votesCastExact = veDelegateAllocation.votesCastExact.plus(votesCast)
            veDelegateAllocation.votesCast = decimals.toDecimals(veDelegateAllocation.votesCastExact, 18)
            veDelegateAllocation.save()

            veDelegateStats.votesCastExact = veDelegateStats.votesCastExact.plus(votesCast)
            veDelegateStats.votesCast = decimals.toDecimals(veDelegateStats.votesCastExact, 18)

            veDelegateStats.weightExact = veDelegateStats.weightExact.plus(qfWeight)
            veDelegateStats.weight = decimals.toDecimals(veDelegateStats.weightExact, 18)
        }
    }
    stats.save()
    veDelegateStats.save()
}

export function handleRoundCreated(event: RoundCreatedEvent): void {
    const id = event.params.roundId.toString()
    const round = fetchRound(id)
    round.voteStart = event.params.voteStart
    round.voteEnd = event.params.voteEnd

    const appCount = event.params.appsIds.length
    for (let index = 0; index < appCount; index += 1) {
        const appId = event.params.appsIds[index]
        fetchApp(appId)
    }
    round.apps = event.params.appsIds

    const allocationIds: string[] = []
    const veDelegateAllocationIds: string[] = []
    for (let index = 0; index < appCount; index += 1) {
        const appId = event.params.appsIds[index].toHexString()
        const allocation = new AllocationResult([id, appId].join('/'))
        const veDelegateAllocation = new AllocationResult([id, appId, 'vedelegate'].join('/'))

        veDelegateAllocation.round = allocation.round = round.id
        veDelegateAllocation.app = allocation.app = event.params.appsIds[index]
        veDelegateAllocation.votesCast = allocation.votesCast = constants.BIGDECIMAL_ZERO
        veDelegateAllocation.votesCastExact = allocation.votesCastExact = constants.BIGINT_ZERO
        veDelegateAllocation.weight = allocation.weight = constants.BIGDECIMAL_ZERO
        veDelegateAllocation.weightExact = allocation.weightExact = constants.BIGINT_ZERO
        veDelegateAllocation.voters = allocation.voters = constants.BIGINT_ZERO

        allocationIds.push(allocation.id)
        veDelegateAllocationIds.push(veDelegateAllocation.id)

        allocation.save()
        veDelegateAllocation.save()
    }
    round.allocations = allocationIds
    round.veDelegateAllocations = veDelegateAllocationIds

    let stats = fetchStatistic(id, "")
    round.statistic = stats.id

    const totalB3trSupply = ERC20Balance.load(["0x5ef79995fe8a89e0812330e4378eb2660cede699", "totalSupply"].join('/'))
    if (totalB3trSupply) {
        stats.b3tr = totalB3trSupply.value
        stats.b3trExact = totalB3trSupply.valueExact
    }

    const totalVot3Supply = ERC20Balance.load(["0x76ca782b59c74d088c7d2cce2f211bc00836c602", "totalSupply"].join('/'))
    if (totalVot3Supply) {
        stats.vot3 = totalVot3Supply.value
        stats.vot3Exact = totalVot3Supply.valueExact
    }

    const veDelegateTVL = fetchStatistic("tvl", "vedelegate")
    const veDelegateStatistic = fetchStatistic(round.veDelegateStatistic, "")
    veDelegateStatistic.b3tr = veDelegateTVL.b3tr
    veDelegateStatistic.b3trExact = veDelegateTVL.b3trExact
    veDelegateStatistic.vot3 = veDelegateTVL.vot3
    veDelegateStatistic.vot3Exact = veDelegateTVL.vot3Exact
    round.veDelegateStatistic = veDelegateStatistic.id

    veDelegateStatistic.save()
    stats.save()
    round.save()
}


export function fetchRound(id: string): Round {
    let round = Round.load(id)
    if (round == null) {
        round = new Round(id)
        round.voteStart = constants.BIGINT_ZERO
        round.voteEnd = constants.BIGINT_ZERO
        round.statistic = fetchStatistic(id, "").id
        round.veDelegateStatistic = fetchStatistic(id, "vedelegate").id
        round.apps = []
        round.allocations = []
        round.veDelegateAllocations = []
        round.save()
    }
    return round
}

export function fetchStatistic(_id: string, suffix: string): RoundStatistic {
    const id = !suffix ? _id : [_id, suffix].join('/')
    let stats = RoundStatistic.load(id)
    if (stats == null) {
        stats = new RoundStatistic(id)
        stats.b3tr = constants.BIGDECIMAL_ZERO
        stats.b3trExact = constants.BIGINT_ZERO
        stats.vot3 = constants.BIGDECIMAL_ZERO
        stats.vot3Exact = constants.BIGINT_ZERO
        stats.voters = constants.BIGINT_ZERO
        stats.votesCast = constants.BIGDECIMAL_ZERO
        stats.votesCastExact = constants.BIGINT_ZERO
        stats.weight = constants.BIGDECIMAL_ZERO
        stats.weightExact = constants.BIGINT_ZERO
        stats.totalRewardsClaimed = constants.BIGDECIMAL_ZERO
        stats.totalRewardsClaimedExact = constants.BIGINT_ZERO
        stats.save()
    }

    return stats
}