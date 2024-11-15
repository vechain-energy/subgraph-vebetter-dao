import {
    AppAdded as AppAddedEvent,
    AppMetadataURIUpdated as AppMetadataURIUpdatedEvent,
    VotingEligibilityUpdated as VotingEligibilityUpdatedEvent,
    AppEndorsed as AppEndorsedEvent,
    AppEndorsementStatusUpdated as AppEndorsementStatusUpdatedEvent,
    XApps,
} from '../generated/x2earnapps/XApps'
import { App, AppEndorsement } from '../generated/schema'
import { Bytes } from "@graphprotocol/graph-ts";
import { AppMetadata as AppMetadataTemplate } from '../generated/templates'
import { constants, transactions } from '@amxx/graphprotocol-utils'

export function handleAppAdded(event: AppAddedEvent): void {
    const app = fetchApp(event.params.id)
    app.name = event.params.name
    app.votingEligibility = event.params.appAvailableForAllocationVoting
    app.createdAtBlockNumber = event.block.number
    app.updatedAtBlockNumber = event.block.number
    app.createdAt = event.block.timestamp
    app.save()
}

export function handleAppMetadataURIUpdated(event: AppMetadataURIUpdatedEvent): void {
    const app = fetchApp(event.params.appId)
    const baseURI = XApps.bind(event.address).baseURI();
    app.metadata = event.params.newMetadataURI
    app.metadataURI = [baseURI, event.params.newMetadataURI].join('')
    app.updatedAtBlockNumber = event.block.number
    app.save()

    AppMetadataTemplate.create(event.params.newMetadataURI)
}

export function handleAppVotingEligibilityUpdated(event: VotingEligibilityUpdatedEvent): void {
    const app = fetchApp(event.params.appId)
    app.votingEligibility = event.params.isAvailable
    app.updatedAtBlockNumber = event.block.number
    app.save()
}

export function handleAppEndorsed(event: AppEndorsedEvent): void {
    const app = fetchApp(event.params.id)
    const id = ['endorsement', event.params.nodeId.toString(), app.id.toHexString()].join('/')
    let endorsement = AppEndorsement.load(id)

    if (!endorsement) {
        endorsement = new AppEndorsement(id)
    }

    endorsement.active = event.params.endorsed
    endorsement.nodeId = event.params.nodeId
    endorsement.app = app.id


    endorsement.emitter = event.address
    endorsement.timestamp = event.block.timestamp
    endorsement.transaction = transactions.log(event).id

    endorsement.save()
}

export function handleAppEndorsementStatusUpdated(event: AppEndorsementStatusUpdatedEvent): void {
    const app = fetchApp(event.params.appId)
    app.endorsed = event.params.endorsed
    app.save()
}

export function fetchApp(id: Bytes): App {
    let app = App.load(id)
    if (app == null) {
        app = new App(id)

        app.endorsed = false
        app.poolAllocations = constants.BIGDECIMAL_ZERO
        app.poolBalance = constants.BIGDECIMAL_ZERO
        app.poolDistributions = constants.BIGDECIMAL_ZERO
        app.poolWithdrawals = constants.BIGDECIMAL_ZERO
        app.poolDeposits = constants.BIGDECIMAL_ZERO

        app.poolAllocationsExact = constants.BIGINT_ZERO
        app.poolBalanceExact = constants.BIGINT_ZERO
        app.poolDistributionsExact = constants.BIGINT_ZERO
        app.poolWithdrawalsExact = constants.BIGINT_ZERO
        app.poolDepositsExact = constants.BIGINT_ZERO
        app.createdAtBlockNumber = constants.BIGINT_ZERO
        app.updatedAtBlockNumber = constants.BIGINT_ZERO
        app.createdAt = constants.BIGINT_ZERO
        app.participantsCount = constants.BIGINT_ZERO
        app.save()
    }
    return app
}
