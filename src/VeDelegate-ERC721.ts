import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	VeDelegateAccount
} from '../generated/schema'

import {
	Approval as ApprovalEvent,
	ApprovalForAll as ApprovalForAllEvent,
	Transfer as TransferEvent,
} from '../generated/erc721/IERC721'

import {
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'

import {
	fetchERC721,
	fetchERC721Token,
	fetchERC721Operator,
} from '../node_modules/@openzeppelin/subgraphs/src/fetch/erc721'
import { ERC721Token } from '../generated/schema';
import { IVeDelegate } from './IVeDelegate';

export function handleTransfer(event: TransferEvent): void {
	let contract = fetchERC721(event.address)
	if (contract != null) {
		let token = fetchERC721Token(contract, event.params.tokenId)
		let from = fetchAccount(event.params.from)
		let to = fetchAccount(event.params.to)

		token.owner = to.id
		token.approval = fetchAccount(Address.zero()).id // implicit approval reset on transfer

		contract.save()
		token.save()

		const veDelegateToken = new ERC721Token(token.id)
		let erc721 = IVeDelegate.bind(Address.fromBytes(event.address))

		if (!veDelegateToken.poolAddress) {
			let try_getPoolAddress = erc721.try_getPoolAddress(event.params.tokenId)
			if (try_getPoolAddress.reverted) { return }
			veDelegateToken.poolAddress = fetchAccount(try_getPoolAddress.value).id;

			const tba = new VeDelegateAccount(try_getPoolAddress.value)
			tba.account = tba.id
			tba.token = veDelegateToken.id
			tba.save()
		}

		veDelegateToken.save()
	}
}

export function handleApproval(event: ApprovalEvent): void {
	let contract = fetchERC721(event.address)
	if (contract != null) {
		let token = fetchERC721Token(contract, event.params.tokenId)
		let owner = fetchAccount(event.params.owner)
		let approved = fetchAccount(event.params.approved)

		token.owner = owner.id // this should not be necessary, owner changed is signaled by a transfer event
		token.approval = approved.id

		token.save()
		owner.save()
		approved.save()

		// let ev = new Approval(events.id(event))
		// ev.emitter     = contract.id
		// ev.transaction = transactions.log(event).id
		// ev.timestamp   = event.block.timestamp
		// ev.token       = token.id
		// ev.owner       = owner.id
		// ev.approved    = approved.id
		// ev.save()
	}
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
	let contract = fetchERC721(event.address)
	if (contract != null) {
		let owner = fetchAccount(event.params.owner)
		let operator = fetchAccount(event.params.operator)
		let delegation = fetchERC721Operator(contract, owner, operator)

		delegation.approved = event.params.approved

		delegation.save()
	}
}
