import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	VBDBalance,
	ERC20Transfer,
	VeDelegateAccount,
	VeDelegateTransfer
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
	Account as OZAccount,
} from '../node_modules/@openzeppelin/subgraphs/generated/schema'

import {
	fetchERC20,
	fetchERC20Balance,
	fetchERC20Approval,
} from '../node_modules/@openzeppelin/subgraphs/src/fetch/erc20'
import { fetchStatistic } from './XAllocationVoting'
import { constants } from '@amxx/graphprotocol-utils'

export function handleTransfer(event: TransferEvent): void {
	let contract = fetchERC20(event.address)
	let ev = new ERC20Transfer(events.id(event))
	ev.emitter = contract.id
	ev.transaction = transactions.log(event).id
	ev.timestamp = event.block.timestamp
	ev.contract = contract.id
	ev.value = decimals.toDecimals(event.params.value, contract.decimals)
	ev.valueExact = event.params.value

	// Convert B3TR between VOT3
	if (
		(event.params.from == Address.zero() && contract.symbol == 'VOT3')
		||
		(contract.symbol == 'B3TR' && event.params.from == Address.fromString('0x76Ca782B59C74d088C7D2Cce2f211BC00836c602'))
	) {
		const vbdBalance = fetchVBDBalance(fetchAccount(event.params.to))
		vbdBalance.convertedB3trExact = contract.symbol == 'VOT3'
			// Convert B3TR to VOT3 (mint VOT3)
			? vbdBalance.convertedB3trExact.plus(event.params.value)
			// Convert VOT3 to B3TR (B3TR is sent from VOT3 contract)
			: vbdBalance.convertedB3trExact.minus(event.params.value)

		vbdBalance.convertedB3tr = decimals.toDecimals(vbdBalance.convertedB3trExact, contract.decimals)
		vbdBalance.save()
	}

	let isVeDelegateTransferReceiver = false
	let isVeDelegateTransferSender = false
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

		const vbdBalance = fetchVBDBalance(from)
		vbdBalance.valueExact = vbdBalance.valueExact.minus(event.params.value)
		vbdBalance.value = decimals.toDecimals(vbdBalance.valueExact, contract.decimals)

		if (contract.symbol == 'VOT3') {
			vbdBalance.qfWeight = balance.valueExact.sqrt()
		}

		vbdBalance.save()

		const veFrom = VeDelegateAccount.load(event.params.from)
		if (veFrom != null) {
			isVeDelegateTransferSender = true
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


		const vbdBalance = fetchVBDBalance(null)
		vbdBalance.valueExact = vbdBalance.valueExact.minus(event.params.value)
		vbdBalance.value = decimals.toDecimals(vbdBalance.valueExact, contract.decimals)
		vbdBalance.save()
	} else {
		let to = fetchAccount(event.params.to)
		let balance = fetchERC20Balance(contract, to)
		balance.valueExact = balance.valueExact.plus(event.params.value)
		balance.value = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()


		const vbdBalance = fetchVBDBalance(to)
		vbdBalance.valueExact = vbdBalance.valueExact.plus(event.params.value)
		vbdBalance.value = decimals.toDecimals(vbdBalance.valueExact, contract.decimals)

		if (contract.symbol == 'VOT3') {
			vbdBalance.qfWeight = balance.valueExact.sqrt()
		}
		vbdBalance.save()

		const veTo = VeDelegateAccount.load(event.params.to)
		if (veTo != null) {
			isVeDelegateTransferReceiver = true
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

	if (isVeDelegateTransferReceiver || isVeDelegateTransferSender) {
		cloneErc20ToVeDelegateTransfer(ev, isVeDelegateTransferReceiver)
	}
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


function cloneErc20ToVeDelegateTransfer(transfer: ERC20Transfer, isDeposit: boolean): void {
	const vdTransfer = new VeDelegateTransfer(`${transfer.id}-vd`)
	vdTransfer.isDeposit = isDeposit
	vdTransfer.emitter = transfer.emitter
	vdTransfer.transaction = transfer.transaction
	vdTransfer.timestamp = transfer.timestamp
	vdTransfer.contract = transfer.contract
	vdTransfer.from = transfer.from
	vdTransfer.fromBalance = transfer.fromBalance
	vdTransfer.to = transfer.to
	vdTransfer.toBalance = transfer.toBalance
	vdTransfer.value = transfer.value
	vdTransfer.valueExact = transfer.valueExact
	vdTransfer.save()
}




function fetchVBDBalance(account: OZAccount | null): VBDBalance {
	let id = account ? account.id.toHex() : 'totalSupply'
	let balance = VBDBalance.load(id)

	if (balance == null) {
		balance = new VBDBalance(id)
		balance.account = account ? account.id : null
		balance.value = constants.BIGDECIMAL_ZERO
		balance.valueExact = constants.BIGINT_ZERO
		balance.convertedB3tr = constants.BIGDECIMAL_ZERO
		balance.convertedB3trExact = constants.BIGINT_ZERO
		balance.qfWeight = constants.BIGINT_ZERO
		balance.save()
	}

	return balance
}