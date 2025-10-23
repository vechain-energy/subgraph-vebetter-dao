import {
    NewDeposit as NewDepositEvent,
    TeamWithdrawal as TeamWithdrawalEvent,
    RewardDistributed as RewardDistributedEvent,
    FundsDistributedToApp as FundsDistributedToAppEvent,
} from '../generated/RewardsPool/RewardsPool'
import {
    AllocationRewardsClaimed as AllocationRewardsClaimedEvent,
} from '../generated/xallocationpool/XAllocationPool'
import { App, AppRoundSummary, RewardPoolTransfer, RewardPoolDeposit, RewardPoolWithdraw, RewardPoolDistribution, SustainabilityProof, SustainabilityStats, AppSustainability, AccountSustainability, AccountRoundSustainability, Round, AppRoundWithdrawalReason } from '../generated/schema'
import { events, transactions, decimals, constants } from '@amxx/graphprotocol-utils'
import { DataSourceContext, JSONValueKind, Value, json, Bytes, dataSource, JSONValue, TypedMap, bigInt, Address } from '@graphprotocol/graph-ts'
import { fetchApp } from './XApps'
import { fetchAccount } from '@openzeppelin/subgraphs/src/fetch/account'
import { fetchRound } from './XAllocationVoting'
import { SustainabilityProof as SustainabilityProofTemplate } from '../generated/templates'
import { XAllocationVoting } from '../generated/RewardsPool/XAllocationVoting'
import { incrementLock2EarnTermRewards } from './Lock2Earn'
import { VeDelegateAccount } from '../generated/schema'
import { CurrentRound } from '../generated/schema'



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
    let current = CurrentRound.load("singleton")
    if (current == null) { return }
    ev.round = current.roundId.toString()
    ev.save()

    const transfer = new RewardPoolTransfer(['transfer', events.id(event)].join('/'))
    transfer.emitter = ev.emitter
    transfer.transaction = ev.transaction
    transfer.timestamp = ev.timestamp
    transfer.app = ev.app
    transfer.amountExact = ev.amountExact
    transfer.amount = ev.amount
    transfer.from = ev.depositor
    transfer.to = Address.zero()
    transfer.deposit = ev.id
    transfer.round = ev.round
    transfer.save()
    updateAppRoundSummary(transfer)

    app.poolBalanceExact = app.poolBalanceExact.plus(ev.amountExact)

    // Check if this deposit is from the X Allocation Pool - if so, don't count it as a deposit
    // since allocations are handled separately by the AllocationRewardsClaimed event handler
    if (ev.depositor.equals(Address.fromString("0x4191776f05f4be4848d3f4d587345078b439c7d3"))) {
        // This is an allocation, not a regular deposit - skip counting it here
        // Allocations are tracked in handleAllocationRewardsClaimed
    } else if (ev.depositor.equals(Address.fromString("0x98c1d097c39969bb5de754266f60d22bd105b368"))) {
        // This is the overflow deposit that originally went into the Treasury and flows back to dApps as minimum allocation
        // its tracked with FundsDistributedToApp events
    } else {
        // This is a regular deposit from a user/app
        app.poolDepositsExact = app.poolDepositsExact.plus(ev.amountExact)
    }

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
    ev.round = getCurrentRound().id
    ev.save()

    const transfer = new RewardPoolTransfer(['transfer', events.id(event)].join('/'))
    transfer.emitter = ev.emitter
    transfer.transaction = ev.transaction
    transfer.timestamp = ev.timestamp
    transfer.app = ev.app
    transfer.amountExact = ev.amountExact
    transfer.amount = ev.amount
    transfer.from = ev.by
    transfer.to = ev.to
    transfer.withdraw = ev.id
    transfer.round = ev.round
    transfer.save()
    updateAppRoundSummary(transfer)

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
    ev.round = getCurrentRound().id

    const sustainabilityId = ((event.block.number.toI64() * 10000000) + (event.transaction.index.toI64() * 10000) + (event.transactionLogIndex.toI64() * 100))

    /**
     * the first valid proof is available with block #19145969
     * ignore all data before
     */
    let isNewParticipant = false
    let isNewRoundParticipant = false
    if (event.block.number.toI64() >= 19145969) {
        if (event.params.proof.startsWith("ipfs://")) {
            const context = new DataSourceContext()
            context.set('proofId', Value.fromI64(sustainabilityId))
            context.set('timestamp', Value.fromI64(event.block.timestamp.toI64()))
            context.set('transaction', Value.fromString(transactions.log(event).id))
            context.set('appId', Value.fromBytes(app.id))
            context.set('accountId', Value.fromBytes(ev.to))
            context.set('amount', Value.fromBigInt(event.params.amount))
            context.set('sustainabilityId', Value.fromI64(sustainabilityId))
            context.set('roundId', Value.fromString(ev.round))
            SustainabilityProofTemplate.createWithContext(event.params.proof, context)
            ev.proof = event.params.proof
        }
        else if (event.params.proof) {
            let proofData = json.try_fromString(event.params.proof)
            if (!proofData.isError && proofData.value.kind == JSONValueKind.OBJECT) {
                const proof = generateSustainabilityProofFromJson(sustainabilityId, proofData.value.toObject())
                proof.reward = event.params.amount
                proof.timestamp = event.block.timestamp.toI64()
                proof.app = app.id
                proof.account = ev.to
                proof.transaction = transactions.log(event).id
                proof.round = ev.round
                proof.save()

                updateAppSustainability(sustainabilityId, proof)

                const newParticipantStatus = updateAccountSustainability(proof)
                isNewParticipant = newParticipantStatus[0] ? true : false
                isNewRoundParticipant = newParticipantStatus[1] ? true : false

                updateAppRoundSustainability(proof)
                ev.proof = proof.id
            }
        }
    }

    ev.save()

    const transfer = new RewardPoolTransfer(['transfer', events.id(event)].join('/'))
    transfer.emitter = ev.emitter
    transfer.transaction = ev.transaction
    transfer.timestamp = ev.timestamp
    transfer.app = ev.app
    transfer.amountExact = ev.amountExact
    transfer.amount = ev.amount
    transfer.from = ev.by
    transfer.to = ev.to
    transfer.distribution = ev.id
    transfer.round = ev.round
    transfer.save()
    updateAppRoundSummary(transfer)

    app.poolBalanceExact = app.poolBalanceExact.minus(ev.amountExact)
    app.poolDistributionsExact = app.poolDistributionsExact.plus(ev.amountExact)
    app.poolBalance = decimals.toDecimals(app.poolBalanceExact, 18)
    app.poolDistributions = decimals.toDecimals(app.poolDistributionsExact, 18)

    if (isNewParticipant) {
        app.participantsCount = app.participantsCount.plus(constants.BIGINT_ONE)
    }

    app.save()

    if (isNewRoundParticipant) {
        const appRoundSummary = AppRoundSummary.load([app.id.toHexString(), ev.round].join('/'))!
        appRoundSummary.activeUserCount = appRoundSummary.activeUserCount.plus(constants.BIGINT_ONE)
        appRoundSummary.save()
    }

    // Wire in Lock2Earn reward increment
    let veAccount = VeDelegateAccount.load(event.params.receiver)
    if (veAccount && veAccount.asLock2EarnTerm && veAccount.lock2EarnTermId != null) {
        incrementLock2EarnTermRewards(veAccount.lock2EarnTermId as string, event.params.amount)
    }
}

