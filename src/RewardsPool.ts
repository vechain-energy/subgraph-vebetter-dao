import {
    NewDeposit as NewDepositEvent,
    RewardDistributed as RewardDistributedEvent,
    TeamWithdrawal as TeamWithdrawalEvent,
} from '../generated/RewardsPool/RewardsPool'
import {
    FundsDistributedToApp as FundsDistributedToAppEvent,
} from '../generated/DynamicBaseAllocations/DynamicBaseAllocations'
import {
    AllocationRewardsClaimed as AllocationRewardsClaimedEvent,
} from '../generated/xallocationpool/XAllocationPool'
import {
    AccountRoundSustainability,
    AccountSustainability,
    App,
    AppRoundSummary,
    AppRoundWithdrawalReason,
    CurrentRound,
    RewardPoolTransfer,
    Round,
    SustainabilityStats,
    VeDelegateAccount,
} from '../generated/schema'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { constants, decimals } from '@amxx/graphprotocol-utils'

import { fetchAccount } from './account'
import {
    accountRoundSustainabilityId,
    accountSustainabilityId,
    appRoundSummaryId,
    ensureTransaction,
    eventBytesId,
    sustainabilityStatsId,
} from './ids'
import { incrementLock2EarnTermRewards } from './Lock2Earn'
import { fetchRound } from './XAllocationVoting'
import { fetchApp } from './XApps'

const X_ALLOCATION_POOL = Address.fromString('0x4191776f05f4be4848d3f4d587345078b439c7d3')
const DYNAMIC_BASE_ALLOCATIONS = Address.fromString('0x98c1d097c39969bb5de754266f60d22bd105b368')
const FIRST_PROOF_BACKED_DISTRIBUTION_BLOCK: i64 = 19145969

export function handleNewDeposit(event: NewDepositEvent): void {
    const current = CurrentRound.load('singleton')
    if (current == null) {
        return
    }

    const app = fetchApp(event.params.appId)
    const round = fetchRound(current.roundId.toString())
    const depositor = fetchAccount(event.params.depositor)
    const zeroAccount = fetchAccount(Address.zero())

    saveRewardPoolTransfer(
        event,
        app,
        round,
        event.params.amount,
        depositor.id,
        zeroAccount.id,
        'DEPOSIT',
        null,
    )

    updateAppRoundSummary(
        fetchAppRoundSummary(app, round),
        'DEPOSIT',
        event.params.amount,
        depositor.id,
        null,
    )

    app.poolBalanceExact = app.poolBalanceExact.plus(event.params.amount)

    if (countsAsDeposit(depositor.id)) {
        app.poolDepositsExact = app.poolDepositsExact.plus(event.params.amount)
    }

    app.poolBalance = decimals.toDecimals(app.poolBalanceExact, 18)
    app.poolDeposits = decimals.toDecimals(app.poolDepositsExact, 18)
    app.save()
}

export function handleTeamWithdrawal(event: TeamWithdrawalEvent): void {
    const app = fetchApp(event.params.appId)
    const round = getCurrentRound()
    const withdrawer = fetchAccount(event.params.withdrawer)
    const teamWallet = fetchAccount(event.params.teamWallet)

    saveRewardPoolTransfer(
        event,
        app,
        round,
        event.params.amount,
        withdrawer.id,
        teamWallet.id,
        'WITHDRAW',
        event.params.reason,
    )

    updateAppRoundSummary(
        fetchAppRoundSummary(app, round),
        'WITHDRAW',
        event.params.amount,
        withdrawer.id,
        event.params.reason,
    )

    app.poolBalanceExact = app.poolBalanceExact.minus(event.params.amount)
    app.poolWithdrawalsExact = app.poolWithdrawalsExact.plus(event.params.amount)
    app.poolBalance = decimals.toDecimals(app.poolBalanceExact, 18)
    app.poolWithdrawals = decimals.toDecimals(app.poolWithdrawalsExact, 18)
    app.save()
}

