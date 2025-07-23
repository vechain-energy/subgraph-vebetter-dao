import { Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import {
  Lock2EarnTerm,
  Lock2EarnTermAdded,
  Lock2EarnTermClosed,
  Lock2EarnTermRenewed,
  Lock2EarnStats,
} from '../generated/schema'
import {
  TermAdded as TermAddedEvent,
  TermClosed as TermClosedEvent,
  TermRenewed as TermRenewedEvent,
  Transfer as TransferEvent,
  Lock2Earn as Lock2EarnContract,
} from '../generated/Lock2Earn/Lock2Earn'
import { fetchAccount } from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'
import { decimals } from '@amxx/graphprotocol-utils'
import { VeDelegate as VeDelegateContract } from '../generated/veDelegate/VeDelegate'

const VE_DELEGATE_CONTRACT_ADDRESS = Address.fromString('0xfc32a9895C78CE00A1047d602Bd81Ea8134CC32b')

function fetchLock2EarnStats(): Lock2EarnStats {
  let stats = Lock2EarnStats.load('global')
  if (stats == null) {
    stats = new Lock2EarnStats('global')
    stats.totalAmount = BigDecimal.zero()
    stats.totalAmountExact = BigInt.fromI32(0)
    stats.activeAmount = BigDecimal.zero()
    stats.activeAmountExact = BigInt.fromI32(0)
    stats.closedAmount = BigDecimal.zero()
    stats.closedAmountExact = BigInt.fromI32(0)
    stats.termCount = BigInt.fromI32(0)
    stats.activeTermCount = BigInt.fromI32(0)
    stats.closedTermCount = BigInt.fromI32(0)
    stats.totalRewards = BigDecimal.zero()
    stats.totalRewardsExact = BigInt.fromI32(0)
  }
  return stats as Lock2EarnStats
}

/**
 * Handler for TermAdded event. Creates a new Lock2EarnTerm entity, calculates endTime, and assigns ownership.
 */
export function handleTermAdded(event: TermAddedEvent): void {
  let contract = Lock2EarnContract.bind(event.address)
  let optionId = event.params.optionId
  let tokenId = event.params.tokenId
  let owner = fetchAccount(event.params.owner)
  let amountExact = event.params.amount
  let amount = decimals.toDecimals(amountExact, 18)

  // Fetch option metadata for termLength
  let optionResult = contract.try_getOption(optionId)
  if (optionResult.reverted) {
    return
  }
  let termLength = optionResult.value.timeLength

  // Fetch termInterval from contract
  let intervalResult = contract.try_termInterval()
  if (intervalResult.reverted) {
    return
  }
  let termInterval = intervalResult.value

  // Fetch startTime and veDelegatePoolTokenId from token metadata
  let metaResult = contract.try_getTokenMetadata(tokenId)
  if (metaResult.reverted) {
    return
  }
  let startTime = metaResult.value.startTime
  let veDelegatePoolTokenId = metaResult.value.veDelegatePoolTokenId

  // Get pool address from veDelegate contract
  let veDelegateContract = VeDelegateContract.bind(VE_DELEGATE_CONTRACT_ADDRESS)
  let poolAddressResult = veDelegateContract.try_getPoolAddress(veDelegatePoolTokenId)

  let endTime = startTime.plus(termLength.times(termInterval))

  let term = new Lock2EarnTerm(tokenId.toString())
  term.tokenId = tokenId
  term.owner = owner.id
  term.startTime = startTime
  term.termLength = termLength
  term.termInterval = termInterval
  term.endTime = endTime
  term.closed = false
  term.amount = amount
  term.amountExact = amountExact
  term.rewards = BigDecimal.zero()
  term.rewardsExact = BigInt.fromI32(0)
  if (!poolAddressResult.reverted) {
    let veDelegatePoolAccount = fetchAccount(poolAddressResult.value)
    term.veDelegatePool = veDelegatePoolAccount.id
  }
  term.createdAt = event.block.timestamp
  term.updatedAt = event.block.timestamp
  term.save()

  // Update stats
  let stats = fetchLock2EarnStats()
  stats.totalAmount = stats.totalAmount.plus(amount)
  stats.totalAmountExact = stats.totalAmountExact.plus(amountExact)
  stats.activeAmount = stats.activeAmount.plus(amount)
  stats.activeAmountExact = stats.activeAmountExact.plus(amountExact)
  stats.termCount = stats.termCount.plus(BigInt.fromI32(1))
  stats.activeTermCount = stats.activeTermCount.plus(BigInt.fromI32(1))
  stats.save()

  // Store event entity for analytics
  let evt = new Lock2EarnTermAdded(event.transaction.hash.toHex() + '-' + event.logIndex.toString())
  evt.term = term.id
  evt.owner = owner.id
  evt.startTime = startTime
  evt.termLength = termLength
  evt.termInterval = termInterval
  evt.endTime = endTime
  evt.transaction = event.transaction.hash.toHex()
  evt.emitter = event.address
  evt.timestamp = event.block.timestamp
  evt.save()
}

/**
 * Handler for TermClosed event. Marks the Lock2EarnTerm as closed.
 */
export function handleTermClosed(event: TermClosedEvent): void {
  let tokenId = event.params.tokenId
  let term = Lock2EarnTerm.load(tokenId.toString())
  if (term == null) {
    return
  }
  term.closed = true
  term.updatedAt = event.block.timestamp
  term.save()

  // Update stats
  let stats = fetchLock2EarnStats()
  stats.activeAmount = stats.activeAmount.minus(term.amount)
  stats.activeAmountExact = stats.activeAmountExact.minus(term.amountExact)
  stats.closedAmount = stats.closedAmount.plus(term.amount)
  stats.closedAmountExact = stats.closedAmountExact.plus(term.amountExact)
  stats.activeTermCount = stats.activeTermCount.minus(BigInt.fromI32(1))
  stats.closedTermCount = stats.closedTermCount.plus(BigInt.fromI32(1))
  stats.save()

  let evt = new Lock2EarnTermClosed(event.transaction.hash.toHex() + '-' + event.logIndex.toString())
  evt.term = term.id
  evt.owner = fetchAccount(event.params.owner).id
  evt.transaction = event.transaction.hash.toHex()
  evt.emitter = event.address
  evt.timestamp = event.block.timestamp
  evt.save()
}

/**
 * Handler for TermRenewed event. Updates endTime and metadata for the Lock2EarnTerm.
 */
export function handleTermRenewed(event: TermRenewedEvent): void {
  let contract = Lock2EarnContract.bind(event.address)
  let tokenId = event.params.tokenId
  let owner = fetchAccount(event.params.owner)
  let optionId = event.params.optionId
  let amountExact = event.params.amount
  let amount = decimals.toDecimals(amountExact, 18)

  // Fetch option metadata for termLength
  let optionResult = contract.try_getOption(optionId)
  if (optionResult.reverted) {
    return
  }
  let termLength = optionResult.value.timeLength

  // Fetch termInterval from contract
  let intervalResult = contract.try_termInterval()
  if (intervalResult.reverted) {
    return
  }
  let termInterval = intervalResult.value

  // Fetch startTime and veDelegatePoolTokenId from token metadata
  let metaResult = contract.try_getTokenMetadata(tokenId)
  if (metaResult.reverted) {
    return
  }
  let startTime = metaResult.value.startTime
  let veDelegatePoolTokenId = metaResult.value.veDelegatePoolTokenId

  // Get pool address from veDelegate contract
  let veDelegateContract = VeDelegateContract.bind(VE_DELEGATE_CONTRACT_ADDRESS)
  let poolAddressResult = veDelegateContract.try_getPoolAddress(veDelegatePoolTokenId)

  let endTime = startTime.plus(termLength.times(termInterval))

  let term = Lock2EarnTerm.load(tokenId.toString())
  let stats = fetchLock2EarnStats()
  let oldAmount = term != null ? term.amount : BigDecimal.zero()
  let oldAmountExact = term != null ? term.amountExact : BigInt.fromI32(0)
  let wasClosed = term != null ? term.closed : false
  if (term == null) {
    term = new Lock2EarnTerm(tokenId.toString())
    term.tokenId = tokenId
    term.createdAt = event.block.timestamp
    term.rewards = BigDecimal.zero()
    term.rewardsExact = BigInt.fromI32(0)
  }
  term.owner = owner.id
  term.startTime = startTime
  term.termLength = termLength
  term.termInterval = termInterval
  term.endTime = endTime
  term.amount = amount
  term.amountExact = amountExact
  if (!poolAddressResult.reverted) {
    let veDelegatePoolAccount = fetchAccount(poolAddressResult.value)
    term.veDelegatePool = veDelegatePoolAccount.id
  }
  term.closed = false
  term.updatedAt = event.block.timestamp
  term.save()

  // Update stats if amount changed or was closed
  if (!oldAmountExact.equals(amountExact) || wasClosed) {
    if (wasClosed) {
      stats.closedAmount = stats.closedAmount.minus(oldAmount)
      stats.closedAmountExact = stats.closedAmountExact.minus(oldAmountExact)
      stats.closedTermCount = stats.closedTermCount.minus(BigInt.fromI32(1))
      stats.activeAmount = stats.activeAmount.plus(amount)
      stats.activeAmountExact = stats.activeAmountExact.plus(amountExact)
      stats.activeTermCount = stats.activeTermCount.plus(BigInt.fromI32(1))
    } else {
      stats.activeAmount = stats.activeAmount.minus(oldAmount).plus(amount)
      stats.activeAmountExact = stats.activeAmountExact.minus(oldAmountExact).plus(amountExact)
    }
    stats.save()
  }

  // Always reset rewards on renewal
  term.rewards = BigDecimal.zero()
  term.rewardsExact = BigInt.fromI32(0)

  let evt = new Lock2EarnTermRenewed(event.transaction.hash.toHex() + '-' + event.logIndex.toString())
  evt.term = term.id
  evt.owner = owner.id
  evt.newEndTime = endTime
  evt.transaction = event.transaction.hash.toHex()
  evt.emitter = event.address
  evt.timestamp = event.block.timestamp
  evt.save()
}

/**
 * Handler for Transfer event. Updates the owner of the Lock2EarnTerm NFT.
 */
export function handleTransfer(event: TransferEvent): void {
  let tokenId = event.params.tokenId
  let to = fetchAccount(event.params.to)
  let term = Lock2EarnTerm.load(tokenId.toString())
  if (term != null) {
    term.owner = to.id
    term.updatedAt = event.block.timestamp
    term.save()
  }
}

/**
 * Documentation:
 * - Each Lock2EarnTerm entity tracks both amount (BigDecimal, normalized) and amountExact (BigInt, raw).
 * - Lock2EarnStats (id: "global") aggregates both normalized and raw sums for total, active, and closed amounts.
 * - All normalized fields are divided by 1e18 for display and analytics.
 */