export function handleAllocationRewardsClaimed(event: AllocationRewardsClaimedEvent): void {
    const app = fetchApp(event.params.appId)

    // Add 1 to the roundId because thats thats the round where the allocation will be used
    const nextRoundId = event.params.roundId.plus(constants.BIGINT_ONE)
    const nextRound = fetchRound(nextRoundId.toString())

    // Update app allocation amounts using the event data
    app.poolAllocationsExact = app.poolAllocationsExact.plus(event.params.totalAmount)
    app.poolAllocations = decimals.toDecimals(app.poolAllocationsExact, 18)
    app.save()

    // Update app round summary allocation amounts
    const appRoundSummary = fetchAppRoundSummary(app, nextRound)
    appRoundSummary.poolAllocationsExact = appRoundSummary.poolAllocationsExact.plus(event.params.totalAmount)
    appRoundSummary.poolAllocations = decimals.toDecimals(appRoundSummary.poolAllocationsExact, 18)
    appRoundSummary.save()
}

export function handleFundsDistributedToApp(event: FundsDistributedToAppEvent): void {
    const app = fetchApp(event.params.appId)
    const round = fetchRound(event.params.roundId.toString())

    // Update app allocation amounts using the event data
    app.poolAllocationsExact = app.poolAllocationsExact.plus(event.params.amount)
    app.poolAllocations = decimals.toDecimals(app.poolAllocationsExact, 18)
    app.save()

    // Update app round summary allocation amounts
    const appRoundSummary = fetchAppRoundSummary(app, round)
    appRoundSummary.poolAllocationsExact = appRoundSummary.poolAllocationsExact.plus(event.params.amount)
    appRoundSummary.poolAllocations = decimals.toDecimals(appRoundSummary.poolAllocationsExact, 18)
    appRoundSummary.save()
}


