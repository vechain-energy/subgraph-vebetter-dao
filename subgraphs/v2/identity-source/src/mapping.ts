import { Address, BigInt, Bytes, Entity, Value, ethereum } from '@graphprotocol/graph-ts'
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
  Approval as VeDelegateApproval,
  ApprovalForAll as VeDelegateApprovalForAll,
  IVeDelegate,
  Transfer as VeDelegateTransfer,
} from '../generated/veDelegate/IVeDelegate'
import { ConfigUpdated } from '../generated/veDelegateConfigs/IVeDelegateConfigs'
import { NodeDelegated } from '../generated/nodeManagement/NodeManagement'
import {
  LevelChanged as ThorNodeLevelChanged,
  Transfer as ThorNodeTransfer,
} from '../generated/thorNode/ThorNode'
import {
  Stargate,
  Transfer as StargateTransfer,
} from '../generated/stargate/Stargate'
import {
  Lock2Earn,
  TermAdded,
  TermClosed,
  TermRenewed,
  Transfer as Lock2EarnTransfer,
} from '../generated/lock2Earn/Lock2Earn'
import {
  AddrChanged,
  NameChanged,
} from '../generated/vetDomains/Resolver'
import {
  Lock2EarnTermEvent,
  NftApprovalEvent,
  NftApprovalForAllEvent,
  NftTransferEvent,
  NodeDelegatedEvent,
  PassportDelegationEvent,
  PassportEntityLinkEvent,
  PassportListEvent,
  PassportRegisteredAction,
  ThorNodeLevelChangedEvent,
  UserSignalEvent,
  UserSignalsResetEvent,
  UserSignalsResetForAppEvent,
  VeDelegateConfigChangedEvent,
  VetDomainAddressChangedEvent,
  VetDomainNameChangedEvent,
} from '../generated/schema'
import { eventId } from '../../shared/src/events'

const VE_DELEGATE_ADDRESS = Address.fromString('0xfc32a9895C78CE00A1047d602Bd81Ea8134CC32b')

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

export function handleVeDelegateTransfer(event: VeDelegateTransfer): void {
  let poolAddress: Bytes | null = null
  const poolResult = IVeDelegate.bind(event.address).try_getPoolAddress(event.params.tokenId)
  if (!poolResult.reverted) {
    poolAddress = poolResult.value
  }
  saveNftTransfer(event, event.address, event.params.tokenId, event.params.from, event.params.to, poolAddress, -1, -1, false, false)
}

export function handleVeDelegateApproval(event: VeDelegateApproval): void {
  const entity = new NftApprovalEvent(eventId(event))
  entity.collection = event.address
  entity.tokenId = event.params.tokenId
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  setEventFields(entity, event)
  entity.save()
}

export function handleVeDelegateApprovalForAll(event: VeDelegateApprovalForAll): void {
  const entity = new NftApprovalForAllEvent(eventId(event))
  entity.collection = event.address
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved
  setEventFields(entity, event)
  entity.save()
}

export function handleConfigUpdated(event: ConfigUpdated): void {
  const entity = new VeDelegateConfigChangedEvent(eventId(event))
  entity.sender = event.params.sender
  entity.configId = event.params.configId
  entity.value = event.params.value
  setEventFields(entity, event)
  entity.save()
}

export function handleNodeDelegated(event: NodeDelegated): void {
  const entity = new NodeDelegatedEvent(eventId(event))
  entity.nodeId = event.params.nodeId
  entity.delegatee = event.params.delegatee
  entity.delegated = event.params.delegated
  setEventFields(entity, event)
  entity.save()
}

export function handleThorNodeTransfer(event: ThorNodeTransfer): void {
  saveNftTransfer(event, event.address, event.params._tokenId, event.params._from, event.params._to, null, -1, -1, false, false)
}

export function handleThorNodeLevelChanged(event: ThorNodeLevelChanged): void {
  const entity = new ThorNodeLevelChangedEvent(eventId(event))
  entity.tokenId = event.params._tokenId
  entity.owner = event.params._owner
  entity.fromLevel = event.params._fromLevel
  entity.toLevel = event.params._toLevel
  setEventFields(entity, event)
  entity.save()
}

