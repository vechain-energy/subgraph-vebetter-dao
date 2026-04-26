import { BigDecimal, BigInt, Bytes, Entity, Value, ValueKind } from '@graphprotocol/graph-ts'
import {
  AppBlacklistChanged as SourceAppBlacklistChanged,
  AppEndorsementChanged as SourceAppEndorsementChanged,
  AppEndorsementStatusChanged as SourceAppEndorsementStatusChanged,
  AppMetadataChanged as SourceAppMetadataChanged,
  AppMetadataDocument as SourceAppMetadataDocument,
  AppRegistered as SourceAppRegistered,
  AppVotingEligibilityChanged as SourceAppVotingEligibilityChanged,
  RoundCreatedEvent as SourceRoundCreatedEvent,
} from '../generated/__APPS_SOURCE_MODULE__'
import {
  AllocationVoteCastEvent as SourceAllocationVoteCastEvent,
  AppAllocationFunded as SourceAppAllocationFunded,
  AppRewardTransfer as SourceAppRewardTransfer,
  RoundGMVoteRegistered as SourceRoundGMVoteRegistered,
  RoundRewardClaimed as SourceRoundRewardClaimed,
  RoundRewardVoteRegistered as SourceRoundRewardVoteRegistered,
  SustainabilityProofDocument as SourceSustainabilityProofDocument,
} from '../generated/__REWARDS_SOURCE_MODULE__'
import {
  TokenApproval as SourceTokenApproval,
  TokenTransfer as SourceTokenTransfer,
} from '../generated/__TOKENS_SOURCE_MODULE__'
import {
  ProposalCanceledEvent as SourceProposalCanceledEvent,
  ProposalCreatedEvent as SourceProposalCreatedEvent,
  ProposalDepositEvent as SourceProposalDepositEvent,
  ProposalExecutedEvent as SourceProposalExecutedEvent,
  ProposalMetadataDocument as SourceProposalMetadataDocument,
  ProposalQueuedEvent as SourceProposalQueuedEvent,
  ProposalVoteCastEvent as SourceProposalVoteCastEvent,
  VoteDelegationChangedEvent as SourceVoteDelegationChangedEvent,
  VoteWeightChangedEvent as SourceVoteWeightChangedEvent,
} from '../generated/__GOVERNANCE_SOURCE_MODULE__'
import {
  Lock2EarnTermEvent as SourceLock2EarnTermEvent,
  NftApprovalEvent as SourceNftApprovalEvent,
  NftApprovalForAllEvent as SourceNftApprovalForAllEvent,
  NftTransferEvent as SourceNftTransferEvent,
  NodeDelegatedEvent as SourceNodeDelegatedEvent,
  PassportDelegationEvent as SourcePassportDelegationEvent,
  PassportEntityLinkEvent as SourcePassportEntityLinkEvent,
  PassportListEvent as SourcePassportListEvent,
  PassportRegisteredAction as SourcePassportRegisteredAction,
  ThorNodeLevelChangedEvent as SourceThorNodeLevelChangedEvent,
  UserSignalEvent as SourceUserSignalEvent,
  UserSignalsResetEvent as SourceUserSignalsResetEvent,
  UserSignalsResetForAppEvent as SourceUserSignalsResetForAppEvent,
  VeDelegateConfigChangedEvent as SourceVeDelegateConfigChangedEvent,
  VetDomainAddressChangedEvent as SourceVetDomainAddressChangedEvent,
  VetDomainNameChangedEvent as SourceVetDomainNameChangedEvent,
} from '../generated/__IDENTITY_SOURCE_MODULE__'
import {
  Account,
  AccountRoundSustainability,
  AccountSustainability,
  AllocationResult,
  AllocationVote,
  AllocationVoteCastEvent,
  App,
  AppAllocationFunded,
  AppBlacklistChanged,
  AppEndorsement,
  AppEndorsementChanged,
  AppEndorsementStatusChanged,
  AppMetadata,
  AppMetadataChanged,
  AppMetadataDocument,
  AppMetricEvent,
  AppRegistered,
  AppRewardTransfer,
  AppRoundSummary,
  AppRoundWithdrawalReason,
  AppVotingEligibilityChanged,
  CurrentRound,
  ERC20Approval,
  ERC20Balance,
  ERC721Operator,
  ERC721Token,
  GMVoteCycleToken,
  GMVoteLevel,
  Lock2EarnStats,
  Lock2EarnTerm,
  Lock2EarnTermEvent,
  NftApprovalEvent,
  NftApprovalForAllEvent,
  NftTransferEvent,
  NodeDelegatedEvent,
  NodeDelegation,
  PassportBlacklist,
  PassportDelegation,
  PassportDelegationEvent,
  PassportEntityLink,
  PassportEntityLinkEvent,
  PassportListEvent,
  PassportRegisteredAction,
  PassportScore,
  PassportWhitelist,
  Proposal,
  ProposalCall,
  ProposalCanceledEvent,
  ProposalCreatedEvent,
  ProposalDeposit,
  ProposalDepositEvent,
  ProposalExecutedEvent,
  ProposalMetadata,
  ProposalMetadataDocument,
  ProposalQueuedEvent,
  ProposalSupport,
  ProposalVote,
  ProposalVoteCastEvent,
  Round,
  RoundCreatedEvent,
  RoundGMVoteRegistered,
  RoundRewardClaimed,
  RoundRewardVoteRegistered,
  RoundStatistic,
  StatsAllocationVote,
  StatsEndorsement,
  SustainabilityProofDocument,
  SustainabilityStats,
  ThorNode,
  ThorNodeLevelChangedEvent,
  TokenApproval,
  TokenTransfer,
  UserSignal,
  UserSignalEvent,
  UserSignalsReset,
  UserSignalsResetEvent,
  UserSignalsResetForApp,
  UserSignalsResetForAppEvent,
  VBDBalance,
  VeDelegateAccount,
  VeDelegateConfig,
  VeDelegateConfigChangedEvent,
  VetDomainAddressChangedEvent,
  VetDomainNameChangedEvent,
  VetDomainsNames,
  VoteDelegationChangedEvent,
  VoteReceipt,
  VoteWeightChangedEvent,
} from '../generated/schema'

const ZERO = BigInt.fromI32(0)
const ONE = BigInt.fromI32(1)
const BD_ZERO = BigDecimal.zero()
const ZERO_ACCOUNT = Bytes.fromHexString('0x0000000000000000000000000000000000000000')
const X_ALLOCATION_POOL = Bytes.fromHexString('0x4191776f05f4be4848d3f4d587345078b439c7d3')
const DYNAMIC_BASE_ALLOCATIONS = Bytes.fromHexString('0x98c1d097c39969bb5de754266f60d22bd105b368')
const B3TR = Bytes.fromHexString('0x5ef79995fe8a89e0812330e4378eb2660cede699')
const VOT3 = Bytes.fromHexString('0x76ca782b59c74d088c7d2cce2f211bc00836c602')
const VEB3TR = Bytes.fromHexString('0x420dfe6b7bc605ce61e9839c8c0e745870a6cde0')
const THOR_NODE_COLLECTION = Bytes.fromHexString('0xb81e9c5f9644dec9e5e3cac86b4461a222072302')
const STARGATE_COLLECTION = Bytes.fromHexString('0x1856c533ac2d94340aaa8544d35a5c1d4a21dee7')

export function handleAppRegistered(source: SourceAppRegistered): void {
  const event = new AppRegistered(source.id)
  event.app = source.app
  event.owner = source.owner
  event.name = source.name
  event.votingEligibility = source.votingEligibility
  event.createdAt = source.createdAt
  copyEventFields(event, source)
  event.save()

  const app = fetchApp(source.app)
  app.owner = fetchAccount(source.owner).id
  app.name = source.name
  app.votingEligibility = source.votingEligibility
  app.isBlacklisted = false
  app.createdAt = source.createdAt
  app.createdAtBlockNumber = source.blockNumber
  app.updatedAtBlockNumber = source.blockNumber
  app.save()
}

export function handleAppMetadataChanged(source: SourceAppMetadataChanged): void {
  const event = new AppMetadataChanged(source.id)
  event.app = source.app
  event.oldMetadataURI = source.oldMetadataURI
  event.metadataURI = source.metadataURI
  copyEventFields(event, source)
  event.save()

  const app = fetchApp(source.app)
  app.metadataURI = source.metadataURI
  app.metadata = source.metadataURI
  app.updatedAtBlockNumber = source.blockNumber
  app.save()
}

export function handleAppMetadataDocument(source: SourceAppMetadataDocument): void {
  const event = new AppMetadataDocument(source.id)
  event.title = source.title
  event.description = source.description
  event.externalUrl = source.externalUrl
  event.logoUrl = source.logoUrl
  event.bannerUrl = source.bannerUrl
  event.rawJson = source.rawJson
  event.save()

  const metadata = new AppMetadata(source.id)
  metadata.title = source.title
  metadata.description = source.description
  metadata.externalUrl = source.externalUrl
  metadata.logoUrl = source.logoUrl
  metadata.bannerUrl = source.bannerUrl
  metadata.rawJson = source.rawJson
  metadata.save()
}

export function handleAppVotingEligibilityChanged(source: SourceAppVotingEligibilityChanged): void {
  const event = new AppVotingEligibilityChanged(source.id)
  event.app = source.app
  event.votingEligibility = source.votingEligibility
  copyEventFields(event, source)
  event.save()

  const app = fetchApp(source.app)
  app.votingEligibility = source.votingEligibility
  app.updatedAtBlockNumber = source.blockNumber
  app.save()
}

