import { Address, BigInt, Entity, Value, ValueKind, store } from '@graphprotocol/graph-ts'

import { Account } from '../generated/schema'

export function fetchAccount(address: Address): Account {
  let account = Account.load(address)

  if (account == null) {
    account = new Account(address)
    account.save()
  }

  return account
}

export function incrementAccountAllocationActivity(
  account: Account,
  voteWeight: BigInt,
  qfWeight: BigInt,
  timestamp: BigInt
): void {
  let entity = loadAccountEntity(account)
  incrementBigIntField(entity, 'allocationVoteCount', BigInt.fromI32(1))
  incrementBigIntField(entity, 'allocationVotesCastExact', voteWeight)
  incrementBigIntField(entity, 'allocationQfWeightExact', qfWeight)
  entity.set('lastActivityTimestamp', Value.fromBigInt(timestamp))
  store.set('Account', account.id.toHexString(), entity)
}

export function incrementAccountProposalActivity(
  account: Account,
  votesCast: BigInt,
  weightCast: BigInt,
  timestamp: BigInt
): void {
  let entity = loadAccountEntity(account)
  incrementBigIntField(entity, 'proposalVoteCount', BigInt.fromI32(1))
  incrementBigIntField(entity, 'proposalVotesCast', votesCast)
  incrementBigIntField(entity, 'proposalWeightCast', weightCast)
  entity.set('lastActivityTimestamp', Value.fromBigInt(timestamp))
  store.set('Account', account.id.toHexString(), entity)
}

export function incrementAccountRewardClaims(
  account: Account,
  timestamp: BigInt
): void {
  let entity = loadAccountEntity(account)
  incrementBigIntField(entity, 'rewardClaimCount', BigInt.fromI32(1))
  entity.set('lastActivityTimestamp', Value.fromBigInt(timestamp))
  store.set('Account', account.id.toHexString(), entity)
}

export function incrementAccountPassportActivity(
  account: Account,
  score: BigInt,
  timestamp: BigInt
): void {
  let entity = loadAccountEntity(account)
  incrementBigIntField(entity, 'passportActionCount', BigInt.fromI32(1))
  incrementBigIntField(entity, 'passportScoreTotal', score)
  entity.set('lastActivityTimestamp', Value.fromBigInt(timestamp))
  store.set('Account', account.id.toHexString(), entity)
}

function loadAccountEntity(account: Account): Entity {
  let entity = store.get('Account', account.id.toHexString())
  if (entity == null) {
    entity = new Entity()
    entity.set('id', Value.fromBytes(account.id))
  }

  return entity
}

function incrementBigIntField(entity: Entity, field: string, delta: BigInt): void {
  let current = entity.get(field)
  if (current == null || current.kind == ValueKind.NULL) {
    entity.set(field, Value.fromBigInt(delta))
    return
  }

  entity.set(field, Value.fromBigInt(current.toBigInt().plus(delta)))
}
