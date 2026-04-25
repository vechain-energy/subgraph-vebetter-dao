import { ByteArray, Bytes, crypto, ethereum } from '@graphprotocol/graph-ts'

import { Transaction } from '../generated/schema'

export function eventEntityId(event: ethereum.Event): string {
  return event.block.number.toString().concat('-').concat(event.logIndex.toString())
}

export function eventBytesId(event: ethereum.Event): Bytes {
  return event.transaction.hash.concatI32(event.logIndex.toI32())
}

export function ensureTransaction(event: ethereum.Event): Transaction {
  const id = event.transaction.hash
  let transaction = Transaction.load(id)

  if (transaction == null) {
    transaction = new Transaction(id)
    transaction.timestamp = event.block.timestamp
    transaction.blockNumber = event.block.number
    transaction.save()
  }

  return transaction
}

export function appRoundSummaryId(app: Bytes, roundId: string): Bytes {
  return hashCompositeId('app-round-summary', app.toHexString(), roundId)
}

export function sustainabilityStatsId(app: Bytes, roundId: string): Bytes {
  return hashCompositeId('sustainability-stats', app.toHexString(), roundId)
}

export function accountSustainabilityId(account: Bytes, app: Bytes): Bytes {
  return hashCompositeId('account-sustainability', account.toHexString(), app.toHexString())
}

export function accountRoundSustainabilityId(account: Bytes, app: Bytes, roundId: string): Bytes {
  return hashCompositeId('account-round-sustainability', account.toHexString(), app.toHexString(), roundId)
}

export function erc20BalanceId(contract: Bytes, account: Bytes): Bytes {
  return hashCompositeId('erc20-balance', contract.toHexString(), account.toHexString())
}

export function erc20TotalSupplyId(contract: Bytes): Bytes {
  return hashCompositeId('erc20-balance', contract.toHexString(), 'totalSupply')
}

export function erc20ApprovalId(contract: Bytes, owner: Bytes, spender: Bytes): Bytes {
  return hashCompositeId('erc20-approval', contract.toHexString(), owner.toHexString(), spender.toHexString())
}

export function vbdBalanceId(account: Bytes): Bytes {
  return hashCompositeId('vbd-balance', account.toHexString())
}

export function vbdTotalSupplyId(): Bytes {
  return hashCompositeId('vbd-balance', 'totalSupply')
}

export function hashCompositeId(prefix: string, partA: string, partB: string = '', partC: string = ''): Bytes {
  let key = prefix
  key = key.concat('/').concat(partA)

  if (partB.length > 0) {
    key = key.concat('/').concat(partB)
  }

  if (partC.length > 0) {
    key = key.concat('/').concat(partC)
  }

  return Bytes.fromByteArray(crypto.keccak256(ByteArray.fromUTF8(key)))
}
