import { BigInt, Address, } from '@graphprotocol/graph-ts'
import { ThorNode } from '../generated/schema';
import {
    ThorNode as IThorNode,
} from '../generated/ThorNode/ThorNode'
import {
    Transfer as TransferEvent,
    LevelChanged as LevelChangedEvent,
} from '../generated/ThorNode/ThorNode'
import { constants } from '@amxx/graphprotocol-utils'
import { fetchAccount } from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'


export function handleTransfer(event: TransferEvent): void {
    let node = ThorNode.load(event.params._tokenId.toString())
    if (!node) {
        node = new ThorNode(event.params._tokenId.toString())
        node.identifier = event.params._tokenId
        node.level = 0
        node.isX = false

        let thorNode = IThorNode.bind(Address.fromBytes(event.address))
        let try_getMetadata = thorNode.try_getMetadata(node.identifier)
        node.isX = try_getMetadata.reverted ? false : try_getMetadata.value.getValue1() >= 4
        node.level = try_getMetadata.reverted ? false : try_getMetadata.value.getValue1()
    }

    node.owner = fetchAccount(event.params._to).id
    node.save()
}

export function handleLevelChanged(event: LevelChangedEvent): void {
    let node = ThorNode.load(event.params._tokenId.toString())
    if (!node) { return }

    node.level = event.params._toLevel
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
    node.isX = false
    node.owner = constants.ADDRESS_ZERO
    node.save()

    return node
}