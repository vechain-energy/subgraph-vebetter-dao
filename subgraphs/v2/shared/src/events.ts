import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'

export function eventId(event: ethereum.Event): Bytes {
  return event.transaction.hash.concatI32(event.logIndex.toI32())
}

export function txHash(event: ethereum.Event): Bytes {
  return event.transaction.hash
}

export function logIndex(event: ethereum.Event): BigInt {
  return event.logIndex
}

export function blockNumber(event: ethereum.Event): BigInt {
  return event.block.number
}

export function timestamp(event: ethereum.Event): BigInt {
  return event.block.timestamp
}

export function timeseriesId(event: ethereum.Event, offset: i32 = 0): i64 {
  return event.block.number.toI64() * 1000000000
    + event.transaction.index.toI64() * 100000
    + event.logIndex.toI64() * 100
    + offset
}
