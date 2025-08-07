import { Bytes } from '@graphprotocol/graph-ts'

import {
	ProposalCreated,
	ProposalQueued,
	ProposalExecuted,
	ProposalCanceled,
	ProposalDeposit,
	VoteCast,
	VoteReceipt,
	ProposalVote
} from '../generated/schema'
import { ProposalMetadata as ProposalMetadataTemplate } from '../generated/templates'

import {
	ProposalCreated as ProposalCreatedEvent,
	ProposalQueued as ProposalQueuedEvent,
	ProposalExecuted as ProposalExecutedEvent,
	ProposalCanceled as ProposalCanceledEvent,
	ProposalDeposit as ProposalDepositEvent,
	VoteCast as VoteCastEvent
} from '../generated/governor/Governor'

import {
	constants,
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'

import {
	fetchGovernor,
	fetchProposal,
	fetchProposalCall,
	fetchProposalSupport
} from './fetch/governor'
import { fetchRound } from './XAllocationVoting'

export function handleProposalCreated(event: ProposalCreatedEvent): void {
	ProposalMetadataTemplate.create(event.params.description)
	let governor = fetchGovernor(event.address)

	let proposal = fetchProposal(governor, event.params.proposalId)
	proposal.proposer = fetchAccount(event.params.proposer).id
	proposal.round = fetchRound(event.params.roundIdVoteStart.toString()).id
	proposal.descriptionUri = event.params.description
	proposal.description = event.params.description
	proposal.thresholdAmount = event.params.depositThreshold
	proposal.save()

	let targets = event.params.targets
	let values = event.params.values
	let signatures = event.params.signatures
	let calldatas = event.params.calldatas
	for (let i = 0; i < targets.length; ++i) {
		let call = fetchProposalCall(proposal, i)
		call.target = fetchAccount(targets[i]).id
		call.value = i < values.length ? decimals.toDecimals(values[i]) : constants.BIGDECIMAL_ZERO
		call.signature = i < signatures.length ? signatures[i] : ""
		call.calldata = i < calldatas.length ? calldatas[i] : Bytes.empty()
		call.save()
	}

	let ev = new ProposalCreated(events.id(event))
	ev.emitter = governor.id
	ev.transaction = transactions.log(event).id
	ev.timestamp = event.block.timestamp
	ev.governor = proposal.governor
	ev.proposal = proposal.id
	ev.proposer = proposal.proposer
	ev.save()
}

export function handleProposalQueued(event: ProposalQueuedEvent): void {
	let governor = fetchGovernor(event.address)

	let proposal = fetchProposal(governor, event.params.proposalId)
	proposal.queued = true
	proposal.save()

	let ev = new ProposalQueued(events.id(event))
	ev.emitter = governor.id
	ev.transaction = transactions.log(event).id
	ev.timestamp = event.block.timestamp
	ev.governor = governor.id
	ev.proposal = proposal.id
	ev.eta = event.params.etaSeconds
	ev.save()
}

export function handleProposalExecuted(event: ProposalExecutedEvent): void {
	let governor = fetchGovernor(event.address)

	let proposal = fetchProposal(governor, event.params.proposalId)
	proposal.executed = true
	proposal.save()

	let ev = new ProposalExecuted(events.id(event))
	ev.emitter = governor.id
	ev.transaction = transactions.log(event).id
	ev.timestamp = event.block.timestamp
	ev.governor = governor.id
	ev.proposal = proposal.id
	ev.save()
}

export function handleProposalCanceled(event: ProposalCanceledEvent): void {
	let governor = fetchGovernor(event.address)

	let proposal = fetchProposal(governor, event.params.proposalId)
	proposal.canceled = true
	proposal.save()

	let ev = new ProposalCanceled(events.id(event))
	ev.emitter = governor.id
	ev.transaction = transactions.log(event).id
	ev.timestamp = event.block.timestamp
	ev.governor = governor.id
	ev.proposal = proposal.id
	ev.save()
}

export function handleVoteCast(event: VoteCastEvent): void {
	let governor = fetchGovernor(event.address)
	let proposal = fetchProposal(governor, event.params.proposalId)
	let support = fetchProposalSupport(proposal, event.params.support)
	support.weight = support.weight.plus(event.params.weight)
	support.power = support.power.plus(event.params.power)
	support.voter = support.voter.plus(constants.BIGINT_ONE)
	support.save()

	const receiptId = ((event.block.number.toI64() * 10000000) + (event.transaction.index.toI64() * 10000) + event.transactionLogIndex.toI64())
	const receipt = new VoteReceipt(receiptId.toString())
	receipt.proposal = proposal.id
	receipt.voter = fetchAccount(event.params.voter).id
	receipt.support = support.id
	receipt.weight = event.params.weight
	receipt.power = event.params.power
	receipt.reason = event.params.reason
	receipt.save()
	let ev = new VoteCast(events.id(event))
	ev.emitter = governor.id
	ev.transaction = transactions.log(event).id
	ev.timestamp = event.block.timestamp
	ev.governor = governor.id
	ev.proposal = receipt.proposal
	ev.support = receipt.support
	ev.receipt = receipt.id.toString()
	ev.voter = receipt.voter
	ev.save()

	proposal.voterCount = proposal.voterCount.plus(constants.BIGINT_ONE)
	proposal.votesCast = proposal.votesCast.plus(receipt.weight)
	proposal.weightCast = proposal.weightCast.plus(receipt.power)
	proposal.save()

	const proposalVote = new ProposalVote(receiptId)
	proposalVote.timestamp = event.block.timestamp.toI64()
	proposalVote.proposal = receipt.proposal
	proposalVote.voter = receipt.voter
	proposalVote.support = receipt.support
	proposalVote.weight = receipt.weight
	proposalVote.power = receipt.power
	proposalVote.totalPowerCast = proposal.weightCast
	proposalVote.totalWeightCast = proposal.votesCast
	proposalVote.save()
}

export function handleProposalDeposit(event: ProposalDepositEvent): void {
	let governor = fetchGovernor(event.address)
	let proposal = fetchProposal(governor, event.params.proposalId)

	let deposit = new ProposalDeposit(events.id(event))
	deposit.emitter = governor.id
	deposit.transaction = transactions.log(event).id
	deposit.timestamp = event.block.timestamp
	deposit.depositor = fetchAccount(event.params.depositor).id
	deposit.proposal = proposal.id
	deposit.amount = event.params.amount
	deposit.save()

	proposal.depositCount = proposal.depositCount.plus(constants.BIGINT_ONE)
	proposal.depositAmount = proposal.depositAmount.plus(deposit.amount)
	proposal.save()
}