import { NodeDelegation, VeDelegateAccount } from '../generated/schema'
import {
    NodeDelegated as NodeDelegatedEvent,
} from '../generated/NodeManagement/NodeManagement'
import { fetchAccount } from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'
import { transactions } from '@amxx/graphprotocol-utils'
import { store } from '@graphprotocol/graph-ts'
import { fetchNode } from './ThorNode'
import { fetchStatsEndorsements } from './XApps'

export function handleDelegateNode(event: NodeDelegatedEvent): void {
    const id = [event.params.nodeId.toString(), 'delegation', 'node'].join('/').toString()
    let delegation = NodeDelegation.load(id)
    const node = fetchNode(event.params.nodeId)

    // update stats for previous delegatee
    if (delegation) {
        const veAccountFrom = VeDelegateAccount.load(delegation.delegatee)
        if (veAccountFrom) {
            veAccountFrom.nodeDelegation = null
            veAccountFrom.save()
        }
    }


    // create new entity
    if (!delegation) {
        delegation = new NodeDelegation(id)
    }


    delegation.delegatee = fetchAccount(event.params.delegatee).id
    delegation.active = event.params.delegated

    delegation.emitter = event.address
    delegation.timestamp = event.block.timestamp
    delegation.transaction = transactions.log(event).id
    delegation.node = node.id

    delegation.save()

    const stats = fetchStatsEndorsements('all')
    stats.delegatedPoints += levelToPoints(node.level) * (delegation.active ? 1 : -1)
    stats.save()

    const veAccountTo = VeDelegateAccount.load(delegation.delegatee)
    if (veAccountTo) {
        const stats = fetchStatsEndorsements('veDelegate')
        stats.delegatedPoints += levelToPoints(node.level) * (delegation.active ? 1 : -1)
        stats.save()

        veAccountTo.nodeDelegation = delegation.id
        veAccountTo.save()
    }
}


export function levelToPoints(level: i32): i32 {

    if (level === 0) { // None
        return 0
    }
    else if (level === 1) { // Strength
        return 2
    }
    else if (level === 2) { // Thunder
        return 13
    }
    else if (level === 3) { // Mjolnir
        return 50
    }
    else if (level === 4) { // VeThorX
        return 3
    }
    else if (level === 5) { // StrengthX
        return 9
    }
    else if (level === 6) { // ThunderX
        return 35
    }
    else if (level === 7) { // MjolnirX
        return 100
    }
    else {
        return 0
    }
}