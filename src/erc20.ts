import { Address, store } from '@graphprotocol/graph-ts'

import {
	Account,
	ERC20Approval,
	ERC20Balance,
	VBDBalance,
	VeDelegateAccount,
} from '../generated/schema'

import {
	Transfer as TransferEvent,
	Approval as ApprovalEvent,
} from '../generated/erc20/IERC20'

import {
	decimals,
} from '@amxx/graphprotocol-utils'

import { fetchStatistic } from './XAllocationVoting'
import { constants } from '@amxx/graphprotocol-utils'
import { fetchAccount } from './account'
import { fetchERC20, fetchERC20Approval, fetchERC20Balance, fetchERC20TotalSupply } from './fetch/erc20'
import { vbdBalanceId, vbdTotalSupplyId } from './ids'

const VOT3_CONTRACT = Address.fromString('0x76Ca782B59C74d088C7D2Cce2f211BC00836c602')

export function handleTransfer(event: TransferEvent): void {
	let contract = fetchERC20(event.address)
	let symbol = contract.symbol
	if (symbol == null) {
		symbol = ''
	}

	let isVot3 = symbol == 'VOT3'
	let isB3tr = symbol == 'B3TR'
	let isB3trConversion = false
	let isMintToVot3 = false

	if (event.params.from.equals(Address.zero())) {
		if (isVot3) {
			isMintToVot3 = true
		}
	}

	if (isB3tr) {
		if (event.params.from.equals(VOT3_CONTRACT)) {
			isB3trConversion = true
		}
	}

	// Convert B3TR between VOT3
	if (isMintToVot3) {
		const vbdBalance = fetchVBDBalance(fetchAccount(event.params.to))
		vbdBalance.convertedB3trExact = vbdBalance.convertedB3trExact.plus(event.params.value)

		vbdBalance.convertedB3tr = decimals.toDecimals(vbdBalance.convertedB3trExact, contract.decimals)
		saveOrRemoveAccountVBDBalance(vbdBalance)
	} else if (isB3trConversion) {
		const vbdBalance = fetchVBDBalance(fetchAccount(event.params.to))
		vbdBalance.convertedB3trExact = vbdBalance.convertedB3trExact.minus(event.params.value)

		vbdBalance.convertedB3tr = decimals.toDecimals(vbdBalance.convertedB3trExact, contract.decimals)
		saveOrRemoveAccountVBDBalance(vbdBalance)
	}

	if (event.params.from.equals(Address.zero())) {
		let totalSupply = fetchERC20TotalSupply(contract)
		totalSupply.valueExact = totalSupply.valueExact.plus(event.params.value)
		totalSupply.value = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()
	} else {
		let from = fetchAccount(event.params.from)
		let balance = fetchERC20Balance(contract, from)
		balance.valueExact = balance.valueExact.minus(event.params.value)
		balance.value = decimals.toDecimals(balance.valueExact, contract.decimals)
		saveOrRemoveERC20Balance(balance)

		const vbdBalance = fetchVBDBalance(from)
		vbdBalance.valueExact = vbdBalance.valueExact.minus(event.params.value)
		vbdBalance.value = decimals.toDecimals(vbdBalance.valueExact, contract.decimals)

		if (isVot3) {
			vbdBalance.qfWeight = balance.valueExact.sqrt()
		}

		saveOrRemoveAccountVBDBalance(vbdBalance)

		const veFrom = VeDelegateAccount.load(event.params.from)
		if (veFrom != null) {
			const tvl = fetchStatistic("tvl", "vedelegate")
			if (isB3tr) {
				tvl.b3trExact = tvl.b3trExact.minus(event.params.value)
				tvl.b3tr = decimals.toDecimals(tvl.b3trExact, contract.decimals)
			}
			if (isVot3) {
				tvl.vot3Exact = tvl.vot3Exact.minus(event.params.value)
				tvl.vot3 = decimals.toDecimals(tvl.vot3Exact, contract.decimals)
			}
			tvl.save()
		}
	}

	if (event.params.to.equals(Address.zero())) {
		let totalSupply = fetchERC20TotalSupply(contract)
		totalSupply.valueExact = totalSupply.valueExact.minus(event.params.value)
		totalSupply.value = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()


		const vbdBalance = fetchVBDTotalSupply()
		vbdBalance.valueExact = vbdBalance.valueExact.minus(event.params.value)
		vbdBalance.value = decimals.toDecimals(vbdBalance.valueExact, contract.decimals)
		saveOrRemoveVBDTotalSupply(vbdBalance)
	} else {
		let to = fetchAccount(event.params.to)
		let balance = fetchERC20Balance(contract, to)
		balance.valueExact = balance.valueExact.plus(event.params.value)
		balance.value = decimals.toDecimals(balance.valueExact, contract.decimals)
		saveOrRemoveERC20Balance(balance)


		const vbdBalance = fetchVBDBalance(to)
		vbdBalance.valueExact = vbdBalance.valueExact.plus(event.params.value)
		vbdBalance.value = decimals.toDecimals(vbdBalance.valueExact, contract.decimals)

		if (isVot3) {
			vbdBalance.qfWeight = balance.valueExact.sqrt()
		}
		saveOrRemoveAccountVBDBalance(vbdBalance)

		const veTo = VeDelegateAccount.load(event.params.to)
		if (veTo != null) {
			const tvl = fetchStatistic("tvl", "vedelegate")
			if (isB3tr) {
				tvl.b3trExact = tvl.b3trExact.plus(event.params.value)
				tvl.b3tr = decimals.toDecimals(tvl.b3trExact, contract.decimals)
			}
			if (isVot3) {
				tvl.vot3Exact = tvl.vot3Exact.plus(event.params.value)
				tvl.vot3 = decimals.toDecimals(tvl.vot3Exact, contract.decimals)
			}
			tvl.save()
		}
	}
}

