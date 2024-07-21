import {
    NewDeposit as NewDepositEvent,
    TeamWithdrawal as TeamWithdrawalEvent,
    RewardDistributed as RewardDistributedEvent,
} from '../generated/RewardsPool/RewardsPool'
import { RewardPoolDeposit, RewardPoolWithdraw, RewardPoolDistribution } from '../generated/schema'
import { events, transactions, decimals } from '@amxx/graphprotocol-utils'
import { fetchApp } from './XApps'
import { fetchAccount } from '@openzeppelin/subgraphs/src/fetch/account'


export function handleNewDeposit(event: NewDepositEvent): void {
    const ev = new RewardPoolDeposit(events.id(event))
    const app = fetchApp(event.params.appId)

    ev.emitter = event.address
    ev.transaction = transactions.log(event).id
    ev.timestamp = event.block.timestamp
    ev.app = app.id
    ev.amountExact = event.params.amount
    ev.amount = decimals.toDecimals(event.params.amount, 18)
    ev.depositor = fetchAccount(event.params.depositor).id
    ev.save()

    app.poolBalanceExact = app.poolBalanceExact.plus(ev.amountExact)
    app.poolDepositsExact = app.poolDepositsExact.plus(ev.amountExact)
    app.poolBalance = decimals.toDecimals(app.poolBalanceExact, 18)
    app.poolDeposits = decimals.toDecimals(app.poolDepositsExact, 18)
    app.save()
}

export function handleTeamWithdrawal(event: TeamWithdrawalEvent): void {
    const ev = new RewardPoolWithdraw(events.id(event))
    const app = fetchApp(event.params.appId)

    ev.emitter = event.address
    ev.transaction = transactions.log(event).id
    ev.timestamp = event.block.timestamp
    ev.app = app.id
    ev.amountExact = event.params.amount
    ev.amount = decimals.toDecimals(event.params.amount, 18)
    ev.reason = event.params.reason
    ev.to = fetchAccount(event.params.teamWallet).id
    ev.by = fetchAccount(event.params.withdrawer).id
    ev.save()

    app.poolBalanceExact = app.poolBalanceExact.minus(ev.amountExact)
    app.poolWithdrawalsExact = app.poolWithdrawalsExact.plus(ev.amountExact)
    app.poolBalance = decimals.toDecimals(app.poolBalanceExact, 18)
    app.poolWithdrawals = decimals.toDecimals(app.poolWithdrawalsExact, 18)
   app.save()
}

export function handleRewardDistribution(event: RewardDistributedEvent): void {
    const ev = new RewardPoolDistribution(events.id(event))
    const app = fetchApp(event.params.appId)

    ev.emitter = event.address
    ev.transaction = transactions.log(event).id
    ev.timestamp = event.block.timestamp
    ev.app = app.id
    ev.amountExact = event.params.amount
    ev.amount = decimals.toDecimals(event.params.amount, 18)
    ev.proof = event.params.proof
    ev.to = fetchAccount(event.params.receiver).id
    ev.by = fetchAccount(event.params.distributor).id
    ev.save()

    app.poolBalanceExact = app.poolBalanceExact.minus(ev.amountExact)
    app.poolDistributionsExact = app.poolDistributionsExact.plus(ev.amountExact)
    app.poolBalance = decimals.toDecimals(app.poolBalanceExact, 18)
    app.poolDistributions = decimals.toDecimals(app.poolDistributionsExact, 18)
    app.save()
}
