import { Bytes, Entity, Value, ethereum } from '@graphprotocol/graph-ts'
import {
  DelegationCreated,
  DelegationPending,
  DelegationRevoked,
  LinkCreated,
  LinkPending,
  LinkRemoved,
  RegisteredAction,
  RemovedUserFromBlacklist,
  RemovedUserFromWhitelist,
  UserBlacklisted,
  UserSignaled,
  UserSignalsReset,
  UserSignalsResetForApp,
  UserWhitelisted,
} from '../generated/passport/Passport'
import {
  PassportDelegationEvent,
  PassportEntityLinkEvent,
  PassportListEvent,
  PassportRegisteredAction,
  UserSignalEvent,
  UserSignalsResetEvent,
  UserSignalsResetForAppEvent,
} from '../generated/schema'
import { eventId } from '../../shared/src/events'

export function handleDelegationPending(event: DelegationPending): void {
  saveDelegation(event, 'PENDING', event.params.delegator, event.params.delegatee)
}

export function handleDelegationCreated(event: DelegationCreated): void {
  saveDelegation(event, 'CREATED', event.params.delegator, event.params.delegatee)
}

export function handleDelegationRevoked(event: DelegationRevoked): void {
  saveDelegation(event, 'REVOKED', event.params.delegator, event.params.delegatee)
}

export function handleLinkPending(event: LinkPending): void {
  saveLink(event, 'PENDING', event.params.entity, event.params.passport)
}

export function handleLinkCreated(event: LinkCreated): void {
  saveLink(event, 'CREATED', event.params.entity, event.params.passport)
}

export function handleLinkRemoved(event: LinkRemoved): void {
  saveLink(event, 'REMOVED', event.params.entity, event.params.passport)
}

export function handleRegisteredAction(event: RegisteredAction): void {
  const entity = new PassportRegisteredAction(eventId(event))
  entity.user = event.params.user
  entity.passport = event.params.passport
  entity.app = event.params.appId
  entity.round = event.params.round.toString()
  entity.roundId = event.params.round
  entity.actionScore = event.params.actionScore
  setEventFields(entity, event)
  entity.save()
}

export function handleUserWhitelisted(event: UserWhitelisted): void {
  saveList(event, 'WHITELIST', true, event.params.user, null, event.params.whitelistedBy)
}

export function handleRemovedUserFromWhitelist(event: RemovedUserFromWhitelist): void {
  saveList(event, 'WHITELIST', false, event.params.user, event.params.passport, event.params.removedBy)
}

export function handleUserBlacklisted(event: UserBlacklisted): void {
  saveList(event, 'BLACKLIST', true, event.params.user, null, event.params.blacklistedBy)
}

export function handleRemovedUserFromBlacklist(event: RemovedUserFromBlacklist): void {
  saveList(event, 'BLACKLIST', false, event.params.user, null, event.params.removedBy)
}

export function handleUserSignaled(event: UserSignaled): void {
  const entity = new UserSignalEvent(eventId(event))
  entity.user = event.params.user
  entity.signaler = event.params.signaler
  entity.app = event.params.app
  entity.reason = event.params.reason
  setEventFields(entity, event)
  entity.save()
}

export function handleUserSignalsReset(event: UserSignalsReset): void {
  const entity = new UserSignalsResetEvent(eventId(event))
  entity.user = event.params.user
  entity.reason = event.params.reason
  setEventFields(entity, event)
  entity.save()
}

export function handleUserSignalsResetForApp(event: UserSignalsResetForApp): void {
  const entity = new UserSignalsResetForAppEvent(eventId(event))
  entity.user = event.params.user
  entity.app = event.params.app
  entity.reason = event.params.reason
  setEventFields(entity, event)
  entity.save()
}

function saveDelegation(event: ethereum.Event, action: string, delegator: Bytes, delegatee: Bytes): void {
  const entity = new PassportDelegationEvent(eventId(event))
  entity.action = action
  entity.delegator = delegator
  entity.delegatee = delegatee
  setEventFields(entity, event)
  entity.save()
}

function saveLink(event: ethereum.Event, action: string, linkedEntity: Bytes, passport: Bytes): void {
  const entity = new PassportEntityLinkEvent(eventId(event))
  entity.action = action
  entity.entity = linkedEntity
  entity.passport = passport
  setEventFields(entity, event)
  entity.save()
}

function saveList(event: ethereum.Event, list: string, active: boolean, user: Bytes, passport: Bytes | null, actor: Bytes): void {
  const entity = new PassportListEvent(eventId(event))
  entity.list = list
  entity.active = active
  entity.user = user
  entity.passport = passport
  entity.actor = actor
  setEventFields(entity, event)
  entity.save()
}

function setEventFields(entity: Entity, event: ethereum.Event): void {
  entity.set('blockNumber', Value.fromBigInt(event.block.number))
  entity.set('timestamp', Value.fromBigInt(event.block.timestamp))
  entity.set('txHash', Value.fromBytes(event.transaction.hash))
  entity.set('logIndex', Value.fromBigInt(event.logIndex))
  entity.set('emitter', Value.fromBytes(event.address))
}
