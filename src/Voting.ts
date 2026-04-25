import {
  DelegateChanged,
} from '../generated/schema'

import {
  DelegateChanged as DelegateChangedEvent,
  DelegateVotesChanged as DelegateVotesChangedEvent,
} from '../generated/voting/Voting'

import {
  fetchDelegation,
  fetchVoting,
  fetchWeight,
} from '../node_modules/@openzeppelin/subgraphs/src/fetch/voting'

import { ensureTransaction, eventEntityId } from './ids'
import { fetchAccount } from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'

export function handleDelegateChanged(event: DelegateChangedEvent): void {
  const delegator = fetchAccount(event.params.delegator)
  const fromDelegate = fetchAccount(event.params.fromDelegate)
  const toDelegate = fetchAccount(event.params.toDelegate)
  const contract = fetchVoting(event.address)
  const delegation = fetchDelegation(contract, delegator)

  delegation.delegatee = toDelegate.id
  delegation.save()

  const delegateChanged = new DelegateChanged(eventEntityId(event))
  delegateChanged.emitter = contract.id
  delegateChanged.transaction = ensureTransaction(event).id
  delegateChanged.timestamp = event.block.timestamp
  delegateChanged.delegation = delegation.id
  delegateChanged.contract = contract.id
  delegateChanged.delegator = delegator.id
  delegateChanged.fromDelegate = fromDelegate.id
  delegateChanged.toDelegate = toDelegate.id
  delegateChanged.save()
}

export function handleDelegateVotesChanged(event: DelegateVotesChangedEvent): void {
  const delegate = fetchAccount(event.params.delegate)
  const contract = fetchVoting(event.address)
  const total = fetchWeight(contract, null)
  const weight = fetchWeight(contract, delegate)

  total.value = total.value.minus(event.params.previousBalance).plus(event.params.newBalance)
  weight.value = event.params.newBalance

  total.save()
  weight.save()
}
