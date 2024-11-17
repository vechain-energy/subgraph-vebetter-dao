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

    if (!event.params.delegated && !delegation) {
        return
    }
    else if (!event.params.delegated && delegation) {
        const veAccount = VeDelegateAccount.load(delegation.delegatee)

        const stats = fetchStatsEndorsements('all')
        stats.delegatedPoints -= levelToPoints(node.level)
        stats.save()

        if (veAccount) {
            const veDelegateStats = fetchStatsEndorsements('veDelegate')
            veDelegateStats.delegatedPoints -= levelToPoints(node.level)
            veDelegateStats.save()
        }

        store.remove('NodeDelegation', id)
        return
    }
    else if (delegation == null) {
        delegation = new NodeDelegation(id)

        const stats = fetchStatsEndorsements('all')
        stats.delegatedPoints += levelToPoints(node.level)
        stats.save()

        const veAccount = VeDelegateAccount.load(event.params.delegatee)
        if (veAccount) {
            const stats = fetchStatsEndorsements('veDelegate')
            stats.delegatedPoints += levelToPoints(node.level)
            stats.save()
        }
    }

    delegation.delegatee = fetchAccount(event.params.delegatee).id
    delegation.active = event.params.delegated

    delegation.emitter = event.address
    delegation.timestamp = event.block.timestamp
    delegation.transaction = transactions.log(event).id
    delegation.node = node.id

    delegation.save()

    const stats = fetchStatsEndorsements('all')
    stats.delegatedPoints += levelToPoints(node.level)
    stats.save()

    const veAccount = VeDelegateAccount.load(delegation.delegatee)
    if (veAccount) {
        veAccount.nodeDelegation = delegation.id
        veAccount.save()
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