export function handleSustainabilityProof(content: Bytes, context: DataSourceContext): void {
    const jsonData = json.try_fromBytes(content)
    if (jsonData.isError || jsonData.value.kind !== JSONValueKind.OBJECT) { return }
    const proof = generateSustainabilityProofFromJson(context.get('proofId')!.toI64(), jsonData.value.toObject())
    proof.timestamp = context.get('timestamp')!.toI64()
    proof.transaction = context.get('transaction')!.toString()
    proof.account = context.get('accountId')!.toBytes()
    proof.app = context.get('appId')!.toBytes()
    proof.reward = context.get('amount')!.toBigInt()
    proof.round = context.get('roundId')!.toString()
    proof.save()

    updateAppSustainability(context.get('sustainabilityId')!.toI64(), proof)
    const newParticipantStatus = updateAccountSustainability(proof)
    if (newParticipantStatus[0]) {
        const app = App.load(proof.app)!
        app.participantsCount = app.participantsCount.plus(constants.BIGINT_ONE)
        app.save()
    }

    if (newParticipantStatus[1]) {
        const appRoundSummary = AppRoundSummary.load([proof.app.toHexString(), proof.round].join('/'))!
        appRoundSummary.activeUserCount = appRoundSummary.activeUserCount.plus(constants.BIGINT_ONE)
        appRoundSummary.save()
    }
    updateAppRoundSustainability(proof)
}

function updateAppRoundSustainability(proof: SustainabilityProof): void {
    const id = [proof.app.toHexString(), proof.round].join('/')
    const sustainabilityStats = SustainabilityStats.load(id)
    if (!sustainabilityStats) { return }

    const app = App.load(proof.app)!
    sustainabilityStats.newUserCount = app.participantsCount.minus(sustainabilityStats.participantsCountStart)
    sustainabilityStats.rewards = sustainabilityStats.rewards.plus(proof.reward)
    sustainabilityStats.actionCount = sustainabilityStats.actionCount.plus(constants.BIGINT_ONE)

    sustainabilityStats.carbon = sustainabilityStats.carbon.plus(proof.carbon)
    sustainabilityStats.water = sustainabilityStats.water.plus(proof.water)
    sustainabilityStats.energy = sustainabilityStats.energy.plus(proof.energy)
    sustainabilityStats.wasteMass = sustainabilityStats.wasteMass.plus(proof.wasteMass)
    sustainabilityStats.plastic = sustainabilityStats.plastic.plus(proof.plastic)
    sustainabilityStats.timber = sustainabilityStats.timber.plus(proof.timber)
    sustainabilityStats.educationTime = sustainabilityStats.educationTime.plus(proof.educationTime)
    sustainabilityStats.treesPlanted = sustainabilityStats.treesPlanted.plus(proof.treesPlanted)
    sustainabilityStats.caloriesBurned = sustainabilityStats.caloriesBurned.plus(proof.caloriesBurned)
    sustainabilityStats.sleepQualityPercentage = sustainabilityStats.sleepQualityPercentage.plus(proof.sleepQualityPercentage)
    sustainabilityStats.cleanEnergyProduction = sustainabilityStats.cleanEnergyProduction.plus(proof.cleanEnergyProduction)

    // deprecated entries
    sustainabilityStats.wasteItems = sustainabilityStats.wasteItems.plus(proof.wasteItems)
    sustainabilityStats.people = sustainabilityStats.people.plus(proof.people)
    sustainabilityStats.biodiversity = sustainabilityStats.biodiversity.plus(proof.biodiversity)
    sustainabilityStats.save()
}

