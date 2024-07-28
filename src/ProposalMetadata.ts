import { json, Bytes, dataSource } from '@graphprotocol/graph-ts'
import { ProposalMetadata } from '../generated/schema'

export function handleDescription(content: Bytes): void {
    const metadata = new ProposalMetadata(dataSource.stringParam())
    const value = json.fromBytes(content).toObject()
    if (value) {
        const title = value.get('title')
        const shortDescription = value.get('shortDescription')
        const markdownDescription = value.get('markdownDescription')

        metadata.title = title ? title.toString() : null
        metadata.shortDescription = shortDescription ? shortDescription.toString() : null
        metadata.markdownDescription = markdownDescription ? markdownDescription.toString() : null
        metadata.save()
    }
}
