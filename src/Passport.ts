import { PassportDelegation, PassportEntityLink, VeDelegateAccount, PassportWhitelist, PassportBlacklist, PassportScore, UserSignal, UserSignalsReset, UserSignalsResetForApp } from '../generated/schema'
import {
    DelegationPending as DelegationPendingEvent,
    DelegationCreated as DelegationCreatedEvent,
    DelegationRevoked as DelegationRevokedEvent,
    LinkPending as LinkPendingEvent,
    LinkCreated as LinkCreatedEvent,
    LinkRemoved as LinkRemovedEvent,
    RegisteredAction as RegisteredActionEvent,
    UserWhitelisted as UserWhitelistedEvent,
    RemovedUserFromWhitelist as RemovedUserFromWhitelistEvent,
    UserBlacklisted as UserBlacklistedEvent,
    RemovedUserFromBlacklist as RemovedUserFromBlacklistEvent,
    UserSignaled as UserSignaledEvent,
    UserSignalsReset as UserSignalsResetEvent,
    UserSignalsResetForApp as UserSignalsResetForAppEvent
} from '../generated/passport/Passport'
import { fetchAccount } from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'
import { transactions, events, constants } from '@amxx/graphprotocol-utils'
import { store, Address, BigInt } from '@graphprotocol/graph-ts'
import { fetchApp } from './XApps'
import { fetchRound, fetchStatistic } from './XAllocationVoting'
import { fetchAppRoundSummary, fetchAccountRoundSustainability } from './RewardsPool'
import { XAllocationVoting } from '../generated/RewardsPool/XAllocationVoting'
import { Passport } from '../generated/passport/Passport'

export function handleDelegationPending(event: DelegationPendingEvent): void {
    const id = [event.params.delegator.toHexString(), event.params.delegatee.toHexString(), 'delegation'].join('/').toString()
    let passport = PassportDelegation.load(id)
    if (passport == null) {
        passport = new PassportDelegation(id)
    }

    passport.delegatee = fetchAccount(event.params.delegatee).id
    passport.delegator = fetchAccount(event.params.delegator).id
    passport.active = false

    passport.emitter = event.address
    passport.timestamp = event.block.timestamp
    passport.transaction = transactions.log(event).id

    passport.save()
}

export function handleDelegationCreated(event: DelegationCreatedEvent): void {
    const id = [event.params.delegator.toHexString(), event.params.delegatee.toHexString(), 'delegation'].join('/').toString()
    let passport = PassportDelegation.load(id)
    if (passport == null) {
        passport = new PassportDelegation(id)
    }

    passport.delegatee = fetchAccount(event.params.delegatee).id
    passport.delegator = fetchAccount(event.params.delegator).id
    passport.active = true

    passport.emitter = event.address
    passport.timestamp = event.block.timestamp
    passport.transaction = transactions.log(event).id

    passport.save()

    const veAccount = VeDelegateAccount.load(event.params.delegatee)
    if (veAccount) {
        veAccount.passportDelegation = passport.id
        veAccount.save()
    }

}

export function handleDelegationRevoked(event: DelegationRevokedEvent): void {
    const id = [event.params.delegator.toHexString(), event.params.delegatee.toHexString(), 'delegation'].join('/').toString()
    const passport = PassportDelegation.load(id)

    if (!passport) {
        return
    }

    store.remove('PassportDelegation', id)

    const veAccount = VeDelegateAccount.load(passport.delegatee)
    if (veAccount) {
        veAccount.passportDelegation = null
        veAccount.save()
    }
}



export function handleLinkPending(event: LinkPendingEvent): void {
    const id = [event.params.entity.toHexString(), event.params.passport.toHexString(), 'link'].join('/').toString()
    let entityLink = PassportEntityLink.load(id)
    if (entityLink == null) {
        entityLink = new PassportEntityLink(id)
    }

    entityLink.passport = fetchAccount(event.params.passport).id
    entityLink.entity = fetchAccount(event.params.entity).id
    entityLink.active = false

    entityLink.emitter = event.address
    entityLink.timestamp = event.block.timestamp
    entityLink.transaction = transactions.log(event).id

    entityLink.save()
}

export function handleLinkCreated(event: LinkCreatedEvent): void {
    const id = [event.params.entity.toHexString(), event.params.passport.toHexString(), 'link'].join('/').toString()
    let entityLink = PassportEntityLink.load(id)
    if (entityLink == null) {
        entityLink = new PassportEntityLink(id)
    }

    entityLink.passport = fetchAccount(event.params.passport).id
    entityLink.entity = fetchAccount(event.params.entity).id
    entityLink.active = true

    entityLink.emitter = event.address
    entityLink.timestamp = event.block.timestamp
    entityLink.transaction = transactions.log(event).id

    entityLink.save()
}

export function handleLinkRemoved(event: LinkRemovedEvent): void {
    const id = [event.params.entity.toHexString(), event.params.passport.toHexString(), 'link'].join('/').toString()
    const entityLink = PassportEntityLink.load(id)

    if (!entityLink) {
        return
    }

    store.remove('PassportEntityLink', id)
}

