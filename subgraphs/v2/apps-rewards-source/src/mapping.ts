import { BigInt, Bytes, DataSourceContext, Entity, Value } from '@graphprotocol/graph-ts'

import {
  AllocationVoteCast as AllocationVoteCastEvent,
  RoundCreated as RoundCreatedChainEvent,
} from '../generated/xallocationvoting/XAllocationVoting'
import {
  RewardClaimed as RewardClaimedEvent,
  RewardClaimedV2 as RewardClaimedV2Event,
  VoteRegistered as VoteRegisteredEvent,
  GMVoteRegistered as GMVoteRegisteredEvent,
} from '../generated/rewarder/Rewarder'
import {
  AllocationRewardsClaimed as AllocationRewardsClaimedEvent,
} from '../generated/xallocationpool/XAllocationPool'
import {
  AppAdded as AppAddedEvent,
  AppMetadataURIUpdated as AppMetadataURIUpdatedEvent,
  VotingEligibilityUpdated as VotingEligibilityUpdatedEvent,
  BlacklistUpdated as BlacklistUpdatedEvent,
  AppEndorsed as AppEndorsedEvent,
  AppEndorsementStatusUpdated as AppEndorsementStatusUpdatedEvent,
} from '../generated/x2earnapps/XApps'
import {
  NewDeposit as NewDepositEvent,
  RewardDistributed as RewardDistributedEvent,
  TeamWithdrawal as TeamWithdrawalEvent,
} from '../generated/RewardsPool/RewardsPool'
import {
  FundsDistributedToApp as FundsDistributedToAppEvent,
} from '../generated/DynamicBaseAllocations/DynamicBaseAllocations'
import {
  AllocationVoteCastEvent as AllocationVoteCastEntity,
  AppAllocationFunded,
  AppBlacklistChanged,
  AppEndorsementChanged,
  AppEndorsementStatusChanged,
  AppMetadataChanged,
  AppRegistered,
  AppRewardTransfer,
  AppVotingEligibilityChanged,
  RoundCreatedEvent,
  RoundGMVoteRegistered,
  RoundRewardClaimed,
  RoundRewardVoteRegistered,
} from '../generated/schema'
import {
  eventId,
} from '../../shared/src/events'
import {
  AppMetadataDocument as AppMetadataDocumentTemplate,
  SustainabilityProofDocument as SustainabilityProofDocumentTemplate,
} from '../generated/templates'
import { saveInlineSustainabilityProof } from './metadata'

const ZERO = BigInt.fromI32(0)

