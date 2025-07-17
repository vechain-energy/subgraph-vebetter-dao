import { BigInt, Address, } from '@graphprotocol/graph-ts'
import { ThorNode, StatsEndorsement, NodeDelegation, VeDelegateAccount } from '../generated/schema';
import {
    ThorNode as IThorNode,
} from '../generated/ThorNode/ThorNode'
import {
    Stargate as IStargate,
} from '../generated/Stargate/Stargate'
import {
    Transfer as TransferEvent,
    LevelChanged as LevelChangedEvent,
} from '../generated/ThorNode/ThorNode'
import { constants } from '@amxx/graphprotocol-utils'
import { fetchAccount } from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'
import { fetchStatsEndorsements } from './XApps';
import { levelToPoints } from './NodeManagement';


export function handleTransfer(event: TransferEvent): void {
    const node = fetchNode(event.params._tokenId)

    // Legacy ThorNodes
    if (!node.level && Address.fromBytes(event.address) == Address.fromString("0xb81E9C5f9644Dec9e5e3Cac86b4461A222072302")) {
        let thorNode = IThorNode.bind(Address.fromBytes(event.address))
        let try_getMetadata = thorNode.try_getMetadata(node.identifier)
        node.isX = try_getMetadata.reverted ? false : try_getMetadata.value.getValue1() >= 4
        node.level = try_getMetadata.reverted ? false : try_getMetadata.value.getValue1()
        node.points = levelToPoints(node.level)

        const stats = fetchStatsEndorsements('all')
        stats.nodeCount += 1
        stats.points += levelToPoints(node.level)
        stats.save()
    }

    // Stargate Nodes
    if (!node.level && Address.fromBytes(event.address) == Address.fromString("0x1856C533aC2D94340aAa8544D35a5c1d4A21DeE7")) {
        let stargate = IStargate.bind(Address.fromBytes(event.address))
        let try_isXToken = stargate.try_isXToken(node.identifier)
        node.isX = try_isXToken.reverted ? false : try_isXToken.value

        let try_getTokenLevel = stargate.try_getTokenLevel(node.identifier)
        node.level = try_getTokenLevel.reverted ? false : try_getTokenLevel.value
        node.points = levelToPoints(node.level)

        const stats = fetchStatsEndorsements('all')
        stats.nodeCount += 1
        stats.points += levelToPoints(node.level)
        stats.save()
    }
    node.owner = fetchAccount(event.params._to).id

    if (event.params._to === constants.ADDRESS_ZERO) {
        // track total endorsement points & node count
        if (node.appEndorsement) {
            const stats = fetchStatsEndorsements('all')
            stats.nodeCount -= 1
            stats.points -= levelToPoints(node.level)

            if (node.delegation) {
                stats.delegatedPoints -= levelToPoints(node.level)

                const delegation = NodeDelegation.load(node.delegation._id)
                if (delegation) {
                    const veAccount = VeDelegateAccount.load(delegation.delegatee)
                    if (veAccount) {
                        const veDelegateStats = fetchStatsEndorsements('veDelegate')
                        veDelegateStats.nodeCount -= 1
                        veDelegateStats.points -= levelToPoints(node.level)
                        veDelegateStats.delegatedPoints -= levelToPoints(node.level)
                        veDelegateStats.save()
                    }
                }
            }

            stats.save()
        }

        node.isX = false
        node.level = 0
    }

    node.save()
}

export function handleLevelChanged(event: LevelChangedEvent): void {
    let node = ThorNode.load(event.params._tokenId.toString())
    if (!node) { return }

    // track total endorsement points & node count
    if (node.appEndorsement) {
        const stats = fetchStatsEndorsements('all')
        stats.points += levelToPoints(event.params._toLevel) - levelToPoints(event.params._fromLevel)
        stats.save()

        if (node.delegation) {
            stats.delegatedPoints += levelToPoints(event.params._toLevel) - levelToPoints(event.params._fromLevel)

            const delegation = NodeDelegation.load(node.delegation._id)
            if (delegation) {
                const veAccount = VeDelegateAccount.load(delegation.delegatee)
                if (veAccount) {
                    const veDelegateStats = fetchStatsEndorsements('veDelegate')
                    veDelegateStats.points += levelToPoints(event.params._toLevel) - levelToPoints(event.params._fromLevel)
                    veDelegateStats.delegatedPoints += levelToPoints(event.params._toLevel) - levelToPoints(event.params._fromLevel)
                    veDelegateStats.save()
                }
            }
        }
    }

    node.level = event.params._toLevel
    node.points = levelToPoints(node.level)
    node.save()
}

export function fetchNode(id: BigInt): ThorNode {
    let node = ThorNode.load(id.toString())
    if (node) {
        return node
    }

    node = new ThorNode(id.toString())
    node.identifier = id
    node.level = 0
    node.points = 0
    node.isX = false
    node.owner = constants.ADDRESS_ZERO
    node.save()

    return node
}