function generateSustainabilityProofFromJson(id: i64, proofObject: TypedMap<string, JSONValue>): SustainabilityProof {
    const proof = new SustainabilityProof(id.toString())

    proof.reward = constants.BIGINT_ZERO
    proof.carbon = constants.BIGINT_ZERO
    proof.water = constants.BIGINT_ZERO
    proof.energy = constants.BIGINT_ZERO
    proof.wasteMass = constants.BIGINT_ZERO
    proof.plastic = constants.BIGINT_ZERO
    proof.timber = constants.BIGINT_ZERO
    proof.educationTime = constants.BIGINT_ZERO
    proof.treesPlanted = constants.BIGINT_ZERO
    proof.caloriesBurned = constants.BIGINT_ZERO
    proof.sleepQualityPercentage = constants.BIGINT_ZERO
    proof.cleanEnergyProduction = constants.BIGINT_ZERO

    // deprecated entries
    proof.wasteItems = constants.BIGINT_ZERO
    proof.people = constants.BIGINT_ZERO
    proof.biodiversity = constants.BIGINT_ZERO
    proof.version = 0

    /**
     * Proof Version 2
     *
     * Introduced with https://github.com/vechain/vebetterdao-contracts/pull/18 
     *
     * Example JSON:
     * {
     *     version: 2,
     *     description: 'The description of the action',
     *     proof: { image: 'https://image.png', link: 'https://twitter.com/tweet/1' },
     *     impact: { carbon: 100, water: 200 }
     * }
     */
    if (proofObject.isSet("version") && proofObject.get("version")!.kind === JSONValueKind.NUMBER && proofObject.get("version")!.toI64() == 2) {
        proof.version = 2

        if (proofObject.isSet("proof") && proofObject.get("proof")!.kind === JSONValueKind.OBJECT) {
            const proofData = proofObject.get("proof")!.toObject()
            if (proofData.isSet('image')) {
                proof.proofType = "image"
                proof.proofData = proofData.get("image")!.toString()
            }
            if (proofData.isSet('link')) {
                proof.proofType = "link"
                proof.proofData = proofData.get("link")!.toString()
            }
            if (proofData.isSet('video')) {
                proof.proofType = "video"
                proof.proofData = proofData.get("video")!.toString()
            }
            if (proofData.isSet('text')) {
                proof.proofType = "text"
                proof.proofData = proofData.get("text")!.toString()
            }
        }

        if (proofObject.isSet("description") && proofObject.get("description")!.kind === JSONValueKind.STRING) {
            proof.description = proofObject.get("description")!.toString()
        }

        // not part of the official spec, but kept as backwards compatibility
        if (proofObject.isSet("additional_info") && proofObject.get("additional_info")!.kind === JSONValueKind.STRING) {
            proof.additionalInfo = proofObject.get("additional_info")!.toString()
        }

        if (proofObject.isSet("impact") && proofObject.get("impact")!.kind === JSONValueKind.OBJECT) {
            const impact = proofObject.get("impact")!.toObject()

            if (impact.isSet('carbon') && impact.get('carbon')!.kind === JSONValueKind.NUMBER) { proof.carbon = impact.get('carbon')!.toBigInt() }
            if (impact.isSet('water') && impact.get('water')!.kind === JSONValueKind.NUMBER) { proof.water = impact.get('water')!.toBigInt() }
            if (impact.isSet('energy') && impact.get('energy')!.kind === JSONValueKind.NUMBER) { proof.energy = impact.get('energy')!.toBigInt() }
            if (impact.isSet('waste_mass') && impact.get('waste_mass')!.kind === JSONValueKind.NUMBER) { proof.wasteMass = impact.get('waste_mass')!.toBigInt() }
            if (impact.isSet('plastic') && impact.get('plastic')!.kind === JSONValueKind.NUMBER) { proof.plastic = impact.get('plastic')!.toBigInt() }
            if (impact.isSet('timber') && impact.get('timber')!.kind === JSONValueKind.NUMBER) { proof.timber = impact.get('timber')!.toBigInt() }
            if (impact.isSet('education_time') && impact.get('education_time')!.kind === JSONValueKind.NUMBER) { proof.educationTime = impact.get('education_time')!.toBigInt() }
            if (impact.isSet('trees_planted') && impact.get('trees_planted')!.kind === JSONValueKind.NUMBER) { proof.treesPlanted = impact.get('trees_planted')!.toBigInt() }
            if (impact.isSet('calories_burned') && impact.get('calories_burned')!.kind === JSONValueKind.NUMBER) { proof.caloriesBurned = impact.get('calories_burned')!.toBigInt() }
            if (impact.isSet('sleep_quality_percentage') && impact.get('sleep_quality_percentage')!.kind === JSONValueKind.NUMBER) { proof.sleepQualityPercentage = impact.get('sleep_quality_percentage')!.toBigInt() }
            if (impact.isSet('clean_energy_production') && impact.get('clean_energy_production')!.kind === JSONValueKind.NUMBER) { proof.cleanEnergyProduction = impact.get('clean_energy_production')!.toBigInt() }
        }
    }

    // default proof is version 1
    else {
        proof.version = 1

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

            if (impact.isSet('carbon') && impact.get('carbon')!.kind === JSONValueKind.STRING && isDigitsOnly(impact.get('carbon')!.toString())) { proof.carbon = bigInt.fromString(impact.get('carbon')!.toString()) }
            if (impact.isSet('water') && impact.get('water')!.kind === JSONValueKind.STRING && isDigitsOnly(impact.get('water')!.toString())) { proof.water = bigInt.fromString(impact.get('water')!.toString()) }
            if (impact.isSet('energy') && impact.get('energy')!.kind === JSONValueKind.STRING && isDigitsOnly(impact.get('energy')!.toString())) { proof.energy = bigInt.fromString(impact.get('energy')!.toString()) }
            if (impact.isSet('waste_mass') && impact.get('waste_mass')!.kind === JSONValueKind.STRING && isDigitsOnly(impact.get('waste_mass')!.toString())) { proof.wasteMass = bigInt.fromString(impact.get('waste_mass')!.toString()) }
            if (impact.isSet('waste_items') && impact.get('waste_items')!.kind === JSONValueKind.STRING && isDigitsOnly(impact.get('waste_items')!.toString())) { proof.wasteItems = bigInt.fromString(impact.get('waste_items')!.toString()) }
            if (impact.isSet('people') && impact.get('people')!.kind === JSONValueKind.STRING && isDigitsOnly(impact.get('people')!.toString())) { proof.people = bigInt.fromString(impact.get('people')!.toString()) }
            if (impact.isSet('biodiversity') && impact.get('biodiversity')!.kind === JSONValueKind.STRING && isDigitsOnly(impact.get('biodiversity')!.toString())) { proof.biodiversity = bigInt.fromString(impact.get('biodiversity')!.toString()) }
            if (impact.isSet('plastic') && impact.get('plastic')!.kind === JSONValueKind.STRING && isDigitsOnly(impact.get('plastic')!.toString())) { proof.plastic = bigInt.fromString(impact.get('plastic')!.toString()) }
            if (impact.isSet('timber') && impact.get('timber')!.kind === JSONValueKind.STRING && isDigitsOnly(impact.get('timber')!.toString())) { proof.timber = bigInt.fromString(impact.get('timber')!.toString()) }
        }
    }

    return proof
}


