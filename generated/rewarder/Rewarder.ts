// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
} from "@graphprotocol/graph-ts";

export class EmissionsAddressUpdated extends ethereum.Event {
  get params(): EmissionsAddressUpdated__Params {
    return new EmissionsAddressUpdated__Params(this);
  }
}

export class EmissionsAddressUpdated__Params {
  _event: EmissionsAddressUpdated;

  constructor(event: EmissionsAddressUpdated) {
    this._event = event;
  }

  get newAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get oldAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class GalaxyMemberAddressUpdated extends ethereum.Event {
  get params(): GalaxyMemberAddressUpdated__Params {
    return new GalaxyMemberAddressUpdated__Params(this);
  }
}

export class GalaxyMemberAddressUpdated__Params {
  _event: GalaxyMemberAddressUpdated;

  constructor(event: GalaxyMemberAddressUpdated) {
    this._event = event;
  }

  get newAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get oldAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class Initialized extends ethereum.Event {
  get params(): Initialized__Params {
    return new Initialized__Params(this);
  }
}

export class Initialized__Params {
  _event: Initialized;

  constructor(event: Initialized) {
    this._event = event;
  }

  get version(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class LevelToMultiplierSet extends ethereum.Event {
  get params(): LevelToMultiplierSet__Params {
    return new LevelToMultiplierSet__Params(this);
  }
}

export class LevelToMultiplierSet__Params {
  _event: LevelToMultiplierSet;

  constructor(event: LevelToMultiplierSet) {
    this._event = event;
  }

  get level(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get multiplier(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class RewardClaimed extends ethereum.Event {
  get params(): RewardClaimed__Params {
    return new RewardClaimed__Params(this);
  }
}

export class RewardClaimed__Params {
  _event: RewardClaimed;

  constructor(event: RewardClaimed) {
    this._event = event;
  }

  get cycle(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get voter(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get reward(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class RoleAdminChanged extends ethereum.Event {
  get params(): RoleAdminChanged__Params {
    return new RoleAdminChanged__Params(this);
  }
}

export class RoleAdminChanged__Params {
  _event: RoleAdminChanged;

  constructor(event: RoleAdminChanged) {
    this._event = event;
  }

  get role(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get previousAdminRole(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get newAdminRole(): Bytes {
    return this._event.parameters[2].value.toBytes();
  }
}

export class RoleGranted extends ethereum.Event {
  get params(): RoleGranted__Params {
    return new RoleGranted__Params(this);
  }
}

export class RoleGranted__Params {
  _event: RoleGranted;

  constructor(event: RoleGranted) {
    this._event = event;
  }

  get role(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get account(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get sender(): Address {
    return this._event.parameters[2].value.toAddress();
  }
}

export class RoleRevoked extends ethereum.Event {
  get params(): RoleRevoked__Params {
    return new RoleRevoked__Params(this);
  }
}

export class RoleRevoked__Params {
  _event: RoleRevoked;

  constructor(event: RoleRevoked) {
    this._event = event;
  }

  get role(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get account(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get sender(): Address {
    return this._event.parameters[2].value.toAddress();
  }
}

export class Upgraded extends ethereum.Event {
  get params(): Upgraded__Params {
    return new Upgraded__Params(this);
  }
}

export class Upgraded__Params {
  _event: Upgraded;

  constructor(event: Upgraded) {
    this._event = event;
  }

  get implementation(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class VoteRegistered extends ethereum.Event {
  get params(): VoteRegistered__Params {
    return new VoteRegistered__Params(this);
  }
}

export class VoteRegistered__Params {
  _event: VoteRegistered;

  constructor(event: VoteRegistered) {
    this._event = event;
  }

  get cycle(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get voter(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get votes(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get rewardWeightedVote(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class Rewarder extends ethereum.SmartContract {
  static bind(address: Address): Rewarder {
    return new Rewarder("Rewarder", address);
  }

  CONTRACTS_ADDRESS_MANAGER_ROLE(): Bytes {
    let result = super.call(
      "CONTRACTS_ADDRESS_MANAGER_ROLE",
      "CONTRACTS_ADDRESS_MANAGER_ROLE():(bytes32)",
      [],
    );

    return result[0].toBytes();
  }

  try_CONTRACTS_ADDRESS_MANAGER_ROLE(): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "CONTRACTS_ADDRESS_MANAGER_ROLE",
      "CONTRACTS_ADDRESS_MANAGER_ROLE():(bytes32)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  DEFAULT_ADMIN_ROLE(): Bytes {
    let result = super.call(
      "DEFAULT_ADMIN_ROLE",
      "DEFAULT_ADMIN_ROLE():(bytes32)",
      [],
    );

    return result[0].toBytes();
  }

  try_DEFAULT_ADMIN_ROLE(): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "DEFAULT_ADMIN_ROLE",
      "DEFAULT_ADMIN_ROLE():(bytes32)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  SCALING_FACTOR(): BigInt {
    let result = super.call("SCALING_FACTOR", "SCALING_FACTOR():(uint256)", []);

    return result[0].toBigInt();
  }

  try_SCALING_FACTOR(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "SCALING_FACTOR",
      "SCALING_FACTOR():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  UPGRADER_ROLE(): Bytes {
    let result = super.call("UPGRADER_ROLE", "UPGRADER_ROLE():(bytes32)", []);

    return result[0].toBytes();
  }

  try_UPGRADER_ROLE(): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "UPGRADER_ROLE",
      "UPGRADER_ROLE():(bytes32)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  UPGRADE_INTERFACE_VERSION(): string {
    let result = super.call(
      "UPGRADE_INTERFACE_VERSION",
      "UPGRADE_INTERFACE_VERSION():(string)",
      [],
    );

    return result[0].toString();
  }

  try_UPGRADE_INTERFACE_VERSION(): ethereum.CallResult<string> {
    let result = super.tryCall(
      "UPGRADE_INTERFACE_VERSION",
      "UPGRADE_INTERFACE_VERSION():(string)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  VOTE_REGISTRAR_ROLE(): Bytes {
    let result = super.call(
      "VOTE_REGISTRAR_ROLE",
      "VOTE_REGISTRAR_ROLE():(bytes32)",
      [],
    );

    return result[0].toBytes();
  }

  try_VOTE_REGISTRAR_ROLE(): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "VOTE_REGISTRAR_ROLE",
      "VOTE_REGISTRAR_ROLE():(bytes32)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  b3tr(): Address {
    let result = super.call("b3tr", "b3tr():(address)", []);

    return result[0].toAddress();
  }

  try_b3tr(): ethereum.CallResult<Address> {
    let result = super.tryCall("b3tr", "b3tr():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  cycleToTotal(cycle: BigInt): BigInt {
    let result = super.call("cycleToTotal", "cycleToTotal(uint256):(uint256)", [
      ethereum.Value.fromUnsignedBigInt(cycle),
    ]);

    return result[0].toBigInt();
  }

  try_cycleToTotal(cycle: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "cycleToTotal",
      "cycleToTotal(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(cycle)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  cycleToVoterToTotal(cycle: BigInt, voter: Address): BigInt {
    let result = super.call(
      "cycleToVoterToTotal",
      "cycleToVoterToTotal(uint256,address):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(cycle),
        ethereum.Value.fromAddress(voter),
      ],
    );

    return result[0].toBigInt();
  }

  try_cycleToVoterToTotal(
    cycle: BigInt,
    voter: Address,
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "cycleToVoterToTotal",
      "cycleToVoterToTotal(uint256,address):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(cycle),
        ethereum.Value.fromAddress(voter),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  emissions(): Address {
    let result = super.call("emissions", "emissions():(address)", []);

    return result[0].toAddress();
  }

  try_emissions(): ethereum.CallResult<Address> {
    let result = super.tryCall("emissions", "emissions():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  galaxyMember(): Address {
    let result = super.call("galaxyMember", "galaxyMember():(address)", []);

    return result[0].toAddress();
  }

  try_galaxyMember(): ethereum.CallResult<Address> {
    let result = super.tryCall("galaxyMember", "galaxyMember():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getReward(cycle: BigInt, voter: Address): BigInt {
    let result = super.call(
      "getReward",
      "getReward(uint256,address):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(cycle),
        ethereum.Value.fromAddress(voter),
      ],
    );

    return result[0].toBigInt();
  }

  try_getReward(cycle: BigInt, voter: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getReward",
      "getReward(uint256,address):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(cycle),
        ethereum.Value.fromAddress(voter),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getRoleAdmin(role: Bytes): Bytes {
    let result = super.call("getRoleAdmin", "getRoleAdmin(bytes32):(bytes32)", [
      ethereum.Value.fromFixedBytes(role),
    ]);

    return result[0].toBytes();
  }

  try_getRoleAdmin(role: Bytes): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "getRoleAdmin",
      "getRoleAdmin(bytes32):(bytes32)",
      [ethereum.Value.fromFixedBytes(role)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  hasRole(role: Bytes, account: Address): boolean {
    let result = super.call("hasRole", "hasRole(bytes32,address):(bool)", [
      ethereum.Value.fromFixedBytes(role),
      ethereum.Value.fromAddress(account),
    ]);

    return result[0].toBoolean();
  }

  try_hasRole(role: Bytes, account: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("hasRole", "hasRole(bytes32,address):(bool)", [
      ethereum.Value.fromFixedBytes(role),
      ethereum.Value.fromAddress(account),
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  levelToMultiplier(level: BigInt): BigInt {
    let result = super.call(
      "levelToMultiplier",
      "levelToMultiplier(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(level)],
    );

    return result[0].toBigInt();
  }

  try_levelToMultiplier(level: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "levelToMultiplier",
      "levelToMultiplier(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(level)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  proxiableUUID(): Bytes {
    let result = super.call("proxiableUUID", "proxiableUUID():(bytes32)", []);

    return result[0].toBytes();
  }

  try_proxiableUUID(): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "proxiableUUID",
      "proxiableUUID():(bytes32)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  supportsInterface(interfaceId: Bytes): boolean {
    let result = super.call(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)],
    );

    return result[0].toBoolean();
  }

  try_supportsInterface(interfaceId: Bytes): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  version(): string {
    let result = super.call("version", "version():(string)", []);

    return result[0].toString();
  }

  try_version(): ethereum.CallResult<string> {
    let result = super.tryCall("version", "version():(string)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ClaimRewardCall extends ethereum.Call {
  get inputs(): ClaimRewardCall__Inputs {
    return new ClaimRewardCall__Inputs(this);
  }

  get outputs(): ClaimRewardCall__Outputs {
    return new ClaimRewardCall__Outputs(this);
  }
}

export class ClaimRewardCall__Inputs {
  _call: ClaimRewardCall;

  constructor(call: ClaimRewardCall) {
    this._call = call;
  }

  get cycle(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get voter(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class ClaimRewardCall__Outputs {
  _call: ClaimRewardCall;

  constructor(call: ClaimRewardCall) {
    this._call = call;
  }
}

export class GrantRoleCall extends ethereum.Call {
  get inputs(): GrantRoleCall__Inputs {
    return new GrantRoleCall__Inputs(this);
  }

  get outputs(): GrantRoleCall__Outputs {
    return new GrantRoleCall__Outputs(this);
  }
}

export class GrantRoleCall__Inputs {
  _call: GrantRoleCall;

  constructor(call: GrantRoleCall) {
    this._call = call;
  }

  get role(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get account(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class GrantRoleCall__Outputs {
  _call: GrantRoleCall;

  constructor(call: GrantRoleCall) {
    this._call = call;
  }
}

export class InitializeCall extends ethereum.Call {
  get inputs(): InitializeCall__Inputs {
    return new InitializeCall__Inputs(this);
  }

  get outputs(): InitializeCall__Outputs {
    return new InitializeCall__Outputs(this);
  }
}

export class InitializeCall__Inputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }

  get admin(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get upgrader(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get contractsAddressManager(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _emissions(): Address {
    return this._call.inputValues[3].value.toAddress();
  }

  get _galaxyMember(): Address {
    return this._call.inputValues[4].value.toAddress();
  }

  get _b3tr(): Address {
    return this._call.inputValues[5].value.toAddress();
  }

  get levels(): Array<BigInt> {
    return this._call.inputValues[6].value.toBigIntArray();
  }

  get multipliers(): Array<BigInt> {
    return this._call.inputValues[7].value.toBigIntArray();
  }
}

export class InitializeCall__Outputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }
}

export class RegisterVoteCall extends ethereum.Call {
  get inputs(): RegisterVoteCall__Inputs {
    return new RegisterVoteCall__Inputs(this);
  }

  get outputs(): RegisterVoteCall__Outputs {
    return new RegisterVoteCall__Outputs(this);
  }
}

export class RegisterVoteCall__Inputs {
  _call: RegisterVoteCall;

  constructor(call: RegisterVoteCall) {
    this._call = call;
  }

  get proposalStart(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get voter(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get votes(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get votePower(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }
}

export class RegisterVoteCall__Outputs {
  _call: RegisterVoteCall;

  constructor(call: RegisterVoteCall) {
    this._call = call;
  }
}

export class RenounceRoleCall extends ethereum.Call {
  get inputs(): RenounceRoleCall__Inputs {
    return new RenounceRoleCall__Inputs(this);
  }

  get outputs(): RenounceRoleCall__Outputs {
    return new RenounceRoleCall__Outputs(this);
  }
}

export class RenounceRoleCall__Inputs {
  _call: RenounceRoleCall;

  constructor(call: RenounceRoleCall) {
    this._call = call;
  }

  get role(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get callerConfirmation(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class RenounceRoleCall__Outputs {
  _call: RenounceRoleCall;

  constructor(call: RenounceRoleCall) {
    this._call = call;
  }
}

export class RevokeRoleCall extends ethereum.Call {
  get inputs(): RevokeRoleCall__Inputs {
    return new RevokeRoleCall__Inputs(this);
  }

  get outputs(): RevokeRoleCall__Outputs {
    return new RevokeRoleCall__Outputs(this);
  }
}

export class RevokeRoleCall__Inputs {
  _call: RevokeRoleCall;

  constructor(call: RevokeRoleCall) {
    this._call = call;
  }

  get role(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get account(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class RevokeRoleCall__Outputs {
  _call: RevokeRoleCall;

  constructor(call: RevokeRoleCall) {
    this._call = call;
  }
}

export class SetEmissionsCall extends ethereum.Call {
  get inputs(): SetEmissionsCall__Inputs {
    return new SetEmissionsCall__Inputs(this);
  }

  get outputs(): SetEmissionsCall__Outputs {
    return new SetEmissionsCall__Outputs(this);
  }
}

export class SetEmissionsCall__Inputs {
  _call: SetEmissionsCall;

  constructor(call: SetEmissionsCall) {
    this._call = call;
  }

  get _emissions(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetEmissionsCall__Outputs {
  _call: SetEmissionsCall;

  constructor(call: SetEmissionsCall) {
    this._call = call;
  }
}

export class SetGalaxyMemberCall extends ethereum.Call {
  get inputs(): SetGalaxyMemberCall__Inputs {
    return new SetGalaxyMemberCall__Inputs(this);
  }

  get outputs(): SetGalaxyMemberCall__Outputs {
    return new SetGalaxyMemberCall__Outputs(this);
  }
}

export class SetGalaxyMemberCall__Inputs {
  _call: SetGalaxyMemberCall;

  constructor(call: SetGalaxyMemberCall) {
    this._call = call;
  }

  get _galaxyMember(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetGalaxyMemberCall__Outputs {
  _call: SetGalaxyMemberCall;

  constructor(call: SetGalaxyMemberCall) {
    this._call = call;
  }
}

export class SetLevelToMultiplierCall extends ethereum.Call {
  get inputs(): SetLevelToMultiplierCall__Inputs {
    return new SetLevelToMultiplierCall__Inputs(this);
  }

  get outputs(): SetLevelToMultiplierCall__Outputs {
    return new SetLevelToMultiplierCall__Outputs(this);
  }
}

export class SetLevelToMultiplierCall__Inputs {
  _call: SetLevelToMultiplierCall;

  constructor(call: SetLevelToMultiplierCall) {
    this._call = call;
  }

  get level(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get multiplier(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class SetLevelToMultiplierCall__Outputs {
  _call: SetLevelToMultiplierCall;

  constructor(call: SetLevelToMultiplierCall) {
    this._call = call;
  }
}

export class UpgradeToAndCallCall extends ethereum.Call {
  get inputs(): UpgradeToAndCallCall__Inputs {
    return new UpgradeToAndCallCall__Inputs(this);
  }

  get outputs(): UpgradeToAndCallCall__Outputs {
    return new UpgradeToAndCallCall__Outputs(this);
  }
}

export class UpgradeToAndCallCall__Inputs {
  _call: UpgradeToAndCallCall;

  constructor(call: UpgradeToAndCallCall) {
    this._call = call;
  }

  get newImplementation(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get data(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }
}

export class UpgradeToAndCallCall__Outputs {
  _call: UpgradeToAndCallCall;

  constructor(call: UpgradeToAndCallCall) {
    this._call = call;
  }
}