export function handleApproval(event: ApprovalEvent): void {
	let contract = fetchERC20(event.address)

	let owner = fetchAccount(event.params.owner)
	let spender = fetchAccount(event.params.spender)
	let approval = fetchERC20Approval(contract, owner, spender)
	approval.valueExact = event.params.value
	approval.value = decimals.toDecimals(event.params.value, contract.decimals)
	saveOrRemoveERC20Approval(approval)
}

function fetchVBDBalance(account: Account): VBDBalance {
	let id = vbdBalanceId(account.id)
	let balance = VBDBalance.load(id)

	if (balance == null) {
		balance = new VBDBalance(id)
		balance.account = account.id
		balance.value = constants.BIGDECIMAL_ZERO
		balance.valueExact = constants.BIGINT_ZERO
		balance.convertedB3tr = constants.BIGDECIMAL_ZERO
		balance.convertedB3trExact = constants.BIGINT_ZERO
		balance.qfWeight = constants.BIGINT_ZERO
		balance.save()
	}

	return balance
}

function fetchVBDTotalSupply(): VBDBalance {
	let balance = VBDBalance.load(vbdTotalSupplyId())

	if (balance == null) {
		balance = new VBDBalance(vbdTotalSupplyId())
		balance.account = null
		balance.value = constants.BIGDECIMAL_ZERO
		balance.valueExact = constants.BIGINT_ZERO
		balance.convertedB3tr = constants.BIGDECIMAL_ZERO
		balance.convertedB3trExact = constants.BIGINT_ZERO
		balance.qfWeight = constants.BIGINT_ZERO
		balance.save()
	}

	return balance
}

function saveOrRemoveERC20Balance(balance: ERC20Balance): void {
	if (balance.valueExact.equals(constants.BIGINT_ZERO)) {
		store.remove('ERC20Balance', balance.id.toHexString())
		return
	}

	balance.save()
}

function saveOrRemoveERC20Approval(approval: ERC20Approval): void {
	if (approval.valueExact.equals(constants.BIGINT_ZERO)) {
		store.remove('ERC20Approval', approval.id.toHexString())
		return
	}

	approval.save()
}

function saveOrRemoveAccountVBDBalance(balance: VBDBalance): void {
	let hasZeroValue = balance.valueExact.equals(constants.BIGINT_ZERO)
	let hasZeroConverted = balance.convertedB3trExact.equals(constants.BIGINT_ZERO)
	let hasZeroWeight = balance.qfWeight.equals(constants.BIGINT_ZERO)
	if (hasZeroValue) {
		if (hasZeroConverted) {
			if (hasZeroWeight) {
				store.remove('VBDBalance', balance.id.toHexString())
				return
			}
		}
	}

	balance.save()
}

function saveOrRemoveVBDTotalSupply(balance: VBDBalance): void {
	let hasZeroValue = balance.valueExact.equals(constants.BIGINT_ZERO)
	let hasZeroConverted = balance.convertedB3trExact.equals(constants.BIGINT_ZERO)
	let hasZeroWeight = balance.qfWeight.equals(constants.BIGINT_ZERO)
	if (hasZeroValue) {
		if (hasZeroConverted) {
			if (hasZeroWeight) {
				store.remove('VBDBalance', balance.id.toHexString())
				return
			}
		}
	}

	balance.save()
}