export function handleAppBlacklistChanged(source: SourceAppBlacklistChanged): void {
  const event = new AppBlacklistChanged(source.id)
  event.app = source.app
  event.isBlacklisted = source.isBlacklisted
  copyEventFields(event, source)
  event.save()

  const app = fetchApp(source.app)
  app.isBlacklisted = source.isBlacklisted
  app.updatedAtBlockNumber = source.blockNumber
  app.save()
}

export function handleAppEndorsementChanged(source: SourceAppEndorsementChanged): void {
  const event = new AppEndorsementChanged(source.id)
  event.app = source.app
  event.nodeId = source.nodeId
  event.endorsed = source.endorsed
  copyEventFields(event, source)
  event.save()

  const app = fetchApp(source.app)
  const node = fetchNode(source.nodeId)
  const endorsementId = ['endorsement', source.nodeId.toString(), source.app.toHexString()].join('/')
  let endorsement = AppEndorsement.load(endorsementId)
  if (endorsement == null) {
    endorsement = new AppEndorsement(endorsementId)
    endorsement.node = node.id
    endorsement.app = app.id
  }
  const wasActive = endorsement.active
  endorsement.active = source.endorsed
  endorsement.timestamp = source.timestamp
  endorsement.save()

  if (wasActive != source.endorsed) {
    updateEndorsementStats(node, source.endorsed ? 1 : -1)
  }
}

export function handleAppEndorsementStatusChanged(source: SourceAppEndorsementStatusChanged): void {
  const event = new AppEndorsementStatusChanged(source.id)
  event.app = source.app
  event.endorsed = source.endorsed
  copyEventFields(event, source)
  event.save()

  const app = fetchApp(source.app)
  app.endorsed = source.endorsed
  app.updatedAtBlockNumber = source.blockNumber
  app.save()
}

export function handleRoundCreated(source: SourceRoundCreatedEvent): void {
  const event = new RoundCreatedEvent(source.id)
  event.round = source.round
  event.roundId = source.roundId
  event.creator = source.creator
  event.voteStart = source.voteStart
  event.voteEnd = source.voteEnd
  event.apps = source.apps
  copyEventFields(event, source)
  event.save()

  const round = fetchRound(source.round)
  round.number = source.roundId
  round.voteStart = source.voteStart
  round.voteEnd = source.voteEnd
  round.apps = csvToBytes(source.apps)

  const allocationIds = new Array<string>()
  const veDelegateAllocationIds = new Array<string>()
  const apps = round.apps
  for (let i = 0; i < apps.length; i++) {
    fetchApp(apps[i])
    allocationIds.push(fetchAllocation(source.round, apps[i], '').id)
    veDelegateAllocationIds.push(fetchAllocation(source.round, apps[i], 'vedelegate').id)
  }
  round.allocations = allocationIds
  round.veDelegateAllocations = veDelegateAllocationIds
  round.save()

  const current = new CurrentRound('singleton')
  current.roundId = source.roundId
  current.save()
}

export function handleAllocationVoteCast(source: SourceAllocationVoteCastEvent): void {
  const event = new AllocationVoteCastEvent(source.id)
  event.voter = source.voter
  event.round = source.round
  event.roundId = source.roundId
  event.apps = source.apps
  event.voteWeights = source.voteWeights
  copyEventFields(event, source)
  event.save()

  const appIds = csvToBytes(source.apps)
  const weights = csvToBigInts(source.voteWeights)
  const roundId = source.round
  const veAccount = VeDelegateAccount.load(source.voter)
  const stats = fetchStatistic(roundId, '')
  const veStats = fetchStatistic(roundId, 'vedelegate')
  stats.voters = stats.voters.plus(ONE)
  if (veAccount != null) {
    veStats.voters = veStats.voters.plus(ONE)
  }

  let totalQfAdjustment = ZERO
  let totalVeQfAdjustment = ZERO
  for (let i = 0; i < appIds.length; i++) {
    if (i >= weights.length) break
    const appId = appIds[i]
    const votesCast = weights[i]
    const qfWeight = votesCast.gt(BigInt.fromString('1000000000000000000')) ? votesCast.sqrt() : votesCast.div(BigInt.fromString('1000000000'))
    const allocation = fetchAllocation(roundId, appId, '')
    const preVote = allocation.weightExact
    const postVote = preVote.plus(qfWeight)
    totalQfAdjustment = totalQfAdjustment.plus(postVote.times(postVote).minus(preVote.times(preVote)))
    allocation.weightExact = postVote
    allocation.weight = toDecimal(allocation.weightExact, 9)
    allocation.votesCastExact = allocation.votesCastExact.plus(votesCast)
    allocation.votesCast = toDecimal(allocation.votesCastExact, 18)
    allocation.voters = allocation.voters.plus(ONE)
    allocation.save()

    const vote = new AllocationVote(source.id.concatI32(i))
    vote.voter = fetchAccount(source.voter).id
    vote.passport = vote.voter
    vote.round = roundId
    vote.app = appId
    vote.weightExact = votesCast
    vote.weight = toDecimal(votesCast, 18)
    vote.qfWeightExact = qfWeight
    vote.qfWeight = toDecimal(qfWeight, 9)
    vote.timestamp = source.timestamp
    vote.txHash = source.txHash
    vote.save()

    const statVote = fetchStatsAllocationVote(roundId, appId)
    statVote.votes = statVote.votes.plus(ONE)
    statVote.weightExact = statVote.weightExact.plus(votesCast)
    statVote.weight = toDecimal(statVote.weightExact, 18)
    statVote.qfWeightExact = statVote.qfWeightExact.plus(qfWeight)
    statVote.qfWeight = toDecimal(statVote.qfWeightExact, 9)
    statVote.updatedAtBlockNumber = source.blockNumber
    statVote.save()

    stats.votesCastExact = stats.votesCastExact.plus(votesCast)
    stats.votesCast = toDecimal(stats.votesCastExact, 18)

    if (veAccount != null) {
      const veAllocation = fetchAllocation(roundId, appId, 'vedelegate')
      veAllocation.voters = veAllocation.voters.plus(ONE)
      veAllocation.weightExact = veAllocation.weightExact.plus(qfWeight)
      veAllocation.weight = toDecimal(veAllocation.weightExact, 9)
      veAllocation.votesCastExact = veAllocation.votesCastExact.plus(votesCast)
      veAllocation.votesCast = toDecimal(veAllocation.votesCastExact, 18)
      veAllocation.save()
      veStats.votesCastExact = veStats.votesCastExact.plus(votesCast)
      veStats.votesCast = toDecimal(veStats.votesCastExact, 18)
      totalVeQfAdjustment = totalVeQfAdjustment.plus(postVote.times(postVote).minus(preVote.times(preVote)))
    }
  }

  stats.weightExact = stats.weightExact.plus(totalQfAdjustment)
  stats.weight = toDecimal(stats.weightExact, 18)
  stats.save()
  if (veAccount != null) {
    veStats.weightExact = veStats.weightExact.plus(totalVeQfAdjustment)
    veStats.weight = toDecimal(veStats.weightExact, 18)
  }
  veStats.save()
}

export function handleAppRewardTransfer(source: SourceAppRewardTransfer): void {
  const round = source.round.length == 0 ? currentRoundId() : source.round
  const hasFrom = hasFieldValue(source, 'from')
  const hasTo = hasFieldValue(source, 'to')
  const hasReason = hasFieldValue(source, 'reason')
  const from = hasFrom ? readBytes(source, 'from') : ZERO_ACCOUNT
  const to = hasTo ? readBytes(source, 'to') : ZERO_ACCOUNT
  const reason = hasReason ? readString(source, 'reason') : ''
  const event = new AppRewardTransfer(source.id)
  event.app = source.app
  event.round = round
  event.amountExact = source.amountExact
  event.kind = source.kind
  event.from = hasFrom ? from : null
  event.to = hasTo ? to : null
  event.reason = hasReason ? reason : null
  event.proof = source.proof
  copyEventFields(event, source)
  event.save()

  const app = fetchApp(source.app)
  const appRoundSummary = fetchAppRoundSummary(app, fetchRound(round))
  if (source.kind == 'DEPOSIT') {
    app.poolBalanceExact = app.poolBalanceExact.plus(source.amountExact)
    let isInternalDeposit = false
    if (hasFrom) {
      if (from.equals(X_ALLOCATION_POOL)) {
        isInternalDeposit = true
      }
      if (from.equals(DYNAMIC_BASE_ALLOCATIONS)) {
        isInternalDeposit = true
      }
    }
    if (!isInternalDeposit) {
      app.poolDepositsExact = app.poolDepositsExact.plus(source.amountExact)
      appRoundSummary.poolDepositsExact = appRoundSummary.poolDepositsExact.plus(source.amountExact)
    }
    saveMetric(source.blockNumber, source.logIndex, source.timestamp, source.app, round, source.amountExact, ZERO, ZERO, ZERO)
  } else if (source.kind == 'WITHDRAW') {
    app.poolBalanceExact = app.poolBalanceExact.minus(source.amountExact)
    app.poolWithdrawalsExact = app.poolWithdrawalsExact.plus(source.amountExact)
    appRoundSummary.poolWithdrawalsExact = appRoundSummary.poolWithdrawalsExact.plus(source.amountExact)
    if (hasReason) {
      const reasonRow = fetchWithdrawalReason(appRoundSummary, reason)
      reasonRow.amountExact = reasonRow.amountExact.plus(source.amountExact)
      reasonRow.amount = toDecimal(reasonRow.amountExact, 18)
      reasonRow.save()
    }
    saveMetric(source.blockNumber, source.logIndex, source.timestamp, source.app, round, ZERO, source.amountExact, ZERO, ZERO)
  } else {
    app.poolBalanceExact = app.poolBalanceExact.minus(source.amountExact)
    app.poolDistributionsExact = app.poolDistributionsExact.plus(source.amountExact)
    appRoundSummary.poolDistributionsExact = appRoundSummary.poolDistributionsExact.plus(source.amountExact)
    if (hasTo) {
      incrementLockRewardsByAccount(to, source.amountExact)
    }
    saveMetric(source.blockNumber, source.logIndex, source.timestamp, source.app, round, ZERO, ZERO, source.amountExact, ZERO)
  }
  updateAppDecimals(app)
  updateSummaryDecimals(appRoundSummary, app)
  app.save()
  appRoundSummary.save()
}

