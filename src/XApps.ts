import {
    AppAdded as AppAddedEvent,
    AppMetadataURIUpdated as AppMetadataURIUpdatedEvent,
    VotingEligibilityUpdated as VotingEligibilityUpdatedEvent,
    XApps
} from '../generated/x2earnapps/XApps'
import { App } from '../generated/schema'
import { Bytes } from "@graphprotocol/graph-ts";
import { AppMetadata as AppMetadataTemplate } from '../generated/templates'

export function handleAppAdded(event: AppAddedEvent): void {
    const app = fetchApp(event.params.id)
    app.name = event.params.name
    app.votingEligibility = event.params.appAvailableForAllocationVoting
    app.save()
}

export function handleAppMetadataURIUpdated(event: AppMetadataURIUpdatedEvent): void {
    const app = fetchApp(event.params.appId)
    const baseURI = XApps.bind(event.address).baseURI();
    app.metadata = event.params.newMetadataURI
    app.metadataURI = [baseURI, event.params.newMetadataURI].join('')
    app.save()

    AppMetadataTemplate.create(event.params.newMetadataURI)
}

export function handleAppVotingEligibilityUpdated(event: VotingEligibilityUpdatedEvent): void {
    const app = fetchApp(event.params.appId)
    app.votingEligibility = event.params.isAvailable
    app.save()
}

export function fetchApp(id: Bytes): App {
    let app = App.load(id)
    if (app == null) {
        app = new App(id)
        app.save()
    }
    return app
}