import { IVeDelegate, Transfer as TransferEvent } from './IVeDelegate';
import { ERC721Token, VeDelegateAccount } from '../generated/schema';
import { Address } from '@graphprotocol/graph-ts'
import { fetchERC721 } from '../node_modules/@openzeppelin/subgraphs/src/fetch/erc721'
import { fetchAccount } from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'


export function handleTransfer(event: TransferEvent): void {
    if (event.params.from.toHexString() !== "0x0000000000000000000000000000000000000000") { return }

    let contract = fetchERC721(event.address)
    if (contract == null) { return }

    let erc721 = IVeDelegate.bind(Address.fromBytes(event.address))
    let try_getPoolAddress = erc721.try_getPoolAddress(event.params.tokenId)
    if (try_getPoolAddress.reverted) { return }

    let id = contract.id.toHex().concat('/').concat(event.params.tokenId.toHex())
    let token = new ERC721Token(id)
    const account = fetchAccount(try_getPoolAddress.value)

    const tba = new VeDelegateAccount(account.id)
    tba.account = account.id
    tba.save()

    token.poolAddress = account.id;
    token.save()
}


export function fetchVeDelegateAccount(address: Address): VeDelegateAccount {
	let account = new VeDelegateAccount(address)
	account.save()
	return account
}
