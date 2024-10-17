import { PassportDelegation } from '../generated/schema'
import {
    DelegationCreated as DelegationCreatedEvent,
    DelegationRevoked as DelegationRevokedEvent,
} from '../generated/passport/Passport'
import { fetchAccount } from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'
import { transactions } from '@amxx/graphprotocol-utils'
import { store } from '@graphprotocol/graph-ts'


export function handleDelegationCreated(event: DelegationCreatedEvent): void {
    const id = [event.params.delegator, event.params.delegatee].join('/')
    let passport = PassportDelegation.load(id)
    if (passport == null) {
        passport = new PassportDelegation(id)
    }

    passport.delegatee = fetchAccount(event.params.delegatee).id
    passport.delegator = fetchAccount(event.params.delegator).id

    passport.emitter = event.address
    passport.timestamp = event.block.timestamp
    passport.transaction = transactions.log(event).id

    passport.save()
}

export function handleDelegationRevoked(event: DelegationRevokedEvent): void {
    const id = [event.params.delegator, event.params.delegatee].join('/')
    store.remove('PassportDelegation', id)
}