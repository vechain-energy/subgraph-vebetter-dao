import { assert, beforeEach, clearStore, describe, test } from 'matchstick-as/assembly/index'
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

import { erc20ApprovalId, erc20BalanceId, erc20TotalSupplyId, vbdBalanceId } from '../src/ids'
import { handleApproval, handleTransfer } from '../src/erc20'
import { B3TR_ADDRESS, createERC20ApprovalEvent, createERC20TransferEvent, mockERC20Metadata } from './helpers'

describe('ERC20', () => {
  beforeEach(() => {
    clearStore()
    mockERC20Metadata(B3TR_ADDRESS, 'B3TR', 'B3TR', 18)
  })

  test('prunes zero balances and zero approvals, then recreates balances on new activity', () => {
    const alice = Address.fromString('0x0000000000000000000000000000000000000011')
    const bob = Address.fromString('0x0000000000000000000000000000000000000012')
    const spender = Address.fromString('0x0000000000000000000000000000000000000013')

    handleTransfer(createERC20TransferEvent(Address.zero(), alice, BigInt.fromI32(100), 1))
    handleApproval(createERC20ApprovalEvent(alice, spender, BigInt.fromI32(50), 2))
    handleApproval(createERC20ApprovalEvent(alice, spender, BigInt.zero(), 3))
    handleTransfer(createERC20TransferEvent(alice, bob, BigInt.fromI32(100), 4))
    handleTransfer(createERC20TransferEvent(bob, Address.zero(), BigInt.fromI32(100), 5))
    handleTransfer(createERC20TransferEvent(Address.zero(), alice, BigInt.fromI32(25), 6))

    const aliceBalanceId = erc20BalanceId(B3TR_ADDRESS as Bytes, alice as Bytes).toHexString()
    const bobBalanceId = erc20BalanceId(B3TR_ADDRESS as Bytes, bob as Bytes).toHexString()
    const approvalId = erc20ApprovalId(B3TR_ADDRESS as Bytes, alice as Bytes, spender as Bytes).toHexString()
    const totalSupplyId = erc20TotalSupplyId(B3TR_ADDRESS as Bytes).toHexString()
    const aliceVbdId = vbdBalanceId(alice as Bytes).toHexString()
    const bobVbdId = vbdBalanceId(bob as Bytes).toHexString()

    assert.fieldEquals('ERC20Balance', aliceBalanceId, 'valueExact', '25')
    assert.fieldEquals('ERC20Balance', totalSupplyId, 'valueExact', '25')
    assert.fieldEquals('VBDBalance', aliceVbdId, 'valueExact', '25')

    assert.notInStore('ERC20Balance', bobBalanceId)
    assert.notInStore('ERC20Approval', approvalId)
    assert.notInStore('VBDBalance', bobVbdId)
  })
})