export function handleSustainabilityProofDocument(source: SourceSustainabilityProofDocument): void {
  const event = new SustainabilityProofDocument(source.id)
  event.transfer = source.transfer
  event.app = source.app
  event.round = source.round
  event.account = source.account
  event.rewardExact = source.rewardExact
  event.proofType = source.proofType
  event.proofData = source.proofData
  event.description = source.description
  event.additionalInfo = source.additionalInfo
  event.carbon = source.carbon
  event.water = source.water
  event.energy = source.energy
  event.wasteMass = source.wasteMass
  event.plastic = source.plastic
  event.timber = source.timber
  event.educationTime = source.educationTime
  event.treesPlanted = source.treesPlanted
  event.caloriesBurned = source.caloriesBurned
  event.sleepQualityPercentage = source.sleepQualityPercentage
  event.cleanEnergyProduction = source.cleanEnergyProduction
  event.wasteItems = source.wasteItems
  event.people = source.people
  event.biodiversity = source.biodiversity
  event.version = source.version
  event.rawJson = source.rawJson
  copyEventFields(event, source)
  event.save()

  let roundId = source.round
  if (roundId.length == 0) {
    const transfer = AppRewardTransfer.load(source.transfer)
    roundId = transfer == null ? currentRoundId() : transfer.round
  }
  applySustainability(source, roundId)
}

export function handleAppAllocationFunded(source: SourceAppAllocationFunded): void {
  const event = new AppAllocationFunded(source.id)
  event.app = source.app
  event.round = source.round
  const hasTargetRound = hasFieldValue(source, 'targetRound')
  const targetRoundValue = hasTargetRound ? readString(source, 'targetRound') : ''
  event.targetRound = hasTargetRound ? targetRoundValue : null
  event.amountExact = source.amountExact
  event.recipient = source.recipient
  event.caller = source.caller
  event.unallocatedAmount = source.unallocatedAmount
  event.teamAllocationAmount = source.teamAllocationAmount
  event.rewardsAllocationAmount = source.rewardsAllocationAmount
  copyEventFields(event, source)
  event.save()

  const app = fetchApp(source.app)
  const targetRound = hasTargetRound ? targetRoundValue : source.round
  const summary = fetchAppRoundSummary(app, fetchRound(targetRound))
  app.poolAllocationsExact = app.poolAllocationsExact.plus(source.amountExact)
  summary.poolAllocationsExact = summary.poolAllocationsExact.plus(source.amountExact)
  updateAppDecimals(app)
  updateSummaryDecimals(summary, app)
  app.save()
  summary.save()
  saveMetric(source.blockNumber, source.logIndex, source.timestamp, source.app, targetRound, ZERO, ZERO, ZERO, source.amountExact)
}

export function handleRoundRewardClaimed(source: SourceRoundRewardClaimed): void {
  const event = new RoundRewardClaimed(source.id)
  event.round = source.round
  event.cycle = source.cycle
  event.voter = source.voter
  event.rewardExact = source.rewardExact
  event.gmRewardExact = source.gmRewardExact
  copyEventFields(event, source)
  event.save()

  const total = source.rewardExact.plus(source.gmRewardExact)
  const stats = fetchStatistic(source.round, '')
  stats.totalRewardsClaimedExact = stats.totalRewardsClaimedExact.plus(source.rewardExact)
  stats.totalRewardsClaimed = toDecimal(stats.totalRewardsClaimedExact, 18)
  stats.save()
  if (VeDelegateAccount.load(source.voter) != null) {
    const veStats = fetchStatistic(source.round, 'vedelegate')
    veStats.totalRewardsClaimedExact = veStats.totalRewardsClaimedExact.plus(source.rewardExact)
    veStats.totalRewardsClaimed = toDecimal(veStats.totalRewardsClaimedExact, 18)
    veStats.save()
  }
  incrementLockRewardsByAccount(source.voter, total)
}

export function handleRoundRewardVoteRegistered(source: SourceRoundRewardVoteRegistered): void {
  const event = new RoundRewardVoteRegistered(source.id)
  event.round = source.round
  event.cycle = source.cycle
  event.voter = source.voter
  event.votePower = source.votePower
  event.rewardWeightedVote = source.rewardWeightedVote
  copyEventFields(event, source)
  event.save()

  const stats = fetchStatistic(source.round, '')
  stats.weightTotalExact = stats.weightTotalExact.plus(source.rewardWeightedVote)
  stats.weightTotal = toDecimal(stats.weightTotalExact, 18)
  stats.save()
  if (VeDelegateAccount.load(source.voter) != null) {
    const veStats = fetchStatistic(source.round, 'vedelegate')
    veStats.weightTotalExact = veStats.weightTotalExact.plus(source.rewardWeightedVote)
    veStats.weightTotal = toDecimal(veStats.weightTotalExact, 18)
    veStats.save()
  }
}

export function handleRoundGMVoteRegistered(source: SourceRoundGMVoteRegistered): void {
  const event = new RoundGMVoteRegistered(source.id)
  event.round = source.round
  event.cycle = source.cycle
  event.tokenId = source.tokenId
  event.level = source.level
  event.multiplier = source.multiplier
  copyEventFields(event, source)
  event.save()

  const stats = fetchStatistic(source.round, '')
  const cycleTokenId = [source.round, source.tokenId.toString()].join('/')
  let isNewCycleToken = false
  if (GMVoteCycleToken.load(cycleTokenId) == null) {
    new GMVoteCycleToken(cycleTokenId).save()
    isNewCycleToken = true
  }
  if (isNewCycleToken) {
    stats.gmVotersCount = stats.gmVotersCount.plus(ONE)
  }
  stats.gmWeightTotal = stats.gmWeightTotal.plus(source.multiplier)
  stats.save()

  const levelId = [source.round, source.level.toString()].join('/')
  let level = GMVoteLevel.load(levelId)
  if (level == null) {
    level = new GMVoteLevel(levelId)
    level.roundStatistic = stats.id
    level.level = source.level
    level.voterCount = ZERO
    level.weightTotal = ZERO
  }
  if (isNewCycleToken) {
    level.voterCount = level.voterCount.plus(ONE)
  }
  level.weightTotal = level.weightTotal.plus(source.multiplier)
  level.save()
}

export function handleTokenTransfer(source: SourceTokenTransfer): void {
  const event = new TokenTransfer(source.id)
  event.token = source.token
  event.from = source.from
  event.to = source.to
  event.amountExact = source.amountExact
  copyEventFields(event, source)
  event.save()

  if (source.from.equals(ZERO_ACCOUNT)) {
    addTokenSupply(source.token, source.amountExact)
  } else {
    addAccountBalance(source.token, source.from, ZERO.minus(source.amountExact))
  }
  if (source.to.equals(ZERO_ACCOUNT)) {
    addTokenSupply(source.token, ZERO.minus(source.amountExact))
  } else {
    addAccountBalance(source.token, source.to, source.amountExact)
  }
}

export function handleTokenApproval(source: SourceTokenApproval): void {
  const event = new TokenApproval(source.id)
  event.token = source.token
  event.owner = source.owner
  event.spender = source.spender
  event.amountExact = source.amountExact
  copyEventFields(event, source)
  event.save()

  const approval = new ERC20Approval([source.token.toHexString(), source.owner.toHexString(), source.spender.toHexString()].join('/'))
  approval.token = source.token
  approval.owner = fetchAccount(source.owner).id
  approval.spender = fetchAccount(source.spender).id
  approval.valueExact = source.amountExact
  approval.value = toDecimal(source.amountExact, 18)
  approval.save()
}

export function handleProposalCreated(source: SourceProposalCreatedEvent): void {
  const event = new ProposalCreatedEvent(source.id)
  event.proposalId = source.proposalId
  event.proposer = source.proposer
  event.targets = source.targets
  event.values = source.values
  event.signatures = source.signatures
  event.calldatas = source.calldatas
  event.descriptionURI = source.descriptionURI
  event.roundIdVoteStart = source.roundIdVoteStart
  event.depositThreshold = source.depositThreshold
  copyEventFields(event, source)
  event.save()

  const proposal = fetchProposal(source.emitter, source.proposalId)
  proposal.proposer = fetchAccount(source.proposer).id
  proposal.round = fetchRound(source.roundIdVoteStart.toString()).id
  proposal.descriptionUri = source.descriptionURI
  proposal.description = source.descriptionURI
  proposal.thresholdAmount = source.depositThreshold
  proposal.save()

  for (let i = 0; i < source.targets.length; i++) {
    const call = new ProposalCall(proposal.id.concat('/').concat(i.toString()))
    call.proposal = proposal.id
    call.index = i
    call.target = fetchAccount(source.targets[i]).id
    call.valueExact = i < source.values.length ? source.values[i] : ZERO
    call.value = toDecimal(call.valueExact, 18)
    call.signature = i < source.signatures.length ? source.signatures[i] : ''
    call.calldata = i < source.calldatas.length ? source.calldatas[i] : Bytes.empty()
    call.save()
  }
}

