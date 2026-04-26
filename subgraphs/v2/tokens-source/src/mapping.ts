import { Entity, Value, ethereum } from '@graphprotocol/graph-ts'
import {
  Approval as ApprovalEvent,
  Transfer as TransferEvent,
} from '../generated/b3tr/IERC20'
import { TokenApproval, TokenTransfer } from '../generated/schema'
import { eventId } from '../../shared/src/events'

export function handleTransfer(event: TransferEvent): void {
  const entity = new TokenTransfer(eventId(event))
  entity.token = event.address
  entity.from = event.params.from
  entity.to = event.params.to
  entity.amountExact = event.params.value
  setEventFields(entity, event)
  entity.save()
}

export function handleApproval(event: ApprovalEvent): void {
  const entity = new TokenApproval(eventId(event))
  entity.token = event.address
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.amountExact = event.params.value
  setEventFields(entity, event)
  entity.save()
}

function setEventFields(entity: Entity, event: ethereum.Event): void {
  entity.set('blockNumber', Value.fromBigInt(event.block.number))
  entity.set('timestamp', Value.fromBigInt(event.block.timestamp))
  entity.set('txHash', Value.fromBytes(event.transaction.hash))
  entity.set('logIndex', Value.fromBigInt(event.logIndex))
  entity.set('emitter', Value.fromBytes(event.address))
}
