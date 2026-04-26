import { BigInt, Bytes, Entity, Value } from '@graphprotocol/graph-ts'
import {
  RoundCreated as RoundCreatedChainEvent,
} from '../generated/xallocationvoting/XAllocationVoting'
import {
  AppAdded as AppAddedEvent,
  AppEndorsed as AppEndorsedEvent,
  AppEndorsementStatusUpdated as AppEndorsementStatusUpdatedEvent,
  AppMetadataURIUpdated as AppMetadataURIUpdatedEvent,
  BlacklistUpdated as BlacklistUpdatedEvent,
  VotingEligibilityUpdated as VotingEligibilityUpdatedEvent,
} from '../generated/x2earnapps/XApps'
import {
  AppBlacklistChanged,
  AppEndorsementChanged,
  AppEndorsementStatusChanged,
  AppMetadataChanged,
  AppRegistered,
  AppVotingEligibilityChanged,
  RoundCreatedEvent,
} from '../generated/schema'
import { AppMetadataDocument as AppMetadataDocumentTemplate } from '../generated/templates'
import { eventId } from '../../shared/src/events'

export function handleAppAdded(event: AppAddedEvent): void {
  const entity = new AppRegistered(eventId(event))
  entity.app = event.params.id
  entity.owner = event.params.addr
  entity.name = event.params.name
  entity.votingEligibility = event.params.appAvailableForAllocationVoting
  entity.createdAt = event.block.timestamp
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.save()
}

export function handleAppMetadataURIUpdated(event: AppMetadataURIUpdatedEvent): void {
  const entity = new AppMetadataChanged(eventId(event))
  entity.app = event.params.appId
  entity.oldMetadataURI = event.params.oldMetadataURI
  entity.metadataURI = event.params.newMetadataURI
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.save()
  if (event.params.newMetadataURI.length > 0) {
    const metadataPath = ipfsPath(event.params.newMetadataURI)
    if (metadataPath.length > 0) {
      AppMetadataDocumentTemplate.create(metadataPath)
    }
  }
}

export function handleAppVotingEligibilityUpdated(event: VotingEligibilityUpdatedEvent): void {
  const entity = new AppVotingEligibilityChanged(eventId(event))
  entity.app = event.params.appId
  entity.votingEligibility = event.params.isAvailable
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.save()
}

export function handleAppBlackListUpdated(event: BlacklistUpdatedEvent): void {
  const entity = new AppBlacklistChanged(eventId(event))
  entity.app = event.params.appId
  entity.isBlacklisted = event.params.isBlacklisted
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.save()
}

export function handleAppEndorsed(event: AppEndorsedEvent): void {
  const entity = new AppEndorsementChanged(eventId(event))
  entity.app = event.params.id
  entity.nodeId = event.params.nodeId
  entity.endorsed = event.params.endorsed
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.save()
}

export function handleAppEndorsementStatusUpdated(event: AppEndorsementStatusUpdatedEvent): void {
  const entity = new AppEndorsementStatusChanged(eventId(event))
  entity.app = event.params.appId
  entity.endorsed = event.params.endorsed
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.save()
}

export function handleRoundCreated(event: RoundCreatedChainEvent): void {
  const entity = new RoundCreatedEvent(eventId(event))
  entity.round = event.params.roundId.toString()
  entity.roundId = event.params.roundId
  entity.creator = event.params.proposer
  entity.voteStart = event.params.voteStart
  entity.voteEnd = event.params.voteEnd
  entity.apps = bytesArrayToCsv(event.params.appsIds)
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.save()
}

function setEventFields(
  entity: Entity,
  emitter: Bytes,
  sourceBlock: BigInt,
  sourceTimestamp: BigInt,
  sourceTxHash: Bytes,
  sourceLogIndex: BigInt,
): void {
  entity.set('blockNumber', Value.fromBigInt(sourceBlock))
  entity.set('timestamp', Value.fromBigInt(sourceTimestamp))
  entity.set('txHash', Value.fromBytes(sourceTxHash))
  entity.set('logIndex', Value.fromBigInt(sourceLogIndex))
  entity.set('emitter', Value.fromBytes(emitter))
}

function bytesArrayToCsv(values: Bytes[]): string {
  let result = ''
  for (let index = 0; index < values.length; index++) {
    if (index > 0) {
      result = result.concat(',')
    }
    result = result.concat(values[index].toHexString())
  }
  return result
}

function ipfsPath(uri: string): string {
  if (uri.length == 0) return ''
  if (uri.indexOf('ipfs://') == 0) return uri.substr(7)
  if (uri.indexOf('https://ipfs.io/ipfs/') == 0) return uri.substr(21)
  if (uri.indexOf('https://gateway.pinata.cloud/ipfs/') == 0) return uri.substr(34)
  if (uri.indexOf('Qm') == 0) return uri
  if (uri.indexOf('bafy') == 0) return uri
  return ''
}