export function handleProposalQueued(source: SourceProposalQueuedEvent): void {
  const event = new ProposalQueuedEvent(source.id)
  event.proposalId = source.proposalId
  event.etaSeconds = source.etaSeconds
  copyEventFields(event, source)
  event.save()
  const proposal = fetchProposal(source.emitter, source.proposalId)
  proposal.queued = true
  proposal.save()
}

export function handleProposalExecuted(source: SourceProposalExecutedEvent): void {
  const event = new ProposalExecutedEvent(source.id)
  event.proposalId = source.proposalId
  copyEventFields(event, source)
  event.save()
  const proposal = fetchProposal(source.emitter, source.proposalId)
  proposal.executed = true
  proposal.save()
}

export function handleProposalCanceled(source: SourceProposalCanceledEvent): void {
  const event = new ProposalCanceledEvent(source.id)
  event.proposalId = source.proposalId
  copyEventFields(event, source)
  event.save()
  const proposal = fetchProposal(source.emitter, source.proposalId)
  proposal.canceled = true
  proposal.save()
}

export function handleProposalVoteCast(source: SourceProposalVoteCastEvent): void {
  const event = new ProposalVoteCastEvent(source.id)
  event.proposalId = source.proposalId
  event.voter = source.voter
  event.support = source.support
  event.weight = source.weight
  event.power = source.power
  event.reason = source.reason
  copyEventFields(event, source)
  event.save()

  const proposal = fetchProposal(source.emitter, source.proposalId)
  const support = fetchProposalSupport(proposal, source.support)
  support.weight = support.weight.plus(source.weight)
  support.power = support.power.plus(source.power)
  support.voter = support.voter.plus(ONE)
  support.save()

  const receipt = new VoteReceipt(source.id)
  receipt.proposal = proposal.id
  receipt.voter = fetchAccount(source.voter).id
  receipt.support = support.id
  receipt.weight = source.weight
  receipt.power = source.power
  receipt.reason = source.reason
  receipt.save()

  proposal.voterCount = proposal.voterCount.plus(ONE)
  proposal.votesCast = proposal.votesCast.plus(source.weight)
  proposal.weightCast = proposal.weightCast.plus(source.power)
  proposal.save()

  const vote = new ProposalVote(source.id)
  vote.timestamp = source.timestamp
  vote.proposal = proposal.id
  vote.voter = receipt.voter
  vote.support = support.id
  vote.weight = source.weight
  vote.power = source.power
  vote.totalWeightCast = proposal.votesCast
  vote.totalPowerCast = proposal.weightCast
  vote.save()
}

export function handleProposalDeposit(source: SourceProposalDepositEvent): void {
  const event = new ProposalDepositEvent(source.id)
  event.proposalId = source.proposalId
  event.depositor = source.depositor
  event.amountExact = source.amountExact
  copyEventFields(event, source)
  event.save()

  const proposal = fetchProposal(source.emitter, source.proposalId)
  const deposit = new ProposalDeposit(source.id)
  deposit.depositor = fetchAccount(source.depositor).id
  deposit.proposal = proposal.id
  deposit.amount = source.amountExact
  deposit.timestamp = source.timestamp
  deposit.txHash = source.txHash
  deposit.save()
  proposal.depositCount = proposal.depositCount.plus(ONE)
  proposal.depositAmount = proposal.depositAmount.plus(source.amountExact)
  proposal.save()
}

export function handleProposalMetadataDocument(source: SourceProposalMetadataDocument): void {
  const event = new ProposalMetadataDocument(source.id)
  event.title = source.title
  event.shortDescription = source.shortDescription
  event.markdownDescription = source.markdownDescription
  event.proposalType = source.proposalType
  event.rawJson = source.rawJson
  event.save()

  const metadata = new ProposalMetadata(source.id)
  metadata.title = source.title
  metadata.shortDescription = source.shortDescription
  metadata.markdownDescription = source.markdownDescription
  metadata.type = source.proposalType
  metadata.rawJson = source.rawJson
  metadata.save()
}

export function handleVoteDelegationChanged(source: SourceVoteDelegationChangedEvent): void {
  const event = new VoteDelegationChangedEvent(source.id)
  event.delegator = source.delegator
  event.fromDelegate = source.fromDelegate
  event.toDelegate = source.toDelegate
  copyEventFields(event, source)
  event.save()
}

export function handleVoteWeightChanged(source: SourceVoteWeightChangedEvent): void {
  const event = new VoteWeightChangedEvent(source.id)
  event.delegate = source.delegate
  event.previousBalance = source.previousBalance
  event.newBalance = source.newBalance
  copyEventFields(event, source)
  event.save()
}

export function handlePassportDelegation(source: SourcePassportDelegationEvent): void {
  const event = new PassportDelegationEvent(source.id)
  event.action = source.action
  event.delegator = source.delegator
  event.delegatee = source.delegatee
  copyEventFields(event, source)
  event.save()

  const id = [source.delegator.toHexString(), source.delegatee.toHexString(), 'delegation'].join('/')
  const delegation = fetchPassportDelegation(id, source.delegator, source.delegatee)
  delegation.pending = source.action == 'PENDING'
  delegation.active = source.action == 'CREATED'
  delegation.timestamp = source.timestamp
  delegation.save()
  const veAccount = VeDelegateAccount.load(source.delegatee)
  if (veAccount != null) {
    veAccount.passportDelegation = delegation.active ? delegation.id : null
    veAccount.save()
  }
}

export function handlePassportEntityLink(source: SourcePassportEntityLinkEvent): void {
  const event = new PassportEntityLinkEvent(source.id)
  event.action = source.action
  event.entity = source.entity
  event.passport = source.passport
  copyEventFields(event, source)
  event.save()

  const id = [source.entity.toHexString(), source.passport.toHexString(), 'link'].join('/')
  const link = fetchPassportEntityLink(id, source.entity, source.passport)
  link.pending = source.action == 'PENDING'
  link.active = source.action == 'CREATED'
  link.timestamp = source.timestamp
  link.save()
}

export function handlePassportRegisteredAction(source: SourcePassportRegisteredAction): void {
  const event = new PassportRegisteredAction(source.id)
  event.user = source.user
  event.passport = source.passport
  event.app = source.app
  event.round = source.round
  event.roundId = source.roundId
  event.actionScore = source.actionScore
  copyEventFields(event, source)
  event.save()

  const app = fetchApp(source.app)
  const round = fetchRound(source.round)
  const summary = fetchAppRoundSummary(app, round)
  summary.passportScore = summary.passportScore.plus(source.actionScore)
  summary.save()
  const accountRound = fetchAccountRoundSustainability(source.passport, app, round)
  accountRound.passportScore = accountRound.passportScore.plus(source.actionScore)
  accountRound.save()
  const stats = fetchStatistic(source.round, '')
  stats.totalActionScores = stats.totalActionScores.plus(source.actionScore)
  stats.save()

  const score = new PassportScore(source.id)
  score.user = fetchAccount(source.user).id
  score.passport = fetchAccount(source.passport).id
  score.round = round.id
  score.app = app.id
  score.score = source.actionScore
  score.timestamp = source.timestamp
  score.save()
}

export function handlePassportList(source: SourcePassportListEvent): void {
  const event = new PassportListEvent(source.id)
  event.list = source.list
  event.active = source.active
  event.user = source.user
  event.passport = source.passport
  event.actor = source.actor
  copyEventFields(event, source)
  event.save()

  if (source.list == 'WHITELIST') {
    let whitelist = PassportWhitelist.load(source.user)
    if (whitelist == null) {
      whitelist = new PassportWhitelist(source.user)
      whitelist.user = fetchAccount(source.user).id
      whitelist.whitelistedBy = fetchAccount(source.actor).id
    }
    whitelist.active = source.active
    whitelist.save()
  } else {
    let blacklist = PassportBlacklist.load(source.user)
    if (blacklist == null) {
      blacklist = new PassportBlacklist(source.user)
      blacklist.user = fetchAccount(source.user).id
      blacklist.blacklistedBy = fetchAccount(source.actor).id
    }
    blacklist.active = source.active
    blacklist.save()
  }
}

export function handleUserSignal(source: SourceUserSignalEvent): void {
  const event = new UserSignalEvent(source.id)
  event.user = source.user
  event.signaler = source.signaler
  event.app = source.app
  event.reason = source.reason
  copyEventFields(event, source)
  event.save()

  const signal = fetchUserSignal(source.user, source.app)
  signal.signalCount = signal.signalCount.plus(ONE)
  signal.reason = source.reason
  signal.timestamp = source.timestamp
  signal.save()
}

export function handleUserSignalsReset(source: SourceUserSignalsResetEvent): void {
  const event = new UserSignalsReset(source.id)
  event.user = fetchAccount(source.user).id
  event.reason = source.reason
  event.timestamp = source.timestamp
  event.save()
  const sourceEvent = new UserSignalsResetEvent(source.id)
  sourceEvent.user = source.user
  sourceEvent.reason = source.reason
  copyEventFields(sourceEvent, source)
  sourceEvent.save()
}

