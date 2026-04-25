import { createMockedFunction, newTypedMockEvent } from 'matchstick-as/assembly/index'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'

import {
  Approval,
  Transfer,
} from '../generated/erc20/IERC20'
import {
  AllocationVoteCast,
  RoundCreated,
} from '../generated/xallocationvoting/XAllocationVoting'
import {
  ProposalCreated,
  VoteCast,
} from '../generated/governor/Governor'
import {
  NewDeposit,
  RewardDistributed,
  TeamWithdrawal,
} from '../generated/RewardsPool/RewardsPool'
import { RegisteredAction } from '../generated/passport/Passport'
import {
  DelegateChanged,
  DelegateVotesChanged,
} from '../generated/voting/Voting'

const DEFAULT_BLOCK_NUMBER = 1
const DEFAULT_TIMESTAMP = 1
const DEFAULT_TX_INDEX = 0

export const B3TR_ADDRESS = Address.fromString('0x5ef79995FE8a89e0812330E4378eB2660ceDe699')
export const XALLOCATION_VOTING_ADDRESS = Address.fromString('0x89A00Bb0947a30FF95BEeF77a66AEdE3842Fe5B7')
export const GOVERNOR_ADDRESS = Address.fromString('0x00000000000000000000000000000000000000aa')
export const REWARDS_POOL_ADDRESS = Address.fromString('0x6Bee7DDab6c99d5B2Af0554EaEA484CE18F52631')
export const PASSPORT_ADDRESS = Address.fromString('0x00000000000000000000000000000000000000bb')
export const VOTING_ADDRESS = Address.fromString('0x00000000000000000000000000000000000000cc')

export function appId(seed: string): Bytes {
  return Bytes.fromHexString(seed) as Bytes
}

export function mockERC20Metadata(
  address: Address,
  name: string,
  symbol: string,
  decimals: i32,
): void {
  createMockedFunction(address, 'name', 'name():(string)').returns([
    ethereum.Value.fromString(name),
  ])
  createMockedFunction(address, 'symbol', 'symbol():(string)').returns([
    ethereum.Value.fromString(symbol),
  ])
  createMockedFunction(address, 'decimals', 'decimals():(uint8)').returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(decimals)),
  ])
}

export function createRoundCreatedEvent(
  roundId: BigInt,
  proposer: Address,
  voteStart: BigInt,
  voteEnd: BigInt,
  appsIds: Bytes[],
): RoundCreated {
  const event = newTypedMockEvent<RoundCreated>()
  event.parameters = [
    new ethereum.EventParam('roundId', ethereum.Value.fromUnsignedBigInt(roundId)),
    new ethereum.EventParam('proposer', ethereum.Value.fromAddress(proposer)),
    new ethereum.EventParam('voteStart', ethereum.Value.fromUnsignedBigInt(voteStart)),
    new ethereum.EventParam('voteEnd', ethereum.Value.fromUnsignedBigInt(voteEnd)),
    new ethereum.EventParam('appsIds', ethereum.Value.fromBytesArray(appsIds)),
  ]
  setEventMetadata(event, XALLOCATION_VOTING_ADDRESS, DEFAULT_BLOCK_NUMBER, DEFAULT_TIMESTAMP, 0, DEFAULT_TX_INDEX)
  return event
}

export function createAllocationVoteCastEvent(
  voter: Address,
  roundId: BigInt,
  appsIds: Bytes[],
  voteWeights: BigInt[],
): AllocationVoteCast {
  const event = newTypedMockEvent<AllocationVoteCast>()
  event.parameters = [
    new ethereum.EventParam('voter', ethereum.Value.fromAddress(voter)),
    new ethereum.EventParam('roundId', ethereum.Value.fromUnsignedBigInt(roundId)),
    new ethereum.EventParam('appsIds', ethereum.Value.fromBytesArray(appsIds)),
    new ethereum.EventParam('voteWeights', ethereum.Value.fromUnsignedBigIntArray(voteWeights)),
  ]
  setEventMetadata(event, XALLOCATION_VOTING_ADDRESS, 11, 3610, 1, DEFAULT_TX_INDEX)
  return event
}

