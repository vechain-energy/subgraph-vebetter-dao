import { json, Bytes, dataSource } from '@graphprotocol/graph-ts'
import { ProposalMetadata } from '../generated/schema'

export function handleDescription(content: Bytes): void {
    const metadata = new ProposalMetadata(dataSource.stringParam())
    
    // Store raw JSON as string for client-side parsing
    metadata.rawJson = content.toString()
    
    const value = json.fromBytes(content).toObject()
    if (value) {
        // Detect grant proposals by checking for grantType field
        const grantType = value.get('grantType')
        if (grantType) {
            metadata.type = 'grant'
        } else {
            metadata.type = 'governance'
        }
        
        // Extract common fields (both formats use title and shortDescription)
        const title = value.get('title')
        const shortDescription = value.get('shortDescription')
        const markdownDescription = value.get('markdownDescription')

        metadata.title = title ? title.toString() : null
        metadata.shortDescription = shortDescription ? shortDescription.toString() : null
        metadata.markdownDescription = markdownDescription ? markdownDescription.toString() : null
        metadata.save()
    }
}