export function handleUserSignalsResetForApp(source: SourceUserSignalsResetForAppEvent): void {
  const event = new UserSignalsResetForApp(source.id)
  event.user = fetchAccount(source.user).id
  event.app = fetchApp(source.app).id
  event.reason = source.reason
  event.timestamp = source.timestamp
  event.save()
  const sourceEvent = new UserSignalsResetForAppEvent(source.id)
  sourceEvent.user = source.user
  sourceEvent.app = source.app
  sourceEvent.reason = source.reason
  copyEventFields(sourceEvent, source)
  sourceEvent.save()
  const signal = fetchUserSignal(source.user, source.app)
  signal.signalCount = ZERO
  signal.reason = source.reason
  signal.timestamp = source.timestamp
  signal.save()
}

export function handleNftTransfer(source: SourceNftTransferEvent): void {
  const hasPoolAddress = hasFieldValue(source, 'poolAddress')
  const hasLevel = hasFieldValue(source, 'level')
  const hasPoints = hasFieldValue(source, 'points')
  const hasIsX = hasFieldValue(source, 'isX')
  const poolAddress = hasPoolAddress ? readBytes(source, 'poolAddress') : ZERO_ACCOUNT
  const level = hasLevel ? readI32(source, 'level') : 0
  const points = hasPoints ? readI32(source, 'points') : levelToPoints(level)
  const isX = hasIsX ? readBoolean(source, 'isX') : level >= 4
  const event = new NftTransferEvent(source.id)
  event.collection = source.collection
  event.tokenId = source.tokenId
  event.from = source.from
  event.to = source.to
  event.poolAddress = hasPoolAddress ? poolAddress : null
  if (hasLevel) {
    event.level = level
  }
  if (hasPoints) {
    event.points = points
  }
  if (hasIsX) {
    event.isX = isX
  }
  copyEventFields(event, source)
  event.save()

  const token = fetchERC721Token(source.collection, source.tokenId)
  token.owner = fetchAccount(source.to).id
  token.approval = null
  if (hasPoolAddress) {
    token.poolAddress = fetchAccount(poolAddress).id
    const veAccount = fetchVeDelegateAccount(poolAddress)
    veAccount.token = token.id
    veAccount.save()
  }
  token.save()

  if (isNodeCollection(source.collection) || hasLevel) {
    const node = fetchNode(source.tokenId)
    node.owner = fetchAccount(source.to).id
    if (hasLevel) {
      node.level = level
      node.points = points
      node.isX = isX
    }
    node.save()
  }
}

export function handleNftApproval(source: SourceNftApprovalEvent): void {
  const event = new NftApprovalEvent(source.id)
  event.collection = source.collection
  event.tokenId = source.tokenId
  event.owner = source.owner
  event.approved = source.approved
  copyEventFields(event, source)
  event.save()
  const token = fetchERC721Token(source.collection, source.tokenId)
  token.approval = fetchAccount(source.approved).id
  token.save()
}

export function handleNftApprovalForAll(source: SourceNftApprovalForAllEvent): void {
  const event = new NftApprovalForAllEvent(source.id)
  event.collection = source.collection
  event.owner = source.owner
  event.operator = source.operator
  event.approved = source.approved
  copyEventFields(event, source)
  event.save()

  const approval = new ERC721Operator([source.collection.toHexString(), source.owner.toHexString(), source.operator.toHexString()].join('/'))
  approval.collection = source.collection
  approval.owner = fetchAccount(source.owner).id
  approval.operator = fetchAccount(source.operator).id
  approval.approved = source.approved
  approval.save()
}

export function handleVeDelegateConfigChanged(source: SourceVeDelegateConfigChangedEvent): void {
  const event = new VeDelegateConfigChangedEvent(source.id)
  event.sender = source.sender
  event.configId = source.configId
  event.value = source.value
  copyEventFields(event, source)
  event.save()

  const configId = [source.sender.toHexString(), source.configId.toHexString()].join('/')
  const config = new VeDelegateConfig(configId)
  config.account = fetchAccount(source.sender).id
  config.configId = source.configId.toHexString()
  config.value = source.value
  config.save()
}

export function handleNodeDelegated(source: SourceNodeDelegatedEvent): void {
  const event = new NodeDelegatedEvent(source.id)
  event.nodeId = source.nodeId
  event.delegatee = source.delegatee
  event.delegated = source.delegated
  copyEventFields(event, source)
  event.save()

  const node = fetchNode(source.nodeId)
  const delegationId = [source.nodeId.toString(), 'delegation', 'node'].join('/')
  let delegation = NodeDelegation.load(delegationId)
  const previousActive = delegation == null ? false : delegation.active
  if (delegation == null) {
    delegation = new NodeDelegation(delegationId)
    delegation.node = node.id
    delegation.delegatee = fetchAccount(source.delegatee).id
  }
  delegation.active = source.delegated
  delegation.delegatee = fetchAccount(source.delegatee).id
  delegation.timestamp = source.timestamp
  delegation.save()
  if (previousActive != source.delegated) {
    updateDelegatedStats(node, source.delegated ? 1 : -1)
  }

  const veAccount = VeDelegateAccount.load(source.delegatee)
  if (veAccount != null) {
    veAccount.nodeDelegation = source.delegated ? delegation.id : null
    veAccount.save()
  }
}

export function handleThorNodeLevelChanged(source: SourceThorNodeLevelChangedEvent): void {
  const event = new ThorNodeLevelChangedEvent(source.id)
  event.tokenId = source.tokenId
  event.owner = source.owner
  event.fromLevel = source.fromLevel
  event.toLevel = source.toLevel
  copyEventFields(event, source)
  event.save()

  const node = fetchNode(source.tokenId)
  const diff = levelToPoints(source.toLevel) - levelToPoints(source.fromLevel)
  node.owner = fetchAccount(source.owner).id
  node.level = source.toLevel
  node.points = levelToPoints(source.toLevel)
  node.isX = source.toLevel >= 4
  node.save()
  if (hasFieldValue(node, 'appEndorsement')) {
    const allStats = fetchStatsEndorsement('all')
    allStats.points += diff
    allStats.save()
  }
}

export function handleLock2EarnTerm(source: SourceLock2EarnTermEvent): void {
  const hasStartTime = hasFieldValue(source, 'startTime')
  const hasTermLength = hasFieldValue(source, 'termLength')
  const hasTermInterval = hasFieldValue(source, 'termInterval')
  const hasEndTime = hasFieldValue(source, 'endTime')
  const hasVeDelegatePoolTokenId = hasFieldValue(source, 'veDelegatePoolTokenId')
  const hasVeDelegatePoolAddress = hasFieldValue(source, 'veDelegatePoolAddress')
  const startTime = hasStartTime ? readBigInt(source, 'startTime') : ZERO
  const termLength = hasTermLength ? readBigInt(source, 'termLength') : ZERO
  const termInterval = hasTermInterval ? readBigInt(source, 'termInterval') : ZERO
  const endTime = hasEndTime ? readBigInt(source, 'endTime') : ZERO
  const veDelegatePoolTokenId = hasVeDelegatePoolTokenId ? readBigInt(source, 'veDelegatePoolTokenId') : ZERO
  const veDelegatePoolAddress = hasVeDelegatePoolAddress ? readBytes(source, 'veDelegatePoolAddress') : ZERO_ACCOUNT
  const event = new Lock2EarnTermEvent(source.id)
  event.action = source.action
  event.tokenId = source.tokenId
  event.owner = source.owner
  event.amountExact = source.amountExact
  event.optionId = source.optionId
  event.autoRenew = source.autoRenew
  event.startTime = hasStartTime ? startTime : null
  event.termLength = hasTermLength ? termLength : null
  event.termInterval = hasTermInterval ? termInterval : null
  event.endTime = hasEndTime ? endTime : null
  event.veDelegatePoolTokenId = hasVeDelegatePoolTokenId ? veDelegatePoolTokenId : null
  event.veDelegatePoolAddress = hasVeDelegatePoolAddress ? veDelegatePoolAddress : null
  copyEventFields(event, source)
  event.save()
  applyLockTerm(source, startTime, termLength, termInterval, endTime, hasVeDelegatePoolAddress, veDelegatePoolAddress)
}

export function handleVetDomainAddressChanged(source: SourceVetDomainAddressChangedEvent): void {
  const event = new VetDomainAddressChangedEvent(source.id)
  event.node = source.node
  event.address = source.address
  copyEventFields(event, source)
  event.save()
}

export function handleVetDomainNameChanged(source: SourceVetDomainNameChangedEvent): void {
  const event = new VetDomainNameChangedEvent(source.id)
  event.node = source.node
  event.name = source.name
  copyEventFields(event, source)
  event.save()
  const name = new VetDomainsNames(source.name)
  name.address = fetchAccount(source.node).id
  name.save()
}

function applySustainability(source: SourceSustainabilityProofDocument, roundId: string): void {
  const app = fetchApp(source.app)
  const round = fetchRound(roundId)
  const summary = fetchAppRoundSummary(app, round)
  const stats = fetchSustainabilityStats(summary.id)
  const accountSustainability = fetchAccountSustainability(source.account, app)
  const knownRoundAccount = AccountRoundSustainability.load([source.account.toHexString(), source.app.toHexString(), round.id].join('/'))
  const accountRound = fetchAccountRoundSustainability(source.account, app, round)

  if (accountSustainability.receivedRewards.equals(ZERO)) {
    app.participantsCount = app.participantsCount.plus(ONE)
  }
  if (knownRoundAccount == null) {
    summary.activeUserCount = summary.activeUserCount.plus(ONE)
  }

  accountSustainability.receivedRewards = accountSustainability.receivedRewards.plus(source.rewardExact)
  addImpactToAccount(accountSustainability, source)
  accountSustainability.save()

  accountRound.receivedRewards = accountRound.receivedRewards.plus(source.rewardExact)
  addImpactToAccountRound(accountRound, source)
  accountRound.save()

  stats.rewards = stats.rewards.plus(source.rewardExact)
  stats.actionCount = stats.actionCount.plus(ONE)
  stats.newUserCount = app.participantsCount.minus(stats.participantsCountStart)
  addImpactToStats(stats, source)
  stats.save()
  app.save()
  summary.save()
}