export function createProposalCreatedEvent(
  proposalId: BigInt,
  proposer: Address,
  targets: Address[],
  values: BigInt[],
  signatures: string[],
  calldatas: Bytes[],
  description: string,
  roundIdVoteStart: BigInt,
  depositThreshold: BigInt,
): ProposalCreated {
  const event = newTypedMockEvent<ProposalCreated>()
  event.parameters = [
    new ethereum.EventParam('proposalId', ethereum.Value.fromUnsignedBigInt(proposalId)),
    new ethereum.EventParam('proposer', ethereum.Value.fromAddress(proposer)),
    new ethereum.EventParam('targets', ethereum.Value.fromAddressArray(targets)),
    new ethereum.EventParam('values', ethereum.Value.fromUnsignedBigIntArray(values)),
    new ethereum.EventParam('signatures', ethereum.Value.fromStringArray(signatures)),
    new ethereum.EventParam('calldatas', ethereum.Value.fromBytesArray(calldatas)),
    new ethereum.EventParam('description', ethereum.Value.fromString(description)),
    new ethereum.EventParam('roundIdVoteStart', ethereum.Value.fromUnsignedBigInt(roundIdVoteStart)),
    new ethereum.EventParam('depositThreshold', ethereum.Value.fromUnsignedBigInt(depositThreshold)),
  ]
  setEventMetadata(event, GOVERNOR_ADDRESS, 20, 7200, 1, DEFAULT_TX_INDEX)
  return event
}

export function createGovernorVoteCastEvent(
  voter: Address,
  proposalId: BigInt,
  support: i32,
  weight: BigInt,
  power: BigInt,
  reason: string,
): VoteCast {
  const event = newTypedMockEvent<VoteCast>()
  event.parameters = [
    new ethereum.EventParam('voter', ethereum.Value.fromAddress(voter)),
    new ethereum.EventParam('proposalId', ethereum.Value.fromUnsignedBigInt(proposalId)),
    new ethereum.EventParam('support', ethereum.Value.fromI32(support)),
    new ethereum.EventParam('weight', ethereum.Value.fromUnsignedBigInt(weight)),
    new ethereum.EventParam('power', ethereum.Value.fromUnsignedBigInt(power)),
    new ethereum.EventParam('reason', ethereum.Value.fromString(reason)),
  ]
  setEventMetadata(event, GOVERNOR_ADDRESS, 21, 7260, 2, 1)
  return event
}

export function createRewardDistributedEvent(
  amount: BigInt,
  rewardAppId: Bytes,
  receiver: Address,
  proof: string,
  distributor: Address,
  logIndex: i32 = 3,
): RewardDistributed {
  const event = newTypedMockEvent<RewardDistributed>()
  event.parameters = [
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)),
    new ethereum.EventParam('appId', ethereum.Value.fromBytes(rewardAppId)),
    new ethereum.EventParam('receiver', ethereum.Value.fromAddress(receiver)),
    new ethereum.EventParam('proof', ethereum.Value.fromString(proof)),
    new ethereum.EventParam('distributor', ethereum.Value.fromAddress(distributor)),
  ]
  setEventMetadata(event, REWARDS_POOL_ADDRESS, 19145969, 86400 + logIndex, logIndex, 0)
  return event
}

export function createNewDepositEvent(
  amount: BigInt,
  rewardAppId: Bytes,
  depositor: Address,
  logIndex: i32 = 1,
): NewDeposit {
  const event = newTypedMockEvent<NewDeposit>()
  event.parameters = [
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)),
    new ethereum.EventParam('appId', ethereum.Value.fromBytes(rewardAppId)),
    new ethereum.EventParam('depositor', ethereum.Value.fromAddress(depositor)),
  ]
  setEventMetadata(event, REWARDS_POOL_ADDRESS, 19145969, 86400 + logIndex, logIndex, 0)
  return event
}

export function createTeamWithdrawalEvent(
  amount: BigInt,
  rewardAppId: Bytes,
  withdrawer: Address,
  teamWallet: Address,
  reason: string,
  logIndex: i32 = 2,
): TeamWithdrawal {
  const event = newTypedMockEvent<TeamWithdrawal>()
  event.parameters = [
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)),
    new ethereum.EventParam('appId', ethereum.Value.fromBytes(rewardAppId)),
    new ethereum.EventParam('withdrawer', ethereum.Value.fromAddress(withdrawer)),
    new ethereum.EventParam('teamWallet', ethereum.Value.fromAddress(teamWallet)),
    new ethereum.EventParam('reason', ethereum.Value.fromString(reason)),
  ]
  setEventMetadata(event, REWARDS_POOL_ADDRESS, 19145969, 86400 + logIndex, logIndex, 0)
  return event
}

