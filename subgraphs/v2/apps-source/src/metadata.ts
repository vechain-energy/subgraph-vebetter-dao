import {
  Bytes,
  JSONValue,
  JSONValueKind,
  TypedMap,
  dataSource,
  json,
} from '@graphprotocol/graph-ts'
import { AppMetadataDocument } from '../generated/schema'

export function handleAppMetadata(content: Bytes): void {
  const metadata = new AppMetadataDocument(dataSource.stringParam())
  metadata.rawJson = content.toString()

  const value = json.fromBytes(content)
  if (value.kind != JSONValueKind.OBJECT) {
    metadata.save()
    return
  }

  const object = value.toObject()
  const name = readString(object, 'name')
  const title = readString(object, 'title')
  metadata.title = name == null ? title : name
  metadata.description = readString(object, 'description')
  metadata.externalUrl = readString(object, 'external_url')
  metadata.logoUrl = readString(object, 'logo')
  metadata.bannerUrl = readString(object, 'banner')
  metadata.save()
}

function readString(object: TypedMap<string, JSONValue>, key: string): string | null {
  if (!object.isSet(key)) return null
  const value = object.get(key)
  if (value == null || value.kind != JSONValueKind.STRING) return null
  return value.toString()
}