function applyLockTerm(
  source: SourceLock2EarnTermEvent,
  startTime: BigInt,
  termLength: BigInt,
  termInterval: BigInt,
  endTime: BigInt,
  hasVeDelegatePoolAddress: boolean,
  veDelegatePoolAddress: Bytes,
): void {
  const stats = fetchLock2EarnStats()
  let term = Lock2EarnTerm.load(source.tokenId.toString())
  if (term == null) {
    term = new Lock2EarnTerm(source.tokenId.toString())
    term.tokenId = source.tokenId
    term.createdAt = source.timestamp
    term.rewards = BD_ZERO
    term.rewardsExact = ZERO
    stats.termCount = stats.termCount.plus(ONE)
  }

  if (source.action == 'CLOSED') {
    if (!term.closed) {
      stats.activeAmountExact = stats.activeAmountExact.minus(term.amountExact)
      stats.closedAmountExact = stats.closedAmountExact.plus(term.amountExact)
      stats.activeTermCount = stats.activeTermCount.minus(ONE)
      stats.closedTermCount = stats.closedTermCount.plus(ONE)
    }
    term.closed = true
    term.updatedAt = source.timestamp
    updateLockStatsDecimals(stats)
    term.save()
    stats.save()
    return
  }

  const oldAmount = term.amountExact
  const wasClosed = term.closed
  term.owner = fetchAccount(source.owner).id
  term.startTime = startTime
  term.termLength = termLength
  term.termInterval = termInterval
  term.endTime = endTime
  term.amountExact = source.amountExact
  term.amount = toDecimal(source.amountExact, 18)
  term.closed = false
  term.updatedAt = source.timestamp
  if (hasVeDelegatePoolAddress) {
    const veAccount = fetchVeDelegateAccount(veDelegatePoolAddress)
    veAccount.lock2EarnTermId = term.id
    veAccount.save()
    term.veDelegateAccount = veAccount.id
  }
  if (source.action == 'RENEWED') {
    term.rewards = BD_ZERO
    term.rewardsExact = ZERO
  }
  term.save()

  if (oldAmount.equals(ZERO) && !wasClosed) {
    stats.totalAmountExact = stats.totalAmountExact.plus(source.amountExact)
    stats.activeAmountExact = stats.activeAmountExact.plus(source.amountExact)
    stats.activeTermCount = stats.activeTermCount.plus(ONE)
  } else if (wasClosed) {
    stats.closedAmountExact = stats.closedAmountExact.minus(oldAmount)
    stats.activeAmountExact = stats.activeAmountExact.plus(source.amountExact)
    stats.closedTermCount = stats.closedTermCount.minus(ONE)
    stats.activeTermCount = stats.activeTermCount.plus(ONE)
  } else if (!oldAmount.equals(source.amountExact)) {
    stats.activeAmountExact = stats.activeAmountExact.minus(oldAmount).plus(source.amountExact)
  }
  updateLockStatsDecimals(stats)
  stats.save()
}

function fetchAccount(id: Bytes): Account {
  let account = Account.load(id)
  if (account == null) {
    account = new Account(id)
    account.save()
  }
  return account
}

function fetchApp(id: Bytes): App {
  let app = App.load(id)
  if (app == null) {
    app = new App(id)
    app.endorsed = false
    app.poolAllocations = BD_ZERO
    app.poolAllocationsExact = ZERO
    app.poolBalance = BD_ZERO
    app.poolBalanceExact = ZERO
    app.poolDeposits = BD_ZERO
    app.poolDepositsExact = ZERO
    app.poolWithdrawals = BD_ZERO
    app.poolWithdrawalsExact = ZERO
    app.poolDistributions = BD_ZERO
    app.poolDistributionsExact = ZERO
    app.participantsCount = ZERO
    app.createdAtBlockNumber = ZERO
    app.updatedAtBlockNumber = ZERO
    app.createdAt = ZERO
    app.save()
  }
  return app
}

function fetchRound(id: string): Round {
  let round = Round.load(id)
  if (round == null) {
    round = new Round(id)
    round.number = BigInt.fromString(id)
    round.voteStart = ZERO
    round.voteEnd = ZERO
    round.apps = new Array<Bytes>()
    round.allocations = new Array<string>()
    round.veDelegateAllocations = new Array<string>()
    round.statistic = fetchStatistic(id, '').id
    round.veDelegateStatistic = fetchStatistic(id, 'vedelegate').id
    round.save()
  }
  return round
}

function fetchStatistic(round: string, suffix: string): RoundStatistic {
  const id = suffix.length == 0 ? round : round.concat('/').concat(suffix)
  let stats = RoundStatistic.load(id)
  if (stats == null) {
    stats = new RoundStatistic(id)
    stats.b3tr = BD_ZERO
    stats.b3trExact = ZERO
    stats.vot3 = BD_ZERO
    stats.vot3Exact = ZERO
    stats.voters = ZERO
    stats.votesCast = BD_ZERO
    stats.votesCastExact = ZERO
    stats.weight = BD_ZERO
    stats.weightExact = ZERO
    stats.weightTotal = BD_ZERO
    stats.weightTotalExact = ZERO
    stats.gmVotersCount = ZERO
    stats.gmWeightTotal = ZERO
    stats.totalRewardsClaimed = BD_ZERO
    stats.totalRewardsClaimedExact = ZERO
    stats.totalActionScores = ZERO
    stats.save()
  }
  return stats
}

function fetchAllocation(round: string, app: Bytes, suffix: string): AllocationResult {
  const id = suffix.length == 0 ? [round, app.toHexString()].join('/') : [round, app.toHexString(), suffix].join('/')
  let allocation = AllocationResult.load(id)
  if (allocation == null) {
    allocation = new AllocationResult(id)
    allocation.round = fetchRound(round).id
    allocation.app = fetchApp(app).id
    allocation.voters = ZERO
    allocation.weight = BD_ZERO
    allocation.weightExact = ZERO
    allocation.votesCast = BD_ZERO
    allocation.votesCastExact = ZERO
    allocation.save()
  }
  return allocation
}

function fetchStatsAllocationVote(round: string, app: Bytes): StatsAllocationVote {
  const id = [round, app.toHexString()].join('/')
  let stat = StatsAllocationVote.load(id)
  if (stat == null) {
    stat = new StatsAllocationVote(id)
    stat.round = fetchRound(round).id
    stat.app = fetchApp(app).id
    stat.votes = ZERO
    stat.weight = BD_ZERO
    stat.weightExact = ZERO
    stat.qfWeight = BD_ZERO
    stat.qfWeightExact = ZERO
    stat.updatedAtBlockNumber = ZERO
    stat.save()
  }
  return stat
}

function fetchAppRoundSummary(app: App, round: Round): AppRoundSummary {
  const id = [app.id.toHexString(), round.id].join('/')
  let summary = AppRoundSummary.load(id)
  if (summary == null) {
    summary = new AppRoundSummary(id)
    summary.app = app.id
    summary.round = round.id
    summary.activeUserCount = ZERO
    summary.poolBalance = app.poolBalance
    summary.poolBalanceExact = app.poolBalanceExact
    summary.poolAllocations = BD_ZERO
    summary.poolAllocationsExact = ZERO
    summary.poolDeposits = BD_ZERO
    summary.poolDepositsExact = ZERO
    summary.poolWithdrawals = BD_ZERO
    summary.poolWithdrawalsExact = ZERO
    summary.poolDistributions = BD_ZERO
    summary.poolDistributionsExact = ZERO
    summary.passportScore = ZERO
    summary.sustainabilityStats = fetchSustainabilityStats(id).id
    summary.save()
  }
  return summary
}

function fetchSustainabilityStats(id: string): SustainabilityStats {
  let stats = SustainabilityStats.load(id)
  if (stats == null) {
    stats = new SustainabilityStats(id)
    stats.rewards = ZERO
    stats.participantsCountStart = ZERO
    stats.newUserCount = ZERO
    stats.actionCount = ZERO
    stats.carbon = ZERO
    stats.water = ZERO
    stats.energy = ZERO
    stats.wasteMass = ZERO
    stats.plastic = ZERO
    stats.timber = ZERO
    stats.educationTime = ZERO
    stats.treesPlanted = ZERO
    stats.caloriesBurned = ZERO
    stats.sleepQualityPercentage = ZERO
    stats.cleanEnergyProduction = ZERO
    stats.wasteItems = ZERO
    stats.people = ZERO
    stats.biodiversity = ZERO
    stats.save()
  }
  return stats
}

function fetchWithdrawalReason(summary: AppRoundSummary, reason: string): AppRoundWithdrawalReason {
  const id = [summary.id, reason].join('/')
  let row = AppRoundWithdrawalReason.load(id)
  if (row == null) {
    row = new AppRoundWithdrawalReason(id)
    row.appRoundSummary = summary.id
    row.reason = reason
    row.amount = BD_ZERO
    row.amountExact = ZERO
    row.save()
  }
  return row
}

