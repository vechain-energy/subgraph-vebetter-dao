import { Address, Bytes, Entity, Value, ethereum } from '@graphprotocol/graph-ts'
import {
  ProposalCanceled as ProposalCanceledChainEvent,
  ProposalCreated as ProposalCreatedChainEvent,
  ProposalDeposit as ProposalDepositChainEvent,
  ProposalExecuted as ProposalExecutedChainEvent,
  ProposalQueued as ProposalQueuedChainEvent,
  VoteCast as VoteCastChainEvent,
} from '../generated/governor/Governor'
import {
  CallExecuted as CallExecutedEvent,
  CallScheduled as CallScheduledEvent,
  Cancelled as CancelledEvent,
  MinDelayChange as MinDelayChangeEvent,
} from '../generated/timelock/Timelock'
import {
  DelegateChanged as DelegateChangedEvent,
  DelegateVotesChanged as DelegateVotesChangedEvent,
} from '../generated/voting/Voting'
import { ProposalMetadataDocument as ProposalMetadataDocumentTemplate } from '../generated/templates'
import {
  ProposalCanceledEvent,
  ProposalCreatedEvent,
  ProposalDepositEvent,
  ProposalExecutedEvent,
  ProposalQueuedEvent,
  ProposalVoteCastEvent,
  TimelockCallExecutedEvent,
  TimelockCallScheduledEvent,
  TimelockCancelledEvent,
  TimelockMinDelayChangedEvent,
  VoteDelegationChangedEvent,
  VoteWeightChangedEvent,
} from '../generated/schema'
import { eventId } from '../../shared/src/events'

export function handleProposalCreated(event: ProposalCreatedChainEvent): void {
  const entity = new ProposalCreatedEvent(eventId(event))
  entity.proposalId = event.params.proposalId
  entity.proposer = event.params.proposer
  entity.targets = addressArrayToBytes(event.params.targets)
  entity.values = event.params.values
  entity.signatures = event.params.signatures
  entity.calldatas = event.params.calldatas
  entity.descriptionURI = event.params.description
  entity.roundIdVoteStart = event.params.roundIdVoteStart
  entity.depositThreshold = event.params.depositThreshold
  setEventFields(entity, event)
  entity.save()
  ProposalMetadataDocumentTemplate.create(event.params.description)
}

export function handleProposalQueued(event: ProposalQueuedChainEvent): void {
  const entity = new ProposalQueuedEvent(eventId(event))
  entity.proposalId = event.params.proposalId
  entity.etaSeconds = event.params.etaSeconds
  setEventFields(entity, event)
  entity.save()
}

export function handleProposalExecuted(event: ProposalExecutedChainEvent): void {
  const entity = new ProposalExecutedEvent(eventId(event))
  entity.proposalId = event.params.proposalId
  setEventFields(entity, event)
  entity.save()
}

export function handleProposalCanceled(event: ProposalCanceledChainEvent): void {
  const entity = new ProposalCanceledEvent(eventId(event))
  entity.proposalId = event.params.proposalId
  setEventFields(entity, event)
  entity.save()
}

export function handleVoteCast(event: VoteCastChainEvent): void {
  const entity = new ProposalVoteCastEvent(eventId(event))
  entity.proposalId = event.params.proposalId
  entity.voter = event.params.voter
  entity.support = event.params.support
  entity.weight = event.params.weight
  entity.power = event.params.power
  entity.reason = event.params.reason
  setEventFields(entity, event)
  entity.save()
}

export function handleProposalDeposit(event: ProposalDepositChainEvent): void {
  const entity = new ProposalDepositEvent(eventId(event))
  entity.proposalId = event.params.proposalId
  entity.depositor = event.params.depositor
  entity.amountExact = event.params.amount
  setEventFields(entity, event)
  entity.save()
}

export function handleCallScheduled(event: CallScheduledEvent): void {
  const entity = new TimelockCallScheduledEvent(eventId(event))
  entity.operationId = event.params.id
  entity.index = event.params.index
  entity.target = event.params.target
  entity.valueExact = event.params.value
  entity.data = event.params.data
  entity.predecessor = event.params.predecessor
  entity.delay = event.params.delay
  setEventFields(entity, event)
  entity.save()
}

export function handleCallExecuted(event: CallExecutedEvent): void {
  const entity = new TimelockCallExecutedEvent(eventId(event))
  entity.operationId = event.params.id
  entity.index = event.params.index
  entity.target = event.params.target
  entity.valueExact = event.params.value
  entity.data = event.params.data
  setEventFields(entity, event)
  entity.save()
}

export function handleCancelled(event: CancelledEvent): void {
  const entity = new TimelockCancelledEvent(eventId(event))
  entity.operationId = event.params.id
  setEventFields(entity, event)
  entity.save()
}

export function handleMinDelayChange(event: MinDelayChangeEvent): void {
  const entity = new TimelockMinDelayChangedEvent(eventId(event))
  entity.oldDuration = event.params.oldDuration
  entity.newDuration = event.params.newDuration
  setEventFields(entity, event)
  entity.save()
}

export function handleDelegateChanged(event: DelegateChangedEvent): void {
  const entity = new VoteDelegationChangedEvent(eventId(event))
  entity.delegator = event.params.delegator
  entity.fromDelegate = event.params.fromDelegate
  entity.toDelegate = event.params.toDelegate
  setEventFields(entity, event)
  entity.save()
}

export function handleDelegateVotesChanged(event: DelegateVotesChangedEvent): void {
  const entity = new VoteWeightChangedEvent(eventId(event))
  entity.delegate = event.params.delegate
  entity.previousBalance = event.params.previousBalance
  entity.newBalance = event.params.newBalance
  setEventFields(entity, event)
  entity.save()
}

function addressArrayToBytes(addresses: Array<Address>): Array<Bytes> {
  const out = new Array<Bytes>(addresses.length)
  for (let i = 0; i < addresses.length; i++) {
    out[i] = addresses[i]
  }
  return out
}

function setEventFields(entity: Entity, event: ethereum.Event): void {
  entity.set('blockNumber', Value.fromBigInt(event.block.number))
  entity.set('timestamp', Value.fromBigInt(event.block.timestamp))
  entity.set('txHash', Value.fromBytes(event.transaction.hash))
  entity.set('logIndex', Value.fromBigInt(event.logIndex))
  entity.set('emitter', Value.fromBytes(event.address))
}