function updateAppSustainability(sustainabilityId: i64, proof: SustainabilityProof): void {
    const appSustainability = new AppSustainability(sustainabilityId)
    appSustainability.round = proof.round
    appSustainability.reward = proof.reward
    appSustainability.carbon = proof.carbon
    appSustainability.water = proof.water
    appSustainability.energy = proof.energy
    appSustainability.wasteMass = proof.wasteMass
    appSustainability.plastic = proof.plastic
    appSustainability.timber = proof.timber
    appSustainability.timestamp = proof.timestamp
    appSustainability.app = proof.app
    appSustainability.account = proof.account
    appSustainability.educationTime = proof.educationTime
    appSustainability.treesPlanted = proof.treesPlanted
    appSustainability.caloriesBurned = proof.caloriesBurned
    appSustainability.sleepQualityPercentage = proof.sleepQualityPercentage
    appSustainability.cleanEnergyProduction = proof.cleanEnergyProduction

    // deprecated entries
    appSustainability.wasteItems = proof.wasteItems
    appSustainability.people = proof.people
    appSustainability.biodiversity = proof.biodiversity


    const app = App.load(proof.app)!
    appSustainability.participantsCount = app.participantsCount

    appSustainability.save()
}

function updateAccountSustainability(proof: SustainabilityProof): boolean[] {
    const id = [proof.account.toHexString(), proof.app.toHexString()].join('/')
    let accountSustainability = AccountSustainability.load(id)
    let isNewParticipant = false
    let isNewRoundParticipant = false

    if (accountSustainability == null) {
        accountSustainability = new AccountSustainability(id)

        accountSustainability.receivedRewards = constants.BIGINT_ZERO
        accountSustainability.carbon = constants.BIGINT_ZERO
        accountSustainability.water = constants.BIGINT_ZERO
        accountSustainability.energy = constants.BIGINT_ZERO
        accountSustainability.wasteMass = constants.BIGINT_ZERO
        accountSustainability.plastic = constants.BIGINT_ZERO
        accountSustainability.timber = constants.BIGINT_ZERO
        accountSustainability.educationTime = constants.BIGINT_ZERO
        accountSustainability.treesPlanted = constants.BIGINT_ZERO
        accountSustainability.caloriesBurned = constants.BIGINT_ZERO
        accountSustainability.sleepQualityPercentage = constants.BIGINT_ZERO
        accountSustainability.cleanEnergyProduction = constants.BIGINT_ZERO
        accountSustainability.account = proof.account
        accountSustainability.app = proof.app

        // deprecated entries
        accountSustainability.wasteItems = constants.BIGINT_ZERO
        accountSustainability.people = constants.BIGINT_ZERO
        accountSustainability.biodiversity = constants.BIGINT_ZERO

        isNewParticipant = true
    }

    accountSustainability.receivedRewards = accountSustainability.receivedRewards.plus(proof.reward)
    accountSustainability.carbon = accountSustainability.carbon.plus(proof.carbon)
    accountSustainability.water = accountSustainability.water.plus(proof.water)
    accountSustainability.energy = accountSustainability.energy.plus(proof.energy)
    accountSustainability.wasteMass = accountSustainability.wasteMass.plus(proof.wasteMass)
    accountSustainability.plastic = accountSustainability.plastic.plus(proof.plastic)
    accountSustainability.timber = accountSustainability.timber.plus(proof.timber)
    accountSustainability.educationTime = accountSustainability.educationTime.plus(proof.educationTime)
    accountSustainability.treesPlanted = accountSustainability.treesPlanted.plus(proof.treesPlanted)
    accountSustainability.caloriesBurned = accountSustainability.caloriesBurned.plus(proof.caloriesBurned)
    accountSustainability.sleepQualityPercentage = accountSustainability.sleepQualityPercentage.plus(proof.sleepQualityPercentage)
    accountSustainability.cleanEnergyProduction = accountSustainability.cleanEnergyProduction.plus(proof.cleanEnergyProduction)

    // deprecated entries
    accountSustainability.wasteItems = accountSustainability.wasteItems.plus(proof.wasteItems)
    accountSustainability.people = accountSustainability.people.plus(proof.people)
    accountSustainability.biodiversity = accountSustainability.biodiversity.plus(proof.biodiversity)

    accountSustainability.save()

    const accountSustainabilityId = [proof.account.toHexString(), proof.app.toHexString(), proof.round].join('/')
    const knownAccount = AccountRoundSustainability.load(accountSustainabilityId)
    if (!knownAccount) {
        isNewRoundParticipant = true
    }
    const accountRoundSustainability = fetchAccountRoundSustainability(proof.account, fetchApp(proof.app), fetchRound(proof.round))

    accountRoundSustainability.receivedRewards = accountRoundSustainability.receivedRewards.plus(proof.reward)
    accountRoundSustainability.carbon = accountRoundSustainability.carbon.plus(proof.carbon)
    accountRoundSustainability.water = accountRoundSustainability.water.plus(proof.water)
    accountRoundSustainability.energy = accountRoundSustainability.energy.plus(proof.energy)
    accountRoundSustainability.wasteMass = accountRoundSustainability.wasteMass.plus(proof.wasteMass)
    accountRoundSustainability.plastic = accountRoundSustainability.plastic.plus(proof.plastic)
    accountRoundSustainability.timber = accountRoundSustainability.timber.plus(proof.timber)
    accountRoundSustainability.educationTime = accountRoundSustainability.educationTime.plus(proof.educationTime)
    accountRoundSustainability.treesPlanted = accountRoundSustainability.treesPlanted.plus(proof.treesPlanted)
    accountRoundSustainability.caloriesBurned = accountRoundSustainability.caloriesBurned.plus(proof.caloriesBurned)
    accountRoundSustainability.sleepQualityPercentage = accountRoundSustainability.sleepQualityPercentage.plus(proof.sleepQualityPercentage)
    accountRoundSustainability.cleanEnergyProduction = accountRoundSustainability.cleanEnergyProduction.plus(proof.cleanEnergyProduction)

    // deprecated entries
    accountRoundSustainability.wasteItems = accountRoundSustainability.wasteItems.plus(proof.wasteItems)
    accountRoundSustainability.people = accountRoundSustainability.people.plus(proof.people)
    accountRoundSustainability.biodiversity = accountRoundSustainability.biodiversity.plus(proof.biodiversity)

    accountRoundSustainability.save()

    return [isNewParticipant, isNewRoundParticipant]
}