export function handleRewardDistribution(event: RewardDistributedEvent): void {
    const app = fetchApp(event.params.appId)
    const round = getCurrentRound()
    const distributor = fetchAccount(event.params.distributor)
    const receiver = fetchAccount(event.params.receiver)
    const appRoundSummary = fetchAppRoundSummary(app, round)

    let isNewRoundParticipant = false
    if (event.block.number.toI64() >= FIRST_PROOF_BACKED_DISTRIBUTION_BLOCK) {
        const participantStatus = updateAccountSustainability(receiver.id, app, round, event.params.amount)
        if (participantStatus[0]) {
            app.participantsCount = app.participantsCount.plus(constants.BIGINT_ONE)
        }
        isNewRoundParticipant = participantStatus[1]
        updateAppRoundSustainability(app, round, event.params.amount)
    }

    saveRewardPoolTransfer(
        event,
        app,
        round,
        event.params.amount,
        distributor.id,
        receiver.id,
        'DISTRIBUTION',
        null,
    )

    updateAppRoundSummary(appRoundSummary, 'DISTRIBUTION', event.params.amount, distributor.id, null)

    app.poolBalanceExact = app.poolBalanceExact.minus(event.params.amount)
    app.poolDistributionsExact = app.poolDistributionsExact.plus(event.params.amount)
    app.poolBalance = decimals.toDecimals(app.poolBalanceExact, 18)
    app.poolDistributions = decimals.toDecimals(app.poolDistributionsExact, 18)
    app.save()

    if (isNewRoundParticipant) {
        appRoundSummary.activeUserCount = appRoundSummary.activeUserCount.plus(constants.BIGINT_ONE)
        appRoundSummary.save()
    }

    const veAccount = VeDelegateAccount.load(event.params.receiver)
    if (veAccount && veAccount.asLock2EarnTerm && veAccount.lock2EarnTermId != null) {
        incrementLock2EarnTermRewards(veAccount.lock2EarnTermId as string, event.params.amount)
    }
}

export function handleAllocationRewardsClaimed(event: AllocationRewardsClaimedEvent): void {
    const app = fetchApp(event.params.appId)
    const nextRound = fetchRound(event.params.roundId.plus(constants.BIGINT_ONE).toString())

    app.poolAllocationsExact = app.poolAllocationsExact.plus(event.params.totalAmount)
    app.poolAllocations = decimals.toDecimals(app.poolAllocationsExact, 18)
    app.save()

    const appRoundSummary = fetchAppRoundSummary(app, nextRound)
    appRoundSummary.poolAllocationsExact = appRoundSummary.poolAllocationsExact.plus(event.params.totalAmount)
    appRoundSummary.poolAllocations = decimals.toDecimals(appRoundSummary.poolAllocationsExact, 18)
    appRoundSummary.save()
}

export function handleFundsDistributedToApp(event: FundsDistributedToAppEvent): void {
    const app = fetchApp(event.params.appId)
    const round = fetchRound(event.params.roundId.toString())

    app.poolAllocationsExact = app.poolAllocationsExact.plus(event.params.amount)
    app.poolAllocations = decimals.toDecimals(app.poolAllocationsExact, 18)
    app.save()

    const appRoundSummary = fetchAppRoundSummary(app, round)
    appRoundSummary.poolAllocationsExact = appRoundSummary.poolAllocationsExact.plus(event.params.amount)
    appRoundSummary.poolAllocations = decimals.toDecimals(appRoundSummary.poolAllocationsExact, 18)
    appRoundSummary.save()
}

function saveRewardPoolTransfer(
    event: ethereum.Event,
    app: App,
    round: Round,
    amountExact: BigInt,
    from: Bytes,
    to: Bytes,
    kind: string,
    reason: string | null,
): void {
    const transfer = new RewardPoolTransfer(eventBytesId(event))
    transfer.transaction = ensureTransaction(event).id
    transfer.emitter = fetchAccount(event.address).id
    transfer.timestamp = event.block.timestamp
    transfer.app = app.id
    transfer.round = round.id
    transfer.amountExact = amountExact
    transfer.amount = decimals.toDecimals(amountExact, 18)
    transfer.from = from
    transfer.to = to
    transfer.kind = kind
    transfer.reason = reason
    transfer.save()
}

