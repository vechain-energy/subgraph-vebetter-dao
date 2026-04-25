import { Address } from '@graphprotocol/graph-ts'

import { Account, ERC20Approval, ERC20Balance, ERC20Contract } from '../../generated/schema'
import { IERC20 } from '../../generated/erc20/IERC20'

import { constants } from '@amxx/graphprotocol-utils'

import { fetchAccount } from '../account'
import { erc20ApprovalId, erc20BalanceId, erc20TotalSupplyId } from '../ids'

export function fetchERC20(address: Address): ERC20Contract {
  let contract = ERC20Contract.load(address)

  if (contract == null) {
    const endpoint = IERC20.bind(address)
    const name = endpoint.try_name()
    const symbol = endpoint.try_symbol()
    const decimals = endpoint.try_decimals()

    contract = new ERC20Contract(address)
    contract.name = name.reverted ? null : name.value
    contract.symbol = symbol.reverted ? null : symbol.value
    contract.decimals = decimals.reverted ? 18 : decimals.value
    contract.totalSupply = fetchERC20TotalSupply(contract as ERC20Contract).id
    contract.asAccount = address
    contract.save()

    const account = fetchAccount(address)
    account.asERC20 = address
    account.save()
  }

  return contract as ERC20Contract
}

export function fetchERC20Balance(contract: ERC20Contract, account: Account): ERC20Balance {
  const id = erc20BalanceId(contract.id, account.id)
  let balance = ERC20Balance.load(id)

  if (balance == null) {
    balance = new ERC20Balance(id)
    balance.contract = contract.id
    balance.account = account.id
    balance.value = constants.BIGDECIMAL_ZERO
    balance.valueExact = constants.BIGINT_ZERO
    balance.save()
  }

  return balance as ERC20Balance
}

export function fetchERC20TotalSupply(contract: ERC20Contract): ERC20Balance {
  const id = erc20TotalSupplyId(contract.id)
  let balance = ERC20Balance.load(id)

  if (balance == null) {
    balance = new ERC20Balance(id)
    balance.contract = contract.id
    balance.account = null
    balance.value = constants.BIGDECIMAL_ZERO
    balance.valueExact = constants.BIGINT_ZERO
    balance.save()
  }

  return balance as ERC20Balance
}

export function fetchERC20Approval(
  contract: ERC20Contract,
  owner: Account,
  spender: Account,
): ERC20Approval {
  const id = erc20ApprovalId(contract.id, owner.id, spender.id)
  let approval = ERC20Approval.load(id)

  if (approval == null) {
    approval = new ERC20Approval(id)
    approval.contract = contract.id
    approval.owner = owner.id
    approval.spender = spender.id
    approval.value = constants.BIGDECIMAL_ZERO
    approval.valueExact = constants.BIGINT_ZERO
  }

  return approval as ERC20Approval
}
