import {
    NewDeposit as NewDepositEvent,
    TeamWithdrawal as TeamWithdrawalEvent,
    RewardDistributed as RewardDistributedEvent,
} from '../generated/RewardsPool/RewardsPool'
import { RewardPoolDeposit, RewardPoolWithdraw, RewardPoolDistribution } from '../generated/schema'
import { events, transactions, } from '@amxx/graphprotocol-utils'
import { fetchApp } from './XApps'
import { fetchAccount } from '@openzeppelin/subgraphs/src/fetch/account'


export function handleNewDeposit(event: NewDepositEvent): void {
    const ev = new RewardPoolDeposit(events.id(event))
    const app = fetchApp(event.params.appId)

    ev.emitter = event.address
    ev.transaction = transactions.log(event).id
    ev.timestamp = event.block.timestamp
    ev.app = app.id
    ev.amount = event.params.amount
    ev.depositor = fetchAccount(event.params.depositor).id
    ev.save()

    app.poolBalance = app.poolBalance.plus(ev.amount)
    app.poolDeposits = app.poolDeposits.plus(ev.amount)
    app.save()
}

export function handleTeamWithdrawal(event: TeamWithdrawalEvent): void {
    const ev = new RewardPoolWithdraw(events.id(event))
    const app = fetchApp(event.params.appId)

    ev.emitter = event.address
    ev.transaction = transactions.log(event).id
    ev.timestamp = event.block.timestamp
    ev.app = app.id
    ev.amount = event.params.amount
    ev.reason = event.params.reason
    ev.to = fetchAccount(event.params.teamWallet).id
    ev.by = fetchAccount(event.params.withdrawer).id
    ev.save()

    app.poolBalance = app.poolBalance.minus(ev.amount)
    app.poolWithdrawals = app.poolWithdrawals.plus(ev.amount)
    app.save()
}

export function handleRewardDistribution(event: RewardDistributedEvent): void {
    const ev = new RewardPoolDistribution(events.id(event))
    const app = fetchApp(event.params.appId)

    ev.emitter = event.address
    ev.transaction = transactions.log(event).id
    ev.timestamp = event.block.timestamp
    ev.app = app.id
    ev.amount = event.params.amount
    ev.proof = event.params.proof
    ev.to = fetchAccount(event.params.receiver).id
    ev.by = fetchAccount(event.params.distributor).id
    ev.save()

    app.poolBalance = app.poolBalance.minus(ev.amount)
    app.poolDistributions = app.poolDistributions.plus(ev.amount)
    app.save()
}