function updateAppRoundSummary(transfer: RewardPoolTransfer): void {
    const round = Round.load(transfer.round)!
    const app = App.load(transfer.app)!
    const appRoundSummary = fetchAppRoundSummary(app, round)

    if (transfer.deposit != null) {
        // Check if this deposit is from the X Allocation Pool - if so, don't count it as a deposit
        // since allocations are handled separately by the AllocationRewardsClaimed event handler
        if (transfer.from.equals(Address.fromString("0x4191776f05f4be4848d3f4d587345078b439c7d3"))) {
            // This is an allocation, not a regular deposit - skip counting it here
            // Allocations are tracked in handleAllocationRewardsClaimed
        } else {
            // This is a regular deposit from a user/app
            appRoundSummary.poolDepositsExact = appRoundSummary.poolDepositsExact.plus(transfer.amountExact)
            appRoundSummary.poolDeposits = decimals.toDecimals(appRoundSummary.poolDepositsExact, 18)
        }
    }

    if (transfer.withdraw != null) {
        appRoundSummary.poolWithdrawalsExact = appRoundSummary.poolWithdrawalsExact.plus(transfer.amountExact)
        appRoundSummary.poolWithdrawals = decimals.toDecimals(appRoundSummary.poolWithdrawalsExact, 18)

        // group withdrawals by reason for the app/round summary
        const withdrawal = RewardPoolWithdraw.load(transfer.withdraw!)!
        const withdrawalReasonId = [appRoundSummary.id, withdrawal.reason.toString()].join('/')
        let withdrawalReason = AppRoundWithdrawalReason.load(withdrawalReasonId)
        if (withdrawalReason == null) {
            withdrawalReason = new AppRoundWithdrawalReason(withdrawalReasonId)
            withdrawalReason.appRoundSummary = appRoundSummary.id
            withdrawalReason.reason = withdrawal.reason
            withdrawalReason.amount = constants.BIGDECIMAL_ZERO
            withdrawalReason.amountExact = constants.BIGINT_ZERO
        }

        withdrawalReason.amountExact = withdrawalReason.amountExact.plus(transfer.amountExact)
        withdrawalReason.amount = decimals.toDecimals(withdrawalReason.amountExact, 18)
        withdrawalReason.save()
    }

    if (transfer.distribution != null) {
        appRoundSummary.poolDistributionsExact = appRoundSummary.poolDistributionsExact.plus(transfer.amountExact)
        appRoundSummary.poolDistributions = decimals.toDecimals(appRoundSummary.poolDistributionsExact, 18)
    }

    appRoundSummary.save()
}

