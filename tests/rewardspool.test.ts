import { assert, beforeEach, clearStore, describe, test } from 'matchstick-as/assembly/index'
import { Address, BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts'

import { Account, ERC721Contract, ERC721Token, Lock2EarnTerm, VeDelegateAccount } from '../generated/schema'
import {
  eventBytesId,
  accountRoundSustainabilityId,
  accountSustainabilityId,
  appRoundSummaryId,
  sustainabilityStatsId,
} from '../src/ids'
import { handleRewardDistribution, handleTeamWithdrawal, handleNewDeposit } from '../src/RewardsPool'
import { handleRoundCreated } from '../src/XAllocationVoting'
import {
  appId,
  createNewDepositEvent,
  createRewardDistributedEvent,
  createRoundCreatedEvent,
  createTeamWithdrawalEvent,
} from './helpers'

describe('RewardsPool', () => {
  beforeEach(() => {
    clearStore()
  })

  test('stores one unified reward feed and keeps reward summaries', () => {
    const proposer = Address.fromString('0x0000000000000000000000000000000000000006')
    const receiver = Address.fromString('0x0000000000000000000000000000000000000007')
    const distributor = Address.fromString('0x0000000000000000000000000000000000000008')
    const depositor = Address.fromString('0x0000000000000000000000000000000000000009')
    const teamWallet = Address.fromString('0x0000000000000000000000000000000000000010')
    const rewardAppId = appId('0x0303030303030303030303030303030303030303030303030303030303030303')

    seedLock2Earn(receiver)

    handleRoundCreated(
      createRoundCreatedEvent(
        BigInt.fromI32(1),
        proposer,
        BigInt.fromI32(100),
        BigInt.fromI32(200),
        [rewardAppId],
      ),
    )

    const depositEvent = createNewDepositEvent(BigInt.fromI32(100), rewardAppId, depositor, 1)
    const withdrawalEvent = createTeamWithdrawalEvent(BigInt.fromI32(40), rewardAppId, distributor, teamWallet, 'ops', 2)
    const distributionEvent = createRewardDistributedEvent(BigInt.fromI32(25), rewardAppId, receiver, 'ipfs://proof-ignored', distributor, 3)

    handleNewDeposit(depositEvent)
    handleTeamWithdrawal(withdrawalEvent)
    handleRewardDistribution(distributionEvent)

    const summaryId = appRoundSummaryId(rewardAppId, '1').toHexString()
    const statsId = sustainabilityStatsId(rewardAppId, '1').toHexString()
    const accountSummaryId = accountSustainabilityId(receiver, rewardAppId).toHexString()
    const roundAccountSummaryId = accountRoundSustainabilityId(receiver, rewardAppId, '1').toHexString()

    assert.entityCount('RewardPoolTransfer', 3)
    assert.fieldEquals('RewardPoolTransfer', eventBytesId(depositEvent).toHexString(), 'kind', 'DEPOSIT')
    assert.fieldEquals('RewardPoolTransfer', eventBytesId(withdrawalEvent).toHexString(), 'kind', 'WITHDRAW')
    assert.fieldEquals('RewardPoolTransfer', eventBytesId(withdrawalEvent).toHexString(), 'reason', 'ops')
    assert.fieldEquals('RewardPoolTransfer', eventBytesId(distributionEvent).toHexString(), 'kind', 'DISTRIBUTION')

    assert.fieldEquals('App', rewardAppId.toHexString(), 'poolBalanceExact', '35')
    assert.fieldEquals('AppRoundSummary', summaryId, 'activeUserCount', '1')
    assert.fieldEquals('AppRoundSummary', summaryId, 'poolBalanceExact', '35')
    assert.fieldEquals('AppRoundSummary', summaryId, 'poolDepositsExact', '100')
    assert.fieldEquals('AppRoundSummary', summaryId, 'poolWithdrawalsExact', '40')
    assert.fieldEquals('AppRoundSummary', summaryId, 'poolDistributionsExact', '25')
    assert.fieldEquals('SustainabilityStats', statsId, 'rewards', '25')
    assert.fieldEquals('SustainabilityStats', statsId, 'newUserCount', '1')
    assert.fieldEquals('SustainabilityStats', statsId, 'actionCount', '1')
    assert.fieldEquals('AccountSustainability', accountSummaryId, 'receivedRewards', '25')
    assert.fieldEquals('AccountRoundSustainability', roundAccountSummaryId, 'receivedRewards', '25')
    assert.fieldEquals('Lock2EarnTerm', 'term-1', 'rewardsExact', '25')
  })
})

function seedLock2Earn(receiver: Address): void {
  const nftContract = Address.fromString('0x00000000000000000000000000000000000000f1')

  const contractAccount = new Account(nftContract)
  contractAccount.save()

  const ownerAccount = new Account(receiver)
  ownerAccount.save()

  const erc721Contract = new ERC721Contract(nftContract)
  erc721Contract.asAccount = nftContract
  erc721Contract.save()

  const token = new ERC721Token('token-1')
  token.contract = erc721Contract.id
  token.identifier = BigInt.fromI32(1)
  token.owner = receiver
  token.approval = receiver
  token.save()

  const veAccount = new VeDelegateAccount(receiver)
  veAccount.account = receiver
  veAccount.token = token.id
  veAccount.lock2EarnTermId = 'term-1'
  veAccount.save()

  const term = new Lock2EarnTerm('term-1')
  term.tokenId = BigInt.fromI32(1)
  term.owner = receiver
  term.startTime = BigInt.zero()
  term.termLength = BigInt.fromI32(1)
  term.termInterval = BigInt.fromI32(1)
  term.endTime = BigInt.fromI32(10)
  term.closed = false
  term.createdAt = BigInt.zero()
  term.updatedAt = BigInt.zero()
  term.amount = BigDecimal.zero()
  term.amountExact = BigInt.zero()
  term.veDelegateAccount = veAccount.id
  term.rewards = BigDecimal.zero()
  term.rewardsExact = BigInt.zero()
  term.save()
}