function updateAppRoundSustainability(app: App, round: Round, reward: BigInt): void {
    const sustainabilityStats = SustainabilityStats.load(sustainabilityStatsId(app.id, round.id))
    if (sustainabilityStats == null) {
        return
    }

    sustainabilityStats.newUserCount = app.participantsCount.minus(sustainabilityStats.participantsCountStart)
    sustainabilityStats.rewards = sustainabilityStats.rewards.plus(reward)
    sustainabilityStats.actionCount = sustainabilityStats.actionCount.plus(constants.BIGINT_ONE)
    sustainabilityStats.save()
}

function updateAccountSustainability(account: Bytes, app: App, round: Round, reward: BigInt): boolean[] {
    const summaryId = accountSustainabilityId(account, app.id)
    let accountSustainability = AccountSustainability.load(summaryId)
    let isNewParticipant = false
    let isNewRoundParticipant = false

    if (accountSustainability == null) {
        accountSustainability = new AccountSustainability(summaryId)
        accountSustainability.receivedRewards = constants.BIGINT_ZERO
        accountSustainability.account = fetchAccount(Address.fromBytes(account)).id
        accountSustainability.app = app.id
        isNewParticipant = true
    }

    accountSustainability.receivedRewards = accountSustainability.receivedRewards.plus(reward)
    accountSustainability.save()

    if (AccountRoundSustainability.load(accountRoundSustainabilityId(account, app.id, round.id)) == null) {
        isNewRoundParticipant = true
    }

    const roundSummary = fetchAccountRoundSustainability(account, app, round)
    roundSummary.receivedRewards = roundSummary.receivedRewards.plus(reward)
    roundSummary.save()

    return [isNewParticipant, isNewRoundParticipant]
}

function updateAppRoundSummary(
    appRoundSummary: AppRoundSummary,
    kind: string,
    amountExact: BigInt,
    from: Bytes,
    reason: string | null,
): void {
    if (kind == 'DEPOSIT') {
        appRoundSummary.poolBalanceExact = appRoundSummary.poolBalanceExact.plus(amountExact)
        appRoundSummary.poolBalance = decimals.toDecimals(appRoundSummary.poolBalanceExact, 18)

        if (countsAsDeposit(from)) {
            appRoundSummary.poolDepositsExact = appRoundSummary.poolDepositsExact.plus(amountExact)
            appRoundSummary.poolDeposits = decimals.toDecimals(appRoundSummary.poolDepositsExact, 18)
        }

        appRoundSummary.save()
        return
    }

    if (kind == 'WITHDRAW') {
        appRoundSummary.poolBalanceExact = appRoundSummary.poolBalanceExact.minus(amountExact)
        appRoundSummary.poolBalance = decimals.toDecimals(appRoundSummary.poolBalanceExact, 18)
        appRoundSummary.poolWithdrawalsExact = appRoundSummary.poolWithdrawalsExact.plus(amountExact)
        appRoundSummary.poolWithdrawals = decimals.toDecimals(appRoundSummary.poolWithdrawalsExact, 18)
        appRoundSummary.save()

        if (reason != null) {
            const withdrawalReasonLabel = reason as string
            const withdrawalReasonId = appRoundSummary.id.toHexString().concat('/').concat(withdrawalReasonLabel)
            let withdrawalReason = AppRoundWithdrawalReason.load(withdrawalReasonId)
            if (withdrawalReason == null) {
                withdrawalReason = new AppRoundWithdrawalReason(withdrawalReasonId)
                withdrawalReason.appRoundSummary = appRoundSummary.id
                withdrawalReason.reason = withdrawalReasonLabel
                withdrawalReason.amount = constants.BIGDECIMAL_ZERO
                withdrawalReason.amountExact = constants.BIGINT_ZERO
            }

            withdrawalReason.amountExact = withdrawalReason.amountExact.plus(amountExact)
            withdrawalReason.amount = decimals.toDecimals(withdrawalReason.amountExact, 18)
            withdrawalReason.save()
        }

        return
    }

    appRoundSummary.poolBalanceExact = appRoundSummary.poolBalanceExact.minus(amountExact)
    appRoundSummary.poolBalance = decimals.toDecimals(appRoundSummary.poolBalanceExact, 18)
    appRoundSummary.poolDistributionsExact = appRoundSummary.poolDistributionsExact.plus(amountExact)
    appRoundSummary.poolDistributions = decimals.toDecimals(appRoundSummary.poolDistributionsExact, 18)
    appRoundSummary.save()
}