export function isDigitsOnly(s: string): boolean {
    for (let i = 0; i < s.length; i++) {
        let charCode = s.charCodeAt(i);
        if (charCode < 48 || charCode > 57) { // charCode 48 = '0', 57 = '9'
            return false;
        }
    }
    return true;
}

export function getCurrentRound(): Round {
    return fetchRound(CurrentRound.load("singleton")!.roundId.toString())
}

export function fetchAppRoundSummary(app: App, round: Round): AppRoundSummary {
    const id = [app.id.toHexString(), round.id].join('/')
    let appRoundSummary = AppRoundSummary.load(id)
    if (appRoundSummary) {
        return appRoundSummary
    }

    appRoundSummary = new AppRoundSummary(id)

    const sustainabilityStats = new SustainabilityStats(id)
    sustainabilityStats.participantsCountStart = app.participantsCount
    sustainabilityStats.actionCount = constants.BIGINT_ZERO
    sustainabilityStats.newUserCount = constants.BIGINT_ZERO
    sustainabilityStats.rewards = constants.BIGINT_ZERO
    sustainabilityStats.carbon = constants.BIGINT_ZERO
    sustainabilityStats.water = constants.BIGINT_ZERO
    sustainabilityStats.energy = constants.BIGINT_ZERO
    sustainabilityStats.wasteMass = constants.BIGINT_ZERO
    sustainabilityStats.plastic = constants.BIGINT_ZERO
    sustainabilityStats.timber = constants.BIGINT_ZERO
    sustainabilityStats.educationTime = constants.BIGINT_ZERO
    sustainabilityStats.treesPlanted = constants.BIGINT_ZERO
    sustainabilityStats.caloriesBurned = constants.BIGINT_ZERO
    sustainabilityStats.sleepQualityPercentage = constants.BIGINT_ZERO
    sustainabilityStats.cleanEnergyProduction = constants.BIGINT_ZERO

    // deprecated entries
    sustainabilityStats.wasteItems = constants.BIGINT_ZERO
    sustainabilityStats.people = constants.BIGINT_ZERO
    sustainabilityStats.biodiversity = constants.BIGINT_ZERO

    appRoundSummary.sustainabilityStats = sustainabilityStats.id
    sustainabilityStats.save()

    appRoundSummary.app = app.id
    appRoundSummary.round = round.id

    appRoundSummary.activeUserCount = constants.BIGINT_ZERO
    appRoundSummary.poolAllocations = constants.BIGDECIMAL_ZERO
    appRoundSummary.poolAllocationsExact = constants.BIGINT_ZERO
    appRoundSummary.poolBalance = app.poolBalance
    appRoundSummary.poolBalanceExact = app.poolBalanceExact
    appRoundSummary.poolDeposits = constants.BIGDECIMAL_ZERO
    appRoundSummary.poolDepositsExact = constants.BIGINT_ZERO
    appRoundSummary.poolWithdrawals = constants.BIGDECIMAL_ZERO
    appRoundSummary.poolWithdrawalsExact = constants.BIGINT_ZERO
    appRoundSummary.poolDistributions = constants.BIGDECIMAL_ZERO
    appRoundSummary.poolDistributionsExact = constants.BIGINT_ZERO
    appRoundSummary.passportScore = constants.BIGINT_ZERO

    return appRoundSummary;
}

