import { PassportDelegation, PassportEntityLink, VeDelegateAccount, PassportWhitelist, PassportBlacklist } from '../generated/schema'
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
    RemovedUserFromBlacklist as RemovedUserFromBlacklistEvent
} from '../generated/passport/Passport'
import { fetchAccount } from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'
import { transactions, events } from '@amxx/graphprotocol-utils'
import { store } from '@graphprotocol/graph-ts'
import { fetchApp } from './XApps'
import { fetchRound, fetchStatistic } from './XAllocationVoting'
import { fetchAppRoundSummary, fetchAccountRoundSustainability } from './RewardsPool'

export function handleDelegationPending(event: DelegationPendingEvent): void {
    const id = [event.params.delegator, event.params.delegatee].join('/').toString()
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
    const id = [event.params.delegator, event.params.delegatee].join('/').toString()
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
    const id = [event.params.delegator, event.params.delegatee].join('/').toString()
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
    const id = [event.params.entity, event.params.passport].join('/').toString()
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
    const id = [event.params.entity, event.params.passport].join('/').toString()
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
    const id = [event.params.entity, event.params.passport].join('/').toString()
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
    const accountRoundSustainability = fetchAccountRoundSustainability(event.params.user, app, round)
    accountRoundSustainability.passportScore = accountRoundSustainability.passportScore.plus(event.params.actionScore)
    accountRoundSustainability.save()

    // stats for scores per Round
    const stats = fetchStatistic(round.id, "")
    stats.totalActionScores = stats.totalActionScores.plus(event.params.actionScore)
    stats.save()
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
