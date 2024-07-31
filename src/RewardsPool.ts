import {
    NewDeposit as NewDepositEvent,
    TeamWithdrawal as TeamWithdrawalEvent,
    RewardDistributed as RewardDistributedEvent,
} from '../generated/RewardsPool/RewardsPool'
import { RewardPoolDeposit, RewardPoolWithdraw, RewardPoolDistribution, SustainabilityProof, AppSustainability, AccountSustainability } from '../generated/schema'
import { events, transactions, decimals, constants } from '@amxx/graphprotocol-utils'
import { DataSourceContext, JSONValueKind, Value, json, Bytes, dataSource, JSONValue, TypedMap, bigInt } from '@graphprotocol/graph-ts'
import { fetchApp } from './XApps'
import { fetchAccount } from '@openzeppelin/subgraphs/src/fetch/account'
import { SustainabilityProof as SustainabilityProofTemplate } from '../generated/templates'



export function handleNewDeposit(event: NewDepositEvent): void {
    const ev = new RewardPoolDeposit(events.id(event))
    const app = fetchApp(event.params.appId)

    ev.emitter = event.address
    ev.transaction = transactions.log(event).id
    ev.timestamp = event.block.timestamp
    ev.app = app.id
    ev.amountExact = event.params.amount
    ev.amount = decimals.toDecimals(event.params.amount, 18)
    ev.depositor = fetchAccount(event.params.depositor).id
    ev.save()

    app.poolBalanceExact = app.poolBalanceExact.plus(ev.amountExact)
    app.poolDepositsExact = app.poolDepositsExact.plus(ev.amountExact)
    app.poolBalance = decimals.toDecimals(app.poolBalanceExact, 18)
    app.poolDeposits = decimals.toDecimals(app.poolDepositsExact, 18)
    app.save()
}

export function handleTeamWithdrawal(event: TeamWithdrawalEvent): void {
    const ev = new RewardPoolWithdraw(events.id(event))
    const app = fetchApp(event.params.appId)

    ev.emitter = event.address
    ev.transaction = transactions.log(event).id
    ev.timestamp = event.block.timestamp
    ev.app = app.id
    ev.amountExact = event.params.amount
    ev.amount = decimals.toDecimals(event.params.amount, 18)
    ev.reason = event.params.reason
    ev.to = fetchAccount(event.params.teamWallet).id
    ev.by = fetchAccount(event.params.withdrawer).id
    ev.save()

    app.poolBalanceExact = app.poolBalanceExact.minus(ev.amountExact)
    app.poolWithdrawalsExact = app.poolWithdrawalsExact.plus(ev.amountExact)
    app.poolBalance = decimals.toDecimals(app.poolBalanceExact, 18)
    app.poolWithdrawals = decimals.toDecimals(app.poolWithdrawalsExact, 18)
    app.save()
}

export function handleRewardDistribution(event: RewardDistributedEvent): void {
    const ev = new RewardPoolDistribution(events.id(event))
    const app = fetchApp(event.params.appId)

    ev.emitter = event.address
    ev.transaction = transactions.log(event).id
    ev.timestamp = event.block.timestamp
    ev.app = app.id
    ev.amountExact = event.params.amount
    ev.amount = decimals.toDecimals(event.params.amount, 18)
    ev.to = fetchAccount(event.params.receiver).id
    ev.by = fetchAccount(event.params.distributor).id

    const sustainabilityId = ((event.block.number.toI64() * 10000000) + (event.transaction.index.toI64() * 10000) + (event.transactionLogIndex.toI64() * 100)).toString()

    /**
     * the first valid proof is available with block #19145969
     * ignore all data before
     */
    if (event.block.number.toI64() >= 19145969) {
        if (event.params.proof.startsWith("ipfs://")) {
            const context = new DataSourceContext()
            context.set('timestamp', Value.fromI64(event.block.timestamp.toI64()))
            context.set('transaction', Value.fromString(transactions.log(event).id))
            context.set('appId', Value.fromBytes(app.id))
            context.set('accountId', Value.fromBytes(ev.to))
            context.set('amount', Value.fromBigInt(event.params.amount))
            context.set('sustainabilityId', Value.fromString(sustainabilityId))
            SustainabilityProofTemplate.createWithContext(event.params.proof, context)
            ev.proof = event.params.proof
        }
        else if (event.params.proof) {
            let proofData = json.try_fromString(event.params.proof)
            if (!proofData.isError && proofData.value.kind == JSONValueKind.OBJECT) {
                const proof = generateSustainabilityProofFromJson(transactions.log(event).id, proofData.value.toObject())
                proof.reward = event.params.amount
                proof.timestamp = event.block.timestamp.toI64()
                proof.app = app.id
                proof.account = ev.to
                proof.transaction = transactions.log(event).id
                proof.save()

                updateAppSustainability(sustainabilityId, proof)
                updateAccountSustainability(proof)
                ev.proof = proof.id
            }
        }
    }

    ev.save()

    app.poolBalanceExact = app.poolBalanceExact.minus(ev.amountExact)
    app.poolDistributionsExact = app.poolDistributionsExact.plus(ev.amountExact)
    app.poolBalance = decimals.toDecimals(app.poolBalanceExact, 18)
    app.poolDistributions = decimals.toDecimals(app.poolDistributionsExact, 18)
    app.save()
}