export function handleStargateTransfer(event: StargateTransfer): void {
  let level = -1
  let isX = false
  const contract = Stargate.bind(event.address)
  const levelResult = contract.try_getTokenLevel(event.params.tokenId)
  if (!levelResult.reverted) {
    level = levelResult.value
  }
  const isXResult = contract.try_isXToken(event.params.tokenId)
  if (!isXResult.reverted) {
    isX = isXResult.value
  }
  saveNftTransfer(event, event.address, event.params.tokenId, event.params.from, event.params.to, null, level, levelToPoints(level), true, isX)
}

export function handleTermAdded(event: TermAdded): void {
  saveLockTerm(event, 'ADDED', event.params.tokenId, event.params.owner, event.params.amount, event.params.optionId, event.params.autoRenew)
}

export function handleTermClosed(event: TermClosed): void {
  saveLockTerm(event, 'CLOSED', event.params.tokenId, event.params.owner, event.params.amount, event.params.optionId, false)
}

export function handleTermRenewed(event: TermRenewed): void {
  saveLockTerm(event, 'RENEWED', event.params.tokenId, event.params.owner, event.params.amount, event.params.optionId, event.params.autoRenew)
}

export function handleLock2EarnTransfer(event: Lock2EarnTransfer): void {
  saveNftTransfer(event, event.address, event.params.tokenId, event.params.from, event.params.to, null, -1, -1, false, false)
}

export function handleAddrChanged(event: AddrChanged): void {
  const entity = new VetDomainAddressChangedEvent(eventId(event))
  entity.node = event.params.node
  entity.address = event.params.newAddress
  setEventFields(entity, event)
  entity.save()
}

export function handleNameChanged(event: NameChanged): void {
  const entity = new VetDomainNameChangedEvent(eventId(event))
  entity.node = event.params.node
  entity.name = event.params.name
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

function saveNftTransfer(
  event: ethereum.Event,
  collection: Bytes,
  tokenId: BigInt,
  from: Bytes,
  to: Bytes,
  poolAddress: Bytes | null,
  level: i32,
  points: i32,
  hasXState: boolean,
  isX: boolean,
): void {
  const entity = new NftTransferEvent(eventId(event))
  entity.collection = collection
  entity.tokenId = tokenId
  entity.from = from
  entity.to = to
  entity.poolAddress = poolAddress
  if (level >= 0) entity.level = level
  if (points >= 0) entity.points = points
  if (hasXState) entity.isX = isX
  setEventFields(entity, event)
  entity.save()
}

function saveLockTerm(event: ethereum.Event, action: string, tokenId: BigInt, owner: Bytes, amount: BigInt, optionId: BigInt, autoRenew: boolean): void {
  const entity = new Lock2EarnTermEvent(eventId(event))
  entity.action = action
  entity.tokenId = tokenId
  entity.owner = owner
  entity.amountExact = amount
  entity.optionId = optionId
  entity.autoRenew = autoRenew
  const contract = Lock2Earn.bind(event.address)
  const option = contract.try_getOption(optionId)
  const interval = contract.try_termInterval()
  const metadata = contract.try_getTokenMetadata(tokenId)
  let termLength = BigInt.zero()
  let termInterval = BigInt.zero()
  let startTime = BigInt.zero()
  let hasTermLength = false
  let hasTermInterval = false
  let hasStartTime = false
  if (!option.reverted) {
    hasTermLength = true
    termLength = option.value.timeLength
    entity.termLength = termLength
  }
  if (!interval.reverted) {
    hasTermInterval = true
    termInterval = interval.value
    entity.termInterval = termInterval
  }
  if (!metadata.reverted) {
    hasStartTime = true
    startTime = metadata.value.startTime
    entity.startTime = startTime
    entity.veDelegatePoolTokenId = metadata.value.veDelegatePoolTokenId
    const poolAddress = IVeDelegate.bind(VE_DELEGATE_ADDRESS).try_getPoolAddress(metadata.value.veDelegatePoolTokenId)
    if (!poolAddress.reverted) {
      entity.veDelegatePoolAddress = poolAddress.value
    }
  }
  if (hasStartTime && hasTermLength && hasTermInterval) {
    entity.endTime = startTime.plus(termLength.times(termInterval))
  }
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

function levelToPoints(level: i32): i32 {
  if (level == 1) return 2
  if (level == 2) return 13
  if (level == 3) return 50
  if (level == 4) return 3
  if (level == 5) return 9
  if (level == 6) return 35
  if (level == 7) return 100
  return 0
}
