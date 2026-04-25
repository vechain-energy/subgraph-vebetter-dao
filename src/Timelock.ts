import {
  TimelockMinDelayChange,
  TimelockOperationCancelled,
  TimelockOperationExecuted,
  TimelockOperationScheduled,
} from '../generated/schema'

import {
  CallExecuted as CallExecutedEvent,
  CallScheduled as CallScheduledEvent,
  Cancelled as CancelledEvent,
  MinDelayChange as MinDelayChangeEvent,
} from '../generated/timelock/Timelock'

import { decimals } from '@amxx/graphprotocol-utils'

import { fetchAccount } from './account'
import { ensureTransaction, eventEntityId } from './ids'
import {
  fetchTimelock,
  fetchTimelockCall,
  fetchTimelockOperation,
} from '../node_modules/@openzeppelin/subgraphs/src/fetch/timelock'

export function handleCallScheduled(event: CallScheduledEvent): void {
  const contract = fetchTimelock(event.address)
  const operation = fetchTimelockOperation(contract, event.params.id)
  const call = fetchTimelockCall(operation, event.params.index)
  const target = fetchAccount(event.params.target)

  operation.status = 'SCHEDULED'
  operation.delay = event.params.delay
  operation.timestamp = event.block.timestamp.plus(event.params.delay)
  operation.predecessor = event.params.predecessor ? event.params.predecessor.toHex() : null
  operation.save()

  call.operation = operation.id
  call.index = event.params.index
  call.target = target.id
  call.value = decimals.toDecimals(event.params.value)
  call.data = event.params.data
  call.save()

  const scheduled = new TimelockOperationScheduled(eventEntityId(event))
  scheduled.emitter = contract.id
  scheduled.transaction = ensureTransaction(event).id
  scheduled.timestamp = event.block.timestamp
  scheduled.contract = contract.id
  scheduled.operation = operation.id
  scheduled.call = call.id
  scheduled.save()
}

export function handleCallExecuted(event: CallExecutedEvent): void {
  const contract = fetchTimelock(event.address)
  const operation = fetchTimelockOperation(contract, event.params.id)
  const call = fetchTimelockCall(operation, event.params.index)

  operation.status = 'EXECUTED'
  operation.save()

  const executed = new TimelockOperationExecuted(eventEntityId(event))
  executed.emitter = contract.id
  executed.transaction = ensureTransaction(event).id
  executed.timestamp = event.block.timestamp
  executed.contract = contract.id
  executed.operation = operation.id
  executed.call = call.id
  executed.save()
}

export function handleCancelled(event: CancelledEvent): void {
  const contract = fetchTimelock(event.address)
  const operation = fetchTimelockOperation(contract, event.params.id)

  operation.status = 'CANCELED'
  operation.save()

  const cancelled = new TimelockOperationCancelled(eventEntityId(event))
  cancelled.emitter = contract.id
  cancelled.transaction = ensureTransaction(event).id
  cancelled.timestamp = event.block.timestamp
  cancelled.contract = contract.id
  cancelled.operation = operation.id
  cancelled.save()
}

export function handleMinDelayChange(event: MinDelayChangeEvent): void {
  const contract = fetchTimelock(event.address)

  const minDelayChange = new TimelockMinDelayChange(eventEntityId(event))
  minDelayChange.emitter = contract.id
  minDelayChange.transaction = ensureTransaction(event).id
  minDelayChange.timestamp = event.block.timestamp
  minDelayChange.contract = contract.id
  minDelayChange.delay = event.params.newDuration
  minDelayChange.save()
}