export function createRegisteredActionEvent(
  user: Address,
  passport: Address,
  passportAppId: Bytes,
  round: BigInt,
  actionScore: BigInt,
): RegisteredAction {
  const event = newTypedMockEvent<RegisteredAction>()
  event.parameters = [
    new ethereum.EventParam('user', ethereum.Value.fromAddress(user)),
    new ethereum.EventParam('passport', ethereum.Value.fromAddress(passport)),
    new ethereum.EventParam('appId', ethereum.Value.fromBytes(passportAppId)),
    new ethereum.EventParam('round', ethereum.Value.fromUnsignedBigInt(round)),
    new ethereum.EventParam('actionScore', ethereum.Value.fromUnsignedBigInt(actionScore)),
  ]
  setEventMetadata(event, PASSPORT_ADDRESS, 30, 9000, 4, DEFAULT_TX_INDEX)
  return event
}

export function createERC20TransferEvent(
  from: Address,
  to: Address,
  value: BigInt,
  logIndex: i32,
  address: Address = B3TR_ADDRESS,
): Transfer {
  const event = newTypedMockEvent<Transfer>()
  event.parameters = [
    new ethereum.EventParam('from', ethereum.Value.fromAddress(from)),
    new ethereum.EventParam('to', ethereum.Value.fromAddress(to)),
    new ethereum.EventParam('value', ethereum.Value.fromUnsignedBigInt(value)),
  ]
  setEventMetadata(event, address, 40 + logIndex, 12000 + logIndex, logIndex, 0)
  return event
}

export function createERC20ApprovalEvent(
  owner: Address,
  spender: Address,
  value: BigInt,
  logIndex: i32,
  address: Address = B3TR_ADDRESS,
): Approval {
  const event = newTypedMockEvent<Approval>()
  event.parameters = [
    new ethereum.EventParam('owner', ethereum.Value.fromAddress(owner)),
    new ethereum.EventParam('spender', ethereum.Value.fromAddress(spender)),
    new ethereum.EventParam('value', ethereum.Value.fromUnsignedBigInt(value)),
  ]
  setEventMetadata(event, address, 50 + logIndex, 13000 + logIndex, logIndex, 0)
  return event
}

export function createDelegateChangedEvent(
  delegator: Address,
  fromDelegate: Address,
  toDelegate: Address,
  logIndex: i32 = 1,
): DelegateChanged {
  const event = newTypedMockEvent<DelegateChanged>()
  event.parameters = [
    new ethereum.EventParam('delegator', ethereum.Value.fromAddress(delegator)),
    new ethereum.EventParam('fromDelegate', ethereum.Value.fromAddress(fromDelegate)),
    new ethereum.EventParam('toDelegate', ethereum.Value.fromAddress(toDelegate)),
  ]
  setEventMetadata(event, VOTING_ADDRESS, 60 + logIndex, 14000 + logIndex, logIndex, 0)
  return event
}

export function createDelegateVotesChangedEvent(
  delegate: Address,
  previousBalance: BigInt,
  newBalance: BigInt,
  logIndex: i32 = 2,
): DelegateVotesChanged {
  const event = newTypedMockEvent<DelegateVotesChanged>()
  event.parameters = [
    new ethereum.EventParam('delegate', ethereum.Value.fromAddress(delegate)),
    new ethereum.EventParam('previousBalance', ethereum.Value.fromUnsignedBigInt(previousBalance)),
    new ethereum.EventParam('newBalance', ethereum.Value.fromUnsignedBigInt(newBalance)),
  ]
  setEventMetadata(event, VOTING_ADDRESS, 60 + logIndex, 14000 + logIndex, logIndex, 0)
  return event
}

function setEventMetadata(
  event: ethereum.Event,
  address: Address,
  blockNumber: i32,
  timestamp: i32,
  logIndex: i32,
  txIndex: i32,
): void {
  event.address = address
  event.block.number = BigInt.fromI32(blockNumber)
  event.block.timestamp = BigInt.fromI32(timestamp)
  event.logIndex = BigInt.fromI32(logIndex)
  event.transactionLogIndex = BigInt.fromI32(logIndex)
  event.transaction.index = BigInt.fromI32(txIndex)
}