export function handleSustainabilityProof(content: Bytes, context: DataSourceContext): void {
    const jsonData = json.try_fromBytes(content)
    if (jsonData.isError || jsonData.value.kind !== JSONValueKind.OBJECT) { return }
    const proof = generateSustainabilityProofFromJson(dataSource.stringParam(), jsonData.value.toObject())
    proof.timestamp = context.get('timestamp')!.toI64()
    proof.transaction = context.get('transaction')!.toString()
    proof.account = context.get('accountId')!.toBytes()
    proof.app = context.get('appId')!.toBytes()
    proof.reward = context.get('amount')!.toBigInt()
    proof.save()

    updateAppSustainability(context.get('sustainabilityId')!.toString(), proof)
    updateAccountSustainability(proof)
}


function generateSustainabilityProofFromJson(id: string, proofObject: TypedMap<string, JSONValue>): SustainabilityProof {
    const proof = new SustainabilityProof(id)

    proof.reward = constants.BIGINT_ZERO
    proof.carbon = constants.BIGINT_ZERO
    proof.water = constants.BIGINT_ZERO
    proof.energy = constants.BIGINT_ZERO
    proof.wasteMass = constants.BIGINT_ZERO
    proof.wasteItems = constants.BIGINT_ZERO
    proof.people = constants.BIGINT_ZERO
    proof.biodiversity = constants.BIGINT_ZERO

    if (proofObject.isSet("proof") && proofObject.get("proof")!.kind === JSONValueKind.OBJECT) {
        const proofData = proofObject.get("proof")!.toObject()
        if (proofData.isSet('proof_type')) { proof.proofType = proofData.get("proof_type")!.toString() }
        if (proofData.isSet('proof_data')) { proof.proofData = proofData.get("proof_data")!.toString() }
    }

    if (proofObject.isSet("metadata") && proofObject.get("metadata")!.kind === JSONValueKind.OBJECT) {
        const metadata = proofObject.get("metadata")!.toObject()
        if (metadata.isSet('description')) { proof.description = metadata.get("description")!.toString() }
        if (metadata.isSet('additional_info')) { proof.additionalInfo = metadata.get("additional_info")!.toString() }
    }

    if (proofObject.isSet("impact") && proofObject.get("impact")!.kind === JSONValueKind.OBJECT) {
        const impact = proofObject.get("impact")!.toObject()

        if (impact.isSet('carbon') && impact.get('carbon')!.kind === JSONValueKind.STRING) { proof.carbon = bigInt.fromString(impact.get('carbon')!.toString()) }
        if (impact.isSet('water') && impact.get('water')!.kind === JSONValueKind.STRING) { proof.water = bigInt.fromString(impact.get('water')!.toString()) }
        if (impact.isSet('energy') && impact.get('energy')!.kind === JSONValueKind.STRING) { proof.energy = bigInt.fromString(impact.get('energy')!.toString()) }
        if (impact.isSet('waste_mass') && impact.get('waste_mass')!.kind === JSONValueKind.STRING) { proof.wasteMass = bigInt.fromString(impact.get('waste_mass')!.toString()) }
        if (impact.isSet('waste_items') && impact.get('waste_items')!.kind === JSONValueKind.STRING) { proof.wasteItems = bigInt.fromString(impact.get('waste_items')!.toString()) }
        if (impact.isSet('people') && impact.get('people')!.kind === JSONValueKind.STRING) { proof.people = bigInt.fromString(impact.get('people')!.toString()) }
        if (impact.isSet('biodiversity') && impact.get('biodiversity')!.kind === JSONValueKind.STRING) { proof.biodiversity = bigInt.fromString(impact.get('biodiversity')!.toString()) }
    }

    return proof
}


function updateAppSustainability(sustainabilityId: string, proof: SustainabilityProof): void {
    const appSustainability = new AppSustainability(sustainabilityId)
    appSustainability.reward = proof.reward
    appSustainability.carbon = proof.carbon
    appSustainability.water = proof.water
    appSustainability.energy = proof.energy
    appSustainability.wasteMass = proof.wasteMass
    appSustainability.wasteItems = proof.wasteItems
    appSustainability.people = proof.people
    appSustainability.biodiversity = proof.biodiversity
    appSustainability.timestamp = proof.timestamp
    appSustainability.app = proof.app
    appSustainability.account = proof.account
    appSustainability.save()
}

function updateAccountSustainability(proof: SustainabilityProof): void {
    const id = [proof.account.toHexString(), proof.app.toHexString()].join('/')
    let accountSustainability = AccountSustainability.load(id)

    if (accountSustainability == null) {
        accountSustainability = new AccountSustainability(id)

        accountSustainability.receivedRewards = constants.BIGINT_ZERO
        accountSustainability.carbon = constants.BIGINT_ZERO
        accountSustainability.water = constants.BIGINT_ZERO
        accountSustainability.energy = constants.BIGINT_ZERO
        accountSustainability.wasteMass = constants.BIGINT_ZERO
        accountSustainability.wasteItems = constants.BIGINT_ZERO
        accountSustainability.people = constants.BIGINT_ZERO
        accountSustainability.biodiversity = constants.BIGINT_ZERO
        accountSustainability.account = proof.account
        accountSustainability.app = proof.app
    }

    accountSustainability.receivedRewards = accountSustainability.receivedRewards.plus(proof.reward)
    accountSustainability.carbon = accountSustainability.carbon.plus(proof.carbon)
    accountSustainability.water = accountSustainability.water.plus(proof.water)
    accountSustainability.energy = accountSustainability.energy.plus(proof.energy)
    accountSustainability.wasteMass = accountSustainability.wasteMass.plus(proof.wasteMass)
    accountSustainability.wasteItems = accountSustainability.wasteItems.plus(proof.wasteItems)
    accountSustainability.people = accountSustainability.people.plus(proof.people)
    accountSustainability.biodiversity = accountSustainability.biodiversity.plus(proof.biodiversity)
    accountSustainability.save()
}