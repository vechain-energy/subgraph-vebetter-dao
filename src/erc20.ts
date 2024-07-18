import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	ERC20Transfer,
	VeDelegateAccount,
} from '../generated/schema'

import {
	Transfer as TransferEvent,
	Approval as ApprovalEvent,
} from '../generated/erc20/IERC20'

import {
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'

import {
	fetchERC20,
	fetchERC20Balance,
	fetchERC20Approval,
} from '../node_modules/@openzeppelin/subgraphs/src/fetch/erc20'
import { fetchStatistic } from './XAllocationVoting'

export function handleTransfer(event: TransferEvent): void {
	let contract = fetchERC20(event.address)
	let ev = new ERC20Transfer(events.id(event))
	ev.emitter = contract.id
	ev.transaction = transactions.log(event).id
	ev.timestamp = event.block.timestamp
	ev.contract = contract.id
	ev.value = decimals.toDecimals(event.params.value, contract.decimals)
	ev.valueExact = event.params.value


	if (event.params.from == Address.zero()) {
		let totalSupply = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.plus(event.params.value)
		totalSupply.value = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()
	} else {
		let from = fetchAccount(event.params.from)
		let balance = fetchERC20Balance(contract, from)
		balance.valueExact = balance.valueExact.minus(event.params.value)
		balance.value = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()


		const veFrom = VeDelegateAccount.load(event.params.from)
		if (veFrom != null) {
			const tvl = fetchStatistic("tvl", "vedelegate")
			if (contract.symbol == 'B3TR') {
				tvl.b3trExact = tvl.b3trExact.minus(event.params.value)
				tvl.b3tr = decimals.toDecimals(tvl.b3trExact, contract.decimals)
			}
			if (contract.symbol == 'VOT3') {
				tvl.vot3Exact = tvl.vot3Exact.minus(event.params.value)
				tvl.vot3 = decimals.toDecimals(tvl.vot3Exact, contract.decimals)
			}
			tvl.save()
		}

		ev.from = from.id
		ev.fromBalance = balance.id
	}

	if (event.params.to == Address.zero()) {
		let totalSupply = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.minus(event.params.value)
		totalSupply.value = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()
	} else {
		let to = fetchAccount(event.params.to)
		let balance = fetchERC20Balance(contract, to)
		balance.valueExact = balance.valueExact.plus(event.params.value)
		balance.value = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

		const veTo = VeDelegateAccount.load(event.params.to)
		if (veTo != null) {
			const tvl = fetchStatistic("tvl", "vedelegate")
			if (contract.symbol == 'B3TR') {
				tvl.b3trExact = tvl.b3trExact.plus(event.params.value)
				tvl.b3tr = decimals.toDecimals(tvl.b3trExact, contract.decimals)
			}
			if (contract.symbol == 'VOT3') {
				tvl.vot3Exact = tvl.vot3Exact.plus(event.params.value)
				tvl.vot3 = decimals.toDecimals(tvl.vot3Exact, contract.decimals)
			}
			tvl.save()
		}

		ev.to = to.id
		ev.toBalance = balance.id
	}
	ev.save()
}

export function handleApproval(event: ApprovalEvent): void {
	let contract = fetchERC20(event.address)

	let owner = fetchAccount(event.params.owner)
	let spender = fetchAccount(event.params.spender)
	let approval = fetchERC20Approval(contract, owner, spender)
	approval.valueExact = event.params.value
	approval.value = decimals.toDecimals(event.params.value, contract.decimals)
	approval.save()
}