export function fetchAccountRoundSustainability(account: Bytes, app: App, round: Round): AccountRoundSustainability {
    const id = [account.toHexString(), app.id.toHexString(), round.id].join('/')
    let accountRoundSustainability = AccountRoundSustainability.load(id)
    if (accountRoundSustainability) {
        return accountRoundSustainability
    }

    accountRoundSustainability = new AccountRoundSustainability(id)

    accountRoundSustainability.passportScore = constants.BIGINT_ZERO
    accountRoundSustainability.receivedRewards = constants.BIGINT_ZERO
    accountRoundSustainability.carbon = constants.BIGINT_ZERO
    accountRoundSustainability.water = constants.BIGINT_ZERO
    accountRoundSustainability.energy = constants.BIGINT_ZERO
    accountRoundSustainability.wasteMass = constants.BIGINT_ZERO
    accountRoundSustainability.plastic = constants.BIGINT_ZERO
    accountRoundSustainability.timber = constants.BIGINT_ZERO
    accountRoundSustainability.educationTime = constants.BIGINT_ZERO
    accountRoundSustainability.treesPlanted = constants.BIGINT_ZERO
    accountRoundSustainability.caloriesBurned = constants.BIGINT_ZERO
    accountRoundSustainability.sleepQualityPercentage = constants.BIGINT_ZERO
    accountRoundSustainability.cleanEnergyProduction = constants.BIGINT_ZERO
    accountRoundSustainability.account = fetchAccount(Address.fromBytes(account)).id
    accountRoundSustainability.app = app.id
    accountRoundSustainability.round = round.id

    // deprecated entries
    accountRoundSustainability.wasteItems = constants.BIGINT_ZERO
    accountRoundSustainability.people = constants.BIGINT_ZERO
    accountRoundSustainability.biodiversity = constants.BIGINT_ZERO

    return accountRoundSustainability
}