export function handleRegisteredAction(event: RegisteredActionEvent): void {
    const app = fetchApp(event.params.appId)
    const round = fetchRound(event.params.round.toString())

    // stats for scores per App + Round
    const appRoundSummary = fetchAppRoundSummary(app, round)
    appRoundSummary.passportScore = appRoundSummary.passportScore.plus(event.params.actionScore)
    appRoundSummary.save()

    // stats for scores + Account + Round
    const accountRoundSustainability = fetchAccountRoundSustainability(event.params.passport, app, round)
    accountRoundSustainability.passportScore = accountRoundSustainability.passportScore.plus(event.params.actionScore)
    accountRoundSustainability.save()

    // stats for scores per Round
    const stats = fetchStatistic(round.id, "")
    stats.totalActionScores = stats.totalActionScores.plus(event.params.actionScore)
    stats.save()

    const passportScore = new PassportScore(events.id(event))
    passportScore.user = fetchAccount(event.params.user).id
    passportScore.passport = fetchAccount(event.params.passport).id
    passportScore.round = round.id
    passportScore.app = app.id
    passportScore.score = event.params.actionScore

    passportScore.emitter = event.address
    passportScore.transaction = transactions.log(event).id
    passportScore.timestamp = event.block.timestamp
    passportScore.save()
}

export function handleUserWhitelisted(event: UserWhitelistedEvent): void {
    const id = event.params.user
    let whitelist = PassportWhitelist.load(id)
    if (whitelist == null) {
        whitelist = new PassportWhitelist(id)
    }

    whitelist.user = fetchAccount(event.params.user).id
    whitelist.whitelistedBy = fetchAccount(event.params.whitelistedBy).id
    whitelist.active = true

    whitelist.save()
}

export function handleRemovedUserFromWhitelist(event: RemovedUserFromWhitelistEvent): void {
    const id = event.params.user
    const whitelist = PassportWhitelist.load(id)
    if (!whitelist) { return }

    whitelist.active = false
    whitelist.save()
}

export function handleUserBlacklisted(event: UserBlacklistedEvent): void {
    const id = event.params.user
    let blacklist = PassportBlacklist.load(id)
    if (blacklist == null) {
        blacklist = new PassportBlacklist(id)
    }

    blacklist.user = fetchAccount(event.params.user).id
    blacklist.blacklistedBy = fetchAccount(event.params.blacklistedBy).id
    blacklist.active = true

    blacklist.save()
}

export function handleRemovedUserFromBlacklist(event: RemovedUserFromBlacklistEvent): void {
    const id = event.params.user
    const blacklist = PassportBlacklist.load(id)
    if (!blacklist) { return }

    blacklist.active = false
    blacklist.save()
}

export function handleUserSignaled(event: UserSignaledEvent): void {
    const id = [event.params.user.toHexString(), event.params.app.toHexString()].join('/')
    let signal = UserSignal.load(id)
    if (signal === null) {
        signal = new UserSignal(id)
        signal.user = fetchAccount(event.params.user).id
        signal.app = fetchApp(event.params.app).id
        signal.signalCount = constants.BIGINT_ZERO
        signal.reason = event.params.reason
    }

    signal.signalCount = signal.signalCount.plus(constants.BIGINT_ONE)
    signal.emitter = event.address
    signal.timestamp = event.block.timestamp
    signal.transaction = transactions.log(event).id

    signal.save()
}

export function handleUserSignalsReset(event: UserSignalsResetEvent): void {
    const reset = new UserSignalsReset(events.id(event))
    reset.user = fetchAccount(event.params.user).id
    reset.appsCount = constants.BIGINT_ZERO
    reset.reason = event.params.reason

    // Since we can't query all signals for a user directly in AssemblyScript,
    // we'll just create the reset event. The signals will be considered reset
    // when querying by checking if there's a reset event after their timestamp
    reset.emitter = event.address
    reset.timestamp = event.block.timestamp
    reset.transaction = transactions.log(event).id

    reset.save()
}

export function handleUserSignalsResetForApp(event: UserSignalsResetForAppEvent): void {
    const id = [event.params.user.toHexString(), event.params.app.toHexString()].join('/')
    const signal = UserSignal.load(id)

    const reset = new UserSignalsResetForApp(events.id(event))
    reset.user = fetchAccount(event.params.user).id
    reset.app = fetchApp(event.params.app).id
    reset.previousSignalCount = signal ? signal.signalCount : constants.BIGINT_ZERO
    reset.reason = event.params.reason

    if (signal) {
        store.remove('UserSignal', id)
    }

    reset.emitter = event.address
    reset.timestamp = event.block.timestamp
    reset.transaction = transactions.log(event).id

    reset.save()
}

export function getUserPassportForRound(address: Address, roundId: string): Address {
    const b3trGov = XAllocationVoting.bind(Address.fromString("0x89A00Bb0947a30FF95BEeF77a66AEdE3842Fe5B7"))
    const passport = Passport.bind(Address.fromString("0x35a267671d8EDD607B2056A9a13E7ba7CF53c8b3"))

    // get snapshot of round
    const snapshotTimepoint = b3trGov.roundSnapshot(BigInt.fromString(roundId));
    if (snapshotTimepoint.isZero()) { return address; } // Check if snapshot timepoint is valid

    // is delegatee
    const isDelegatee = passport.isDelegateeInTimepoint(address, snapshotTimepoint);
    if (!isDelegatee) { return address; }

    // delegator
    const delegator = passport.getDelegatorInTimepoint(address, snapshotTimepoint);
    return delegator;
}
