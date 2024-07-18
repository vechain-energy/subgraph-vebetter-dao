import { json, Bytes, dataSource, log } from '@graphprotocol/graph-ts'
import { AppMetadata } from '../generated/schema'

export function handleDescription(content: Bytes): void {
    const metadata = new AppMetadata(dataSource.stringParam())
    const value = json.fromBytes(content).toObject()
    if (value) {
        const title = value.get('title')
        const name = value.get('name')
        const description = value.get('description')
        const externalUrl = value.get('external_url')
        const logoUrl = value.get('logo')
        const bannerUrl = value.get('banner')

        metadata.title = name ? name.toString() : title ? title.toString() : null
        metadata.description = description ? description.toString() : null
        metadata.externalUrl = externalUrl ? externalUrl.toString() : null
        metadata.logoUrl = logoUrl ? logoUrl.toString() : null
        metadata.bannerUrl = bannerUrl ? bannerUrl.toString() : null
        metadata.save()
    }
}