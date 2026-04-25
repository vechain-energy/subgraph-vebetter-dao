import { assert, beforeEach, clearStore, describe, test } from 'matchstick-as/assembly/index'
import { Address, BigInt } from '@graphprotocol/graph-ts'

import { handleRegisteredAction } from '../src/Passport'
import { accountRoundSustainabilityId, appRoundSummaryId } from '../src/ids'
import { handleRoundCreated } from '../src/XAllocationVoting'
import {
  appId,
  createRegisteredActionEvent,
  createRoundCreatedEvent,
} from './helpers'

describe('Passport', () => {
  beforeEach(() => {
    clearStore()
  })

  test('keeps passport score aggregates after removing proof-heavy storage', () => {
    const proposer = Address.fromString('0x0000000000000000000000000000000000000009')
    const user = Address.fromString('0x0000000000000000000000000000000000000010')
    const passport = Address.fromString('0x0000000000000000000000000000000000000011')
    const scoredAppId = appId('0x0404040404040404040404040404040404040404040404040404040404040404')

    handleRoundCreated(
      createRoundCreatedEvent(
        BigInt.fromI32(1),
        proposer,
        BigInt.fromI32(100),
        BigInt.fromI32(200),
        [scoredAppId],
      ),
    )

    handleRegisteredAction(
      createRegisteredActionEvent(
        user,
        passport,
        scoredAppId,
        BigInt.fromI32(1),
        BigInt.fromI32(7),
      ),
    )

    const summaryId = appRoundSummaryId(scoredAppId, '1').toHexString()
    const roundParticipantId = accountRoundSustainabilityId(passport, scoredAppId, '1').toHexString()

    assert.fieldEquals('AppRoundSummary', summaryId, 'passportScore', '7')
    assert.fieldEquals('AccountRoundSustainability', roundParticipantId, 'passportScore', '7')
    assert.fieldEquals('RoundStatistic', '1', 'totalActionScores', '7')
    assert.fieldEquals('Account', passport.toHexString(), 'passportActionCount', '1')
    assert.fieldEquals('Account', passport.toHexString(), 'passportScoreTotal', '7')
    assert.fieldEquals('Account', passport.toHexString(), 'lastActivityTimestamp', '9000')
  })
})
