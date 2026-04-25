import { assert, beforeEach, clearStore, createMockedFunction, describe, test } from 'matchstick-as/assembly/index'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'

import { handleProposalCreated, handleVoteCast } from '../src/Governor'
import {
  GOVERNOR_ADDRESS,
  createGovernorVoteCastEvent,
  createProposalCreatedEvent,
} from './helpers'

describe('Governor', () => {
  beforeEach(() => {
    clearStore()

    createMockedFunction(
      GOVERNOR_ADDRESS,
      'COUNTING_MODE',
      'COUNTING_MODE():(string)',
    ).returns([ethereum.Value.fromString('support=bravo&quorum=for,abstain')])
  })

  test('stores proposal aggregates without receipt or per-vote entities', () => {
    const proposer = Address.fromString('0x0000000000000000000000000000000000000003')
    const voter = Address.fromString('0x0000000000000000000000000000000000000004')
    const proposalId = BigInt.fromI32(7)

    handleProposalCreated(
      createProposalCreatedEvent(
        proposalId,
        proposer,
        [Address.fromString('0x0000000000000000000000000000000000000005')],
        [BigInt.zero()],
        ['execute()'],
        [Bytes.fromHexString('0x1234') as Bytes],
        'ipfs://proposal-7',
        BigInt.fromI32(1),
        BigInt.fromI32(1000),
      ),
    )

    handleVoteCast(
      createGovernorVoteCastEvent(
        voter,
        proposalId,
        1,
        BigInt.fromI32(11),
        BigInt.fromI32(17),
        'support',
      ),
    )

    const storedProposalId = GOVERNOR_ADDRESS.toHex() + '/' + proposalId.toHex()
    const supportId = storedProposalId + '/1'
    const legacyVoteId = '210000002'

    assert.fieldEquals('Proposal', storedProposalId, 'voterCount', '1')
    assert.fieldEquals('Proposal', storedProposalId, 'votesCast', '11')
    assert.fieldEquals('Proposal', storedProposalId, 'weightCast', '17')

    assert.fieldEquals('ProposalSupport', supportId, 'voter', '1')
    assert.fieldEquals('ProposalSupport', supportId, 'weight', '11')
    assert.fieldEquals('ProposalSupport', supportId, 'power', '17')

    assert.fieldEquals('Account', voter.toHexString(), 'proposalVoteCount', '1')
    assert.fieldEquals('Account', voter.toHexString(), 'proposalVotesCast', '11')
    assert.fieldEquals('Account', voter.toHexString(), 'proposalWeightCast', '17')
    assert.fieldEquals('Account', voter.toHexString(), 'lastActivityTimestamp', '7260')

    assert.notInStore('VoteReceipt', legacyVoteId)
    assert.notInStore('ProposalVote', legacyVoteId)
    assert.notInStore('VoteCast', '21-2')
  })
})