function countsAsDeposit(from: Bytes): boolean {
    return !from.equals(X_ALLOCATION_POOL) && !from.equals(DYNAMIC_BASE_ALLOCATIONS)
}

export function getCurrentRound(): Round {
    return fetchRound(CurrentRound.load('singleton')!.roundId.toString())
}

export function fetchAppRoundSummary(app: App, round: Round): AppRoundSummary {
    const id = appRoundSummaryId(app.id, round.id)
    let appRoundSummary = AppRoundSummary.load(id)
    if (appRoundSummary != null) {
        return appRoundSummary
    }

    appRoundSummary = new AppRoundSummary(id)

    const sustainabilityStats = new SustainabilityStats(sustainabilityStatsId(app.id, round.id))
    sustainabilityStats.participantsCountStart = app.participantsCount
    sustainabilityStats.actionCount = constants.BIGINT_ZERO
    sustainabilityStats.newUserCount = constants.BIGINT_ZERO
    sustainabilityStats.rewards = constants.BIGINT_ZERO
    sustainabilityStats.save()

    appRoundSummary.sustainabilityStats = sustainabilityStats.id
    appRoundSummary.app = app.id
    appRoundSummary.round = round.id
    appRoundSummary.activeUserCount = constants.BIGINT_ZERO
    appRoundSummary.poolAllocations = constants.BIGDECIMAL_ZERO
    appRoundSummary.poolAllocationsExact = constants.BIGINT_ZERO
    appRoundSummary.poolBalance = app.poolBalance
    appRoundSummary.poolBalanceExact = app.poolBalanceExact
    appRoundSummary.poolDeposits = constants.BIGDECIMAL_ZERO
    appRoundSummary.poolDepositsExact = constants.BIGINT_ZERO
    appRoundSummary.poolWithdrawals = constants.BIGDECIMAL_ZERO
    appRoundSummary.poolWithdrawalsExact = constants.BIGINT_ZERO
    appRoundSummary.poolDistributions = constants.BIGDECIMAL_ZERO
    appRoundSummary.poolDistributionsExact = constants.BIGINT_ZERO
    appRoundSummary.passportScore = constants.BIGINT_ZERO
    appRoundSummary.save()

    return appRoundSummary
}

export function fetchAccountRoundSustainability(account: Bytes, app: App, round: Round): AccountRoundSustainability {
    const id = accountRoundSustainabilityId(account, app.id, round.id)
    let accountRoundSustainability = AccountRoundSustainability.load(id)
    if (accountRoundSustainability != null) {
        return accountRoundSustainability
    }

    accountRoundSustainability = new AccountRoundSustainability(id)
    accountRoundSustainability.passportScore = constants.BIGINT_ZERO
    accountRoundSustainability.receivedRewards = constants.BIGINT_ZERO
    accountRoundSustainability.account = fetchAccount(Address.fromBytes(account)).id
    accountRoundSustainability.app = app.id
    accountRoundSustainability.round = round.id

    return accountRoundSustainability
}
