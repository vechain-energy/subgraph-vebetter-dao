import { assert, beforeEach, clearStore, describe, test } from 'matchstick-as/assembly/index'
import { Address, BigInt } from '@graphprotocol/graph-ts'

import { handleDelegateChanged, handleDelegateVotesChanged } from '../src/Voting'
import { VOTING_ADDRESS, createDelegateChangedEvent, createDelegateVotesChangedEvent } from './helpers'

describe('Voting', () => {
  beforeEach(() => {
    clearStore()
  })

  test('keeps delegation and vote weight state without raw delegate vote events', () => {
    const delegator = Address.fromString('0x0000000000000000000000000000000000000021')
    const oldDelegate = Address.fromString('0x0000000000000000000000000000000000000022')
    const newDelegate = Address.fromString('0x0000000000000000000000000000000000000023')

    handleDelegateChanged(createDelegateChangedEvent(delegator, oldDelegate, newDelegate, 1))
    handleDelegateVotesChanged(createDelegateVotesChangedEvent(newDelegate, BigInt.zero(), BigInt.fromI32(12), 2))

    const delegationId = VOTING_ADDRESS.toHexString() + '/' + delegator.toHexString()
    const totalWeightId = VOTING_ADDRESS.toHexString() + '/total'
    const delegateWeightId = VOTING_ADDRESS.toHexString() + '/' + newDelegate.toHexString()

    assert.fieldEquals('VoteDelegation', delegationId, 'delegatee', newDelegate.toHexString())
    assert.fieldEquals('VoteWeight', totalWeightId, 'value', '12')
    assert.fieldEquals('VoteWeight', delegateWeightId, 'value', '12')
  })
})
