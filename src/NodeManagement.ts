import { NodeDelegation, VeDelegateAccount } from '../generated/schema'
import {
    NodeDelegated as NodeDelegatedEvent,
} from '../generated/NodeManagement/NodeManagement'
import { fetchAccount } from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'
import { transactions } from '@amxx/graphprotocol-utils'
import { store } from '@graphprotocol/graph-ts'
import { fetchNode } from './ThorNode'

export function handleDelegateNode(event: NodeDelegatedEvent): void {
    const id = [event.params.nodeId.toString(), 'delegation', 'node'].join('/').toString()
    let delegation = NodeDelegation.load(id)

    if (!event.params.delegated && !delegation) {
        return
    }
    else if (!event.params.delegated && delegation) {
        store.remove('NodeDelegation', id)
        return
    }
    else if (delegation == null) {
        delegation = new NodeDelegation(id)
    }

    delegation.delegatee = fetchAccount(event.params.delegatee).id
    delegation.active = event.params.delegated

    delegation.emitter = event.address
    delegation.timestamp = event.block.timestamp
    delegation.transaction = transactions.log(event).id
    delegation.node = fetchNode(event.params.nodeId).id

    delegation.save()

    const veAccount = VeDelegateAccount.load(delegation.delegatee)
    if (veAccount) {
        veAccount.nodeDelegation = delegation.id
        veAccount.save()
    }
}