function fetchAccountSustainability(accountId: Bytes, app: App): AccountSustainability {
  const id = [accountId.toHexString(), app.id.toHexString()].join('/')
  let row = AccountSustainability.load(id)
  if (row == null) {
    row = new AccountSustainability(id)
    row.app = app.id
    row.account = fetchAccount(accountId).id
    row.receivedRewards = ZERO
    row.carbon = ZERO
    row.water = ZERO
    row.energy = ZERO
    row.wasteMass = ZERO
    row.plastic = ZERO
    row.timber = ZERO
    row.educationTime = ZERO
    row.treesPlanted = ZERO
    row.caloriesBurned = ZERO
    row.sleepQualityPercentage = ZERO
    row.cleanEnergyProduction = ZERO
    row.wasteItems = ZERO
    row.people = ZERO
    row.biodiversity = ZERO
    row.save()
  }
  return row
}

function fetchAccountRoundSustainability(accountId: Bytes, app: App, round: Round): AccountRoundSustainability {
  const id = [accountId.toHexString(), app.id.toHexString(), round.id].join('/')
  let row = AccountRoundSustainability.load(id)
  if (row == null) {
    row = new AccountRoundSustainability(id)
    row.app = app.id
    row.round = round.id
    row.account = fetchAccount(accountId).id
    row.receivedRewards = ZERO
    row.passportScore = ZERO
    row.carbon = ZERO
    row.water = ZERO
    row.energy = ZERO
    row.wasteMass = ZERO
    row.plastic = ZERO
    row.timber = ZERO
    row.educationTime = ZERO
    row.treesPlanted = ZERO
    row.caloriesBurned = ZERO
    row.sleepQualityPercentage = ZERO
    row.cleanEnergyProduction = ZERO
    row.wasteItems = ZERO
    row.people = ZERO
    row.biodiversity = ZERO
    row.save()
  }
  return row
}

function fetchProposal(governor: Bytes, proposalId: BigInt): Proposal {
  const id = governor.toHexString().concat('/').concat(proposalId.toHexString())
  let proposal = Proposal.load(id)
  if (proposal == null) {
    proposal = new Proposal(id)
    proposal.proposalId = proposalId
    proposal.proposer = fetchAccount(ZERO_ACCOUNT).id
    proposal.canceled = false
    proposal.queued = false
    proposal.executed = false
    proposal.depositCount = ZERO
    proposal.depositAmount = ZERO
    proposal.thresholdAmount = ZERO
    proposal.voterCount = ZERO
    proposal.votesCast = ZERO
    proposal.weightCast = ZERO
    proposal.save()
  }
  return proposal
}

function fetchProposalSupport(proposal: Proposal, supportId: i32): ProposalSupport {
  const id = proposal.id.concat('/').concat(supportId.toString())
  let support = ProposalSupport.load(id)
  if (support == null) {
    support = new ProposalSupport(id)
    support.proposal = proposal.id
    support.support = supportId
    support.voter = ZERO
    support.weight = ZERO
    support.power = ZERO
    support.save()
  }
  return support
}

function fetchPassportDelegation(id: string, delegator: Bytes, delegatee: Bytes): PassportDelegation {
  let row = PassportDelegation.load(id)
  if (row == null) {
    row = new PassportDelegation(id)
    row.delegator = fetchAccount(delegator).id
    row.delegatee = fetchAccount(delegatee).id
    row.active = false
    row.pending = false
    row.timestamp = ZERO
    row.save()
  }
  return row
}

function fetchPassportEntityLink(id: string, entity: Bytes, passport: Bytes): PassportEntityLink {
  let row = PassportEntityLink.load(id)
  if (row == null) {
    row = new PassportEntityLink(id)
    row.entity = fetchAccount(entity).id
    row.passport = fetchAccount(passport).id
    row.active = false
    row.pending = false
    row.timestamp = ZERO
    row.save()
  }
  return row
}

function fetchUserSignal(user: Bytes, app: Bytes): UserSignal {
  const id = [user.toHexString(), app.toHexString()].join('/')
  let signal = UserSignal.load(id)
  if (signal == null) {
    signal = new UserSignal(id)
    signal.user = fetchAccount(user).id
    signal.app = fetchApp(app).id
    signal.signalCount = ZERO
    signal.reason = ''
    signal.timestamp = ZERO
    signal.save()
  }
  return signal
}

function fetchERC721Token(collection: Bytes, tokenId: BigInt): ERC721Token {
  const id = [collection.toHexString(), tokenId.toString()].join('/')
  let token = ERC721Token.load(id)
  if (token == null) {
    token = new ERC721Token(id)
    token.collection = collection
    token.identifier = tokenId
    token.owner = fetchAccount(ZERO_ACCOUNT).id
    token.save()
  }
  return token
}

function fetchVeDelegateAccount(id: Bytes): VeDelegateAccount {
  let account = VeDelegateAccount.load(id)
  if (account == null) {
    account = new VeDelegateAccount(id)
    account.account = fetchAccount(id).id
    account.save()
  }
  return account
}

function fetchNode(tokenId: BigInt): ThorNode {
  let node = ThorNode.load(tokenId.toString())
  if (node == null) {
    node = new ThorNode(tokenId.toString())
    node.identifier = tokenId
    node.owner = fetchAccount(ZERO_ACCOUNT).id
    node.level = 0
    node.points = 0
    node.isX = false
    node.save()
  }
  return node
}

function fetchStatsEndorsement(id: string): StatsEndorsement {
  let stats = StatsEndorsement.load(id)
  if (stats == null) {
    stats = new StatsEndorsement(id)
    stats.nodeCount = 0
    stats.points = 0
    stats.delegatedPoints = 0
    stats.save()
  }
  return stats
}

function fetchLock2EarnStats(): Lock2EarnStats {
  let stats = Lock2EarnStats.load('global')
  if (stats == null) {
    stats = new Lock2EarnStats('global')
    stats.totalAmount = BD_ZERO
    stats.totalAmountExact = ZERO
    stats.activeAmount = BD_ZERO
    stats.activeAmountExact = ZERO
    stats.closedAmount = BD_ZERO
    stats.closedAmountExact = ZERO
    stats.termCount = ZERO
    stats.activeTermCount = ZERO
    stats.closedTermCount = ZERO
    stats.totalRewards = BD_ZERO
    stats.totalRewardsExact = ZERO
    stats.save()
  }
  return stats
}

function addTokenSupply(token: Bytes, amount: BigInt): void {
  const id = [token.toHexString(), 'totalSupply'].join('/')
  let balance = ERC20Balance.load(id)
  if (balance == null) {
    balance = new ERC20Balance(id)
    balance.token = token
    balance.account = null
    balance.value = BD_ZERO
    balance.valueExact = ZERO
  }
  balance.valueExact = balance.valueExact.plus(amount)
  balance.value = toDecimal(balance.valueExact, 18)
  balance.save()
}

function addAccountBalance(token: Bytes, account: Bytes, amount: BigInt): void {
  const id = [token.toHexString(), account.toHexString()].join('/')
  let balance = ERC20Balance.load(id)
  if (balance == null) {
    balance = new ERC20Balance(id)
    balance.token = token
    balance.account = fetchAccount(account).id
    balance.value = BD_ZERO
    balance.valueExact = ZERO
  }
  balance.valueExact = balance.valueExact.plus(amount)
  balance.value = toDecimal(balance.valueExact, 18)
  balance.save()
  if (isVbdToken(token)) {
    updateVbdBalance(account)
  }
}

function isVbdToken(token: Bytes): boolean {
  if (token.equals(B3TR)) return true
  if (token.equals(VOT3)) return true
  if (token.equals(VEB3TR)) return true
  return false
}

function updateVbdBalance(accountId: Bytes): void {
  const id = accountId.toHexString()
  let balance = VBDBalance.load(id)
  if (balance == null) {
    balance = new VBDBalance(id)
    balance.account = fetchAccount(accountId).id
    balance.convertedB3tr = BD_ZERO
    balance.convertedB3trExact = ZERO
    balance.value = BD_ZERO
    balance.valueExact = ZERO
    balance.qfWeight = ZERO
  }
  const b3tr = ERC20Balance.load([B3TR.toHexString(), accountId.toHexString()].join('/'))
  const vot3 = ERC20Balance.load([VOT3.toHexString(), accountId.toHexString()].join('/'))
  const veb3tr = ERC20Balance.load([VEB3TR.toHexString(), accountId.toHexString()].join('/'))
  const b3trExact = b3tr == null ? ZERO : b3tr.valueExact
  const vot3Exact = vot3 == null ? ZERO : vot3.valueExact
  const veb3trExact = veb3tr == null ? ZERO : veb3tr.valueExact
  balance.convertedB3trExact = b3trExact.plus(vot3Exact)
  balance.convertedB3tr = toDecimal(balance.convertedB3trExact, 18)
  balance.valueExact = veb3trExact
  balance.value = toDecimal(balance.valueExact, 18)
  balance.qfWeight = balance.valueExact.sqrt()
  balance.save()
}

function currentRoundId(): string {
  const current = CurrentRound.load('singleton')
  if (current == null) {
    return '0'
  }
  return current.roundId.toString()
}

function updateEndorsementStats(node: ThorNode, direction: i32): void {
  const allStats = fetchStatsEndorsement('all')
  allStats.nodeCount += direction
  allStats.points += node.points * direction
  allStats.save()
  if (hasFieldValue(node, 'delegation')) {
    const delegatedStats = fetchStatsEndorsement('veDelegate')
    delegatedStats.nodeCount += direction
    delegatedStats.points += node.points * direction
    delegatedStats.save()
  }
}

function updateDelegatedStats(node: ThorNode, direction: i32): void {
  const allStats = fetchStatsEndorsement('all')
  allStats.delegatedPoints += node.points * direction
  allStats.save()
  const delegatedStats = fetchStatsEndorsement('veDelegate')
  delegatedStats.delegatedPoints += node.points * direction
  delegatedStats.save()
}

function incrementLockRewardsByAccount(accountId: Bytes, amount: BigInt): void {
  const veAccount = VeDelegateAccount.load(accountId)
  if (veAccount == null) return
  if (!hasFieldValue(veAccount, 'lock2EarnTermId')) return
  const term = Lock2EarnTerm.load(readString(veAccount, 'lock2EarnTermId'))
  if (term == null) return
  const stats = fetchLock2EarnStats()
  term.rewardsExact = term.rewardsExact.plus(amount)
  term.rewards = toDecimal(term.rewardsExact, 18)
  term.save()
  stats.totalRewardsExact = stats.totalRewardsExact.plus(amount)
  stats.totalRewards = toDecimal(stats.totalRewardsExact, 18)
  stats.save()
}

function updateAppDecimals(app: App): void {
  app.poolAllocations = toDecimal(app.poolAllocationsExact, 18)
  app.poolBalance = toDecimal(app.poolBalanceExact, 18)
  app.poolDeposits = toDecimal(app.poolDepositsExact, 18)
  app.poolWithdrawals = toDecimal(app.poolWithdrawalsExact, 18)
  app.poolDistributions = toDecimal(app.poolDistributionsExact, 18)
}

function updateSummaryDecimals(summary: AppRoundSummary, app: App): void {
  summary.poolBalanceExact = app.poolBalanceExact
  summary.poolBalance = app.poolBalance
  summary.poolAllocations = toDecimal(summary.poolAllocationsExact, 18)
  summary.poolDeposits = toDecimal(summary.poolDepositsExact, 18)
  summary.poolWithdrawals = toDecimal(summary.poolWithdrawalsExact, 18)
  summary.poolDistributions = toDecimal(summary.poolDistributionsExact, 18)
}

function updateLockStatsDecimals(stats: Lock2EarnStats): void {
  stats.totalAmount = toDecimal(stats.totalAmountExact, 18)
  stats.activeAmount = toDecimal(stats.activeAmountExact, 18)
  stats.closedAmount = toDecimal(stats.closedAmountExact, 18)
  stats.totalRewards = toDecimal(stats.totalRewardsExact, 18)
}

function saveMetric(
  sourceBlockNumber: BigInt,
  sourceLogIndex: BigInt,
  sourceTimestamp: BigInt,
  sourceApp: Bytes,
  sourceRound: string,
  depositAmountExact: BigInt,
  withdrawalAmountExact: BigInt,
  distributionAmountExact: BigInt,
  allocationAmountExact: BigInt,
): void {
  const metric = new AppMetricEvent(sourceBlockNumber.toI64() * 1000000000 + sourceLogIndex.toI64())
  metric.timestamp = sourceTimestamp.toI64()
  metric.app = sourceApp
  metric.round = sourceRound.length == 0 ? null : sourceRound
  metric.depositAmountExact = depositAmountExact
  metric.withdrawalAmountExact = withdrawalAmountExact
  metric.distributionAmountExact = distributionAmountExact
  metric.allocationAmountExact = allocationAmountExact
  metric.rewardAmountExact = distributionAmountExact.plus(allocationAmountExact)
  metric.transferCount = 1
  metric.save()
}

function addImpactToStats(stats: SustainabilityStats, proof: SourceSustainabilityProofDocument): void {
  stats.carbon = stats.carbon.plus(proof.carbon)
  stats.water = stats.water.plus(proof.water)
  stats.energy = stats.energy.plus(proof.energy)
  stats.wasteMass = stats.wasteMass.plus(proof.wasteMass)
  stats.plastic = stats.plastic.plus(proof.plastic)
  stats.timber = stats.timber.plus(proof.timber)
  stats.educationTime = stats.educationTime.plus(proof.educationTime)
  stats.treesPlanted = stats.treesPlanted.plus(proof.treesPlanted)
  stats.caloriesBurned = stats.caloriesBurned.plus(proof.caloriesBurned)
  stats.sleepQualityPercentage = stats.sleepQualityPercentage.plus(proof.sleepQualityPercentage)
  stats.cleanEnergyProduction = stats.cleanEnergyProduction.plus(proof.cleanEnergyProduction)
  stats.wasteItems = stats.wasteItems.plus(proof.wasteItems)
  stats.people = stats.people.plus(proof.people)
  stats.biodiversity = stats.biodiversity.plus(proof.biodiversity)
}

function addImpactToAccount(account: AccountSustainability, proof: SourceSustainabilityProofDocument): void {
  account.carbon = account.carbon.plus(proof.carbon)
  account.water = account.water.plus(proof.water)
  account.energy = account.energy.plus(proof.energy)
  account.wasteMass = account.wasteMass.plus(proof.wasteMass)
  account.plastic = account.plastic.plus(proof.plastic)
  account.timber = account.timber.plus(proof.timber)
  account.educationTime = account.educationTime.plus(proof.educationTime)
  account.treesPlanted = account.treesPlanted.plus(proof.treesPlanted)
  account.caloriesBurned = account.caloriesBurned.plus(proof.caloriesBurned)
  account.sleepQualityPercentage = account.sleepQualityPercentage.plus(proof.sleepQualityPercentage)
  account.cleanEnergyProduction = account.cleanEnergyProduction.plus(proof.cleanEnergyProduction)
  account.wasteItems = account.wasteItems.plus(proof.wasteItems)
  account.people = account.people.plus(proof.people)
  account.biodiversity = account.biodiversity.plus(proof.biodiversity)
}

function addImpactToAccountRound(account: AccountRoundSustainability, proof: SourceSustainabilityProofDocument): void {
  account.carbon = account.carbon.plus(proof.carbon)
  account.water = account.water.plus(proof.water)
  account.energy = account.energy.plus(proof.energy)
  account.wasteMass = account.wasteMass.plus(proof.wasteMass)
  account.plastic = account.plastic.plus(proof.plastic)
  account.timber = account.timber.plus(proof.timber)
  account.educationTime = account.educationTime.plus(proof.educationTime)
  account.treesPlanted = account.treesPlanted.plus(proof.treesPlanted)
  account.caloriesBurned = account.caloriesBurned.plus(proof.caloriesBurned)
  account.sleepQualityPercentage = account.sleepQualityPercentage.plus(proof.sleepQualityPercentage)
  account.cleanEnergyProduction = account.cleanEnergyProduction.plus(proof.cleanEnergyProduction)
  account.wasteItems = account.wasteItems.plus(proof.wasteItems)
  account.people = account.people.plus(proof.people)
  account.biodiversity = account.biodiversity.plus(proof.biodiversity)
}

function hasFieldValue(entity: Entity, field: string): boolean {
  const value = entity.get(field)
  if (value == null) return false
  if (value.kind == ValueKind.NULL) return false
  return true
}

function readBytes(entity: Entity, field: string): Bytes {
  return (entity.get(field) as Value).toBytes()
}

function readString(entity: Entity, field: string): string {
  return (entity.get(field) as Value).toString()
}

function readBigInt(entity: Entity, field: string): BigInt {
  return (entity.get(field) as Value).toBigInt()
}

function readI32(entity: Entity, field: string): i32 {
  return (entity.get(field) as Value).toI32()
}

function readBoolean(entity: Entity, field: string): boolean {
  return (entity.get(field) as Value).toBoolean()
}

function csvToBytes(csv: string): Array<Bytes> {
  if (csv.length == 0) return new Array<Bytes>()
  const parts = csv.split(',')
  const values = new Array<Bytes>()
  for (let i = 0; i < parts.length; i++) {
    values.push(Bytes.fromHexString(parts[i]))
  }
  return values
}

function csvToBigInts(csv: string): Array<BigInt> {
  if (csv.length == 0) return new Array<BigInt>()
  const parts = csv.split(',')
  const values = new Array<BigInt>()
  for (let i = 0; i < parts.length; i++) {
    values.push(BigInt.fromString(parts[i]))
  }
  return values
}

function levelToPoints(level: i32): i32 {
  if (level == 1) return 2
  if (level == 2) return 13
  if (level == 3) return 50
  if (level == 4) return 3
  if (level == 5) return 9
  if (level == 6) return 35
  if (level == 7) return 100
  return 0
}

function isNodeCollection(collection: Bytes): boolean {
  return collection.equals(THOR_NODE_COLLECTION) || collection.equals(STARGATE_COLLECTION)
}

function toDecimal(value: BigInt, decimals: i32): BigDecimal {
  let divisor = BigInt.fromI32(1).toBigDecimal()
  for (let i = 0; i < decimals; i++) {
    divisor = divisor.times(BigInt.fromI32(10).toBigDecimal())
  }
  return value.toBigDecimal().div(divisor)
}

function copyEventFields(target: Entity, source: Entity): void {
  target.set('blockNumber', source.get('blockNumber') as Value)
  target.set('timestamp', source.get('timestamp') as Value)
  target.set('txHash', source.get('txHash') as Value)
  target.set('logIndex', source.get('logIndex') as Value)
  target.set('emitter', source.get('emitter') as Value)
}
