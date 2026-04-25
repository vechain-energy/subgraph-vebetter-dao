import { assert, beforeEach, clearStore, describe, test } from 'matchstick-as/assembly/index'
import { Address, BigInt } from '@graphprotocol/graph-ts'

import { handleRoundCreated, handleVoteCast } from '../src/XAllocationVoting'
import { appId, createAllocationVoteCastEvent, createRoundCreatedEvent } from './helpers'

describe('XAllocationVoting', () => {
  beforeEach(() => {
    clearStore()
  })

  test('aggregates allocation votes into round, account, and timeseries buckets without raw vote entities', () => {
    const voter = Address.fromString('0x0000000000000000000000000000000000000001')
    const proposer = Address.fromString('0x0000000000000000000000000000000000000002')
    const primaryApp = appId('0x0101010101010101010101010101010101010101010101010101010101010101')
    const secondaryApp = appId('0x0202020202020202020202020202020202020202020202020202020202020202')

    handleRoundCreated(
      createRoundCreatedEvent(
        BigInt.fromI32(1),
        proposer,
        BigInt.fromI32(100),
        BigInt.fromI32(200),
        [primaryApp, secondaryApp],
      ),
    )

    handleVoteCast(
      createAllocationVoteCastEvent(
        voter,
        BigInt.fromI32(1),
        [primaryApp, secondaryApp],
        [
          BigInt.fromString('4000000000000000000'),
          BigInt.fromString('1000000000000000000'),
        ],
      ),
    )

    const roundId = '1'
    const primaryAllocationId = roundId + '/' + primaryApp.toHexString()
    const hourBucketId = 'HOUR/' + roundId + '/' + primaryApp.toHexString() + '/3600'
    const dayBucketId = 'DAY/' + roundId + '/' + primaryApp.toHexString() + '/0'
    const legacyAllocationVoteId = '110000100'

    assert.fieldEquals('RoundStatistic', roundId, 'voters', '1')
    assert.fieldEquals('RoundStatistic', roundId, 'votesCastExact', '5000000000000000000')
    assert.fieldEquals('RoundStatistic', roundId, 'weightExact', '5000000000000000000')

    assert.fieldEquals('AllocationResult', primaryAllocationId, 'voters', '1')
    assert.fieldEquals('AllocationResult', primaryAllocationId, 'votesCastExact', '4000000000000000000')
    assert.fieldEquals('AllocationResult', primaryAllocationId, 'weightExact', '2000000000')

    assert.entityCount('StatsAllocationVote', 4)
    assert.fieldEquals('StatsAllocationVote', hourBucketId, 'interval', 'HOUR')
    assert.fieldEquals('StatsAllocationVote', hourBucketId, 'votes', '1')
    assert.fieldEquals('StatsAllocationVote', hourBucketId, 'weightExact', '4000000000000000000')
    assert.fieldEquals('StatsAllocationVote', hourBucketId, 'qfWeightExact', '2000000000')
    assert.fieldEquals('StatsAllocationVote', dayBucketId, 'interval', 'DAY')
    assert.fieldEquals('StatsAllocationVote', dayBucketId, 'votes', '1')

    assert.fieldEquals('Account', voter.toHexString(), 'allocationVoteCount', '2')
    assert.fieldEquals('Account', voter.toHexString(), 'allocationVotesCastExact', '5000000000000000000')
    assert.fieldEquals('Account', voter.toHexString(), 'allocationQfWeightExact', '3000000000')
    assert.fieldEquals('Account', voter.toHexString(), 'lastActivityTimestamp', '3610')

    assert.notInStore('AllocationVote', legacyAllocationVoteId)
  })
})