export function handleAppAdded(event: AppAddedEvent): void {
  const entity = new AppRegistered(eventId(event))
  entity.app = event.params.id
  entity.owner = event.params.addr
  entity.name = event.params.name
  entity.votingEligibility = event.params.appAvailableForAllocationVoting
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.createdAt = event.block.timestamp
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
    AppMetadataDocumentTemplate.create(event.params.newMetadataURI)
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

export function handleAllocationVoteCast(event: AllocationVoteCastEvent): void {
  const entity = new AllocationVoteCastEntity(eventId(event))
  entity.voter = event.params.voter
  entity.round = event.params.roundId.toString()
  entity.roundId = event.params.roundId
  entity.apps = bytesArrayToCsv(event.params.appsIds)
  entity.voteWeights = bigIntArrayToCsv(event.params.voteWeights)
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.save()
}

export function handleNewDeposit(event: NewDepositEvent): void {
  saveRewardTransfer(
    eventId(event),
    event.params.appId,
    '',
    event.params.amount,
    'DEPOSIT',
    event.params.depositor,
    null,
    null,
    null,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
    event.logIndex,
  )
}

export function handleTeamWithdrawal(event: TeamWithdrawalEvent): void {
  saveRewardTransfer(
    eventId(event),
    event.params.appId,
    '',
    event.params.amount,
    'WITHDRAW',
    event.params.withdrawer,
    event.params.teamWallet,
    event.params.reason,
    null,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
    event.logIndex,
  )
}

export function handleRewardDistribution(event: RewardDistributedEvent): void {
  const id = eventId(event)
  saveRewardTransfer(
    id,
    event.params.appId,
    '',
    event.params.amount,
    'DISTRIBUTION',
    event.params.distributor,
    event.params.receiver,
    null,
    event.params.proof,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
    event.logIndex,
  )
  saveSustainabilityProofDocument(
    id,
    event.params.proof,
    event.params.appId,
    event.params.receiver,
    event.params.amount,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
    event.logIndex,
  )
}

export function handleAllocationRewardsClaimed(event: AllocationRewardsClaimedEvent): void {
  const entity = new AppAllocationFunded(eventId(event))
  const targetRound = event.params.roundId.plus(BigInt.fromI32(1)).toString()
  entity.app = event.params.appId
  entity.round = event.params.roundId.toString()
  entity.targetRound = targetRound
  entity.amountExact = event.params.totalAmount
  entity.recipient = event.params.recipient
  entity.caller = event.params.caller
  entity.unallocatedAmount = event.params.unallocatedAmount
  entity.teamAllocationAmount = event.params.teamAllocationAmount
  entity.rewardsAllocationAmount = event.params.rewardsAllocationAmount
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.save()
}

export function handleFundsDistributedToApp(event: FundsDistributedToAppEvent): void {
  const entity = new AppAllocationFunded(eventId(event))
  entity.app = event.params.appId
  entity.round = event.params.roundId.toString()
  entity.targetRound = null
  entity.amountExact = event.params.amount
  entity.recipient = null
  entity.caller = null
  entity.unallocatedAmount = null
  entity.teamAllocationAmount = null
  entity.rewardsAllocationAmount = null
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.save()
}

export function handleRewardClaimed(event: RewardClaimedEvent): void {
  saveRoundRewardClaimed(eventId(event), event.params.cycle, event.params.voter, event.params.reward, ZERO, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
}

export function handleRewardClaimedV2(event: RewardClaimedV2Event): void {
  saveRoundRewardClaimed(eventId(event), event.params.cycle, event.params.voter, event.params.reward, event.params.gmReward, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
}

export function handleRewardVoteRegistered(event: VoteRegisteredEvent): void {
  const entity = new RoundRewardVoteRegistered(eventId(event))
  entity.round = event.params.cycle.toString()
  entity.cycle = event.params.cycle
  entity.voter = event.params.voter
  entity.votePower = event.params.votes
  entity.rewardWeightedVote = event.params.rewardWeightedVote
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.save()
}

export function handleGMVoteRegistered(event: GMVoteRegisteredEvent): void {
  const entity = new RoundGMVoteRegistered(eventId(event))
  entity.round = event.params.cycle.toString()
  entity.cycle = event.params.cycle
  entity.tokenId = event.params.tokenId
  entity.level = event.params.level
  entity.multiplier = event.params.multiplier
  setEventFields(entity, event.address, event.block.number, event.block.timestamp, event.transaction.hash, event.logIndex)
  entity.save()
}

function saveRoundRewardClaimed(
  id: Bytes,
  cycle: BigInt,
  voter: Bytes,
  rewardExact: BigInt,
  gmRewardExact: BigInt,
  emitter: Bytes,
  sourceBlock: BigInt,
  sourceTimestamp: BigInt,
  sourceTxHash: Bytes,
  sourceLogIndex: BigInt,
): void {
  const entity = new RoundRewardClaimed(id)
  entity.round = cycle.toString()
  entity.cycle = cycle
  entity.voter = voter
  entity.rewardExact = rewardExact
  entity.gmRewardExact = gmRewardExact
  setEventFields(entity, emitter, sourceBlock, sourceTimestamp, sourceTxHash, sourceLogIndex)
  entity.save()
}

function saveRewardTransfer(
  id: Bytes,
  app: Bytes,
  round: string,
  amountExact: BigInt,
  kind: string,
  from: Bytes | null,
  to: Bytes | null,
  reason: string | null,
  proof: string | null,
  emitter: Bytes,
  sourceBlock: BigInt,
  sourceTimestamp: BigInt,
  sourceTxHash: Bytes,
  sourceLogIndex: BigInt,
): void {
  const entity = new AppRewardTransfer(id)
  entity.app = app
  entity.round = round
  entity.amountExact = amountExact
  entity.kind = kind
  entity.from = from
  entity.to = to
  entity.reason = reason
  entity.proof = proof
  setEventFields(entity, emitter, sourceBlock, sourceTimestamp, sourceTxHash, sourceLogIndex)
  entity.save()
}

function saveSustainabilityProofDocument(
  transferId: Bytes,
  proof: string,
  app: Bytes,
  account: Bytes,
  rewardExact: BigInt,
  emitter: Bytes,
  sourceBlock: BigInt,
  sourceTimestamp: BigInt,
  sourceTxHash: Bytes,
  sourceLogIndex: BigInt,
): void {
  if (proof.length == 0) {
    return
  }
  if (proof.startsWith('ipfs://')) {
    const context = new DataSourceContext()
    context.set('transfer', Value.fromBytes(transferId))
    context.set('app', Value.fromBytes(app))
    context.set('round', Value.fromString(''))
    context.set('account', Value.fromBytes(account))
    context.set('rewardExact', Value.fromBigInt(rewardExact))
    context.set('blockNumber', Value.fromBigInt(sourceBlock))
    context.set('timestamp', Value.fromBigInt(sourceTimestamp))
    context.set('txHash', Value.fromBytes(sourceTxHash))
    context.set('logIndex', Value.fromBigInt(sourceLogIndex))
    context.set('emitter', Value.fromBytes(emitter))
    SustainabilityProofDocumentTemplate.createWithContext(proof, context)
    return
  }
  if (!proof.startsWith('{')) {
    return
  }
  saveInlineSustainabilityProof(
    transferId.toHexString().concat('/proof'),
    proof,
    app,
    transferId,
    '',
    account,
    rewardExact,
    sourceBlock,
    sourceTimestamp,
    sourceTxHash,
    sourceLogIndex,
    emitter,
  )
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

function bigIntArrayToCsv(values: BigInt[]): string {
  let result = ''
  for (let index = 0; index < values.length; index++) {
    if (index > 0) {
      result = result.concat(',')
    }
    result = result.concat(values[index].toString())
  }
  return result
}
