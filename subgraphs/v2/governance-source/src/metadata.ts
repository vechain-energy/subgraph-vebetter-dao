import { Bytes, JSONValue, JSONValueKind, TypedMap, dataSource, json } from '@graphprotocol/graph-ts'
import { ProposalMetadataDocument } from '../generated/schema'

export function handleProposalMetadata(content: Bytes): void {
  const metadata = new ProposalMetadataDocument(dataSource.stringParam())
  const value = json.fromBytes(content)
  metadata.rawJson = content.toString()

  if (value.kind != JSONValueKind.OBJECT) {
    metadata.save()
    return
  }

  const object = value.toObject()
  if (object.isSet('grantType')) {
    metadata.proposalType = 'grant'
  } else {
    metadata.proposalType = 'governance'
  }
  metadata.title = readString(object, 'title')
  metadata.shortDescription = readString(object, 'shortDescription')
  metadata.markdownDescription = readString(object, 'markdownDescription')

  metadata.save()
}

function readString(object: TypedMap<string, JSONValue>, key: string): string | null {
  if (!object.isSet(key)) return null
  const value = object.get(key)
  if (value == null || value.kind != JSONValueKind.STRING) return null
  return value.toString()
}
