import {
  BigInt,
  Bytes,
  JSONValue,
  JSONValueKind,
  TypedMap,
  dataSource,
  json,
} from '@graphprotocol/graph-ts'
import {
  AppMetadataDocument,
  SustainabilityProofDocument,
} from '../generated/schema'

const ZERO = BigInt.fromI32(0)

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

export function handleSustainabilityProof(content: Bytes): void {
  const context = dataSource.context()
  saveProofFromValue(
    dataSource.stringParam(),
    json.fromBytes(content),
    content.toString(),
    context.get('transfer')!.toBytes(),
    context.get('app')!.toBytes(),
    context.get('round')!.toString(),
    context.get('account')!.toBytes(),
    context.get('rewardExact')!.toBigInt(),
    context.get('blockNumber')!.toBigInt(),
    context.get('timestamp')!.toBigInt(),
    context.get('txHash')!.toBytes(),
    context.get('logIndex')!.toBigInt(),
    context.get('emitter')!.toBytes(),
  )
}

export function saveInlineSustainabilityProof(
  id: string,
  rawJson: string,
  app: Bytes,
  transfer: Bytes,
  round: string,
  account: Bytes,
  rewardExact: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt,
  txHash: Bytes,
  logIndex: BigInt,
  emitter: Bytes,
): void {
  const parsed = json.try_fromString(rawJson)
  if (parsed.isError) {
    return
  }
  saveProofFromValue(id, parsed.value, rawJson, transfer, app, round, account, rewardExact, blockNumber, timestamp, txHash, logIndex, emitter)
}

function saveProofFromValue(
  id: string,
  value: JSONValue,
  rawJson: string,
  transfer: Bytes,
  app: Bytes,
  round: string,
  account: Bytes,
  rewardExact: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt,
  txHash: Bytes,
  logIndex: BigInt,
  emitter: Bytes,
): void {
  const proof = new SustainabilityProofDocument(id)
  proof.transfer = transfer
  proof.app = app
  proof.round = round
  proof.account = account
  proof.rewardExact = rewardExact
  proof.blockNumber = blockNumber
  proof.timestamp = timestamp
  proof.txHash = txHash
  proof.logIndex = logIndex
  proof.emitter = emitter
  proof.rawJson = rawJson
  proof.carbon = ZERO
  proof.water = ZERO
  proof.energy = ZERO
  proof.wasteMass = ZERO
  proof.plastic = ZERO
  proof.timber = ZERO
  proof.educationTime = ZERO
  proof.treesPlanted = ZERO
  proof.caloriesBurned = ZERO
  proof.sleepQualityPercentage = ZERO
  proof.cleanEnergyProduction = ZERO
  proof.wasteItems = ZERO
  proof.people = ZERO
  proof.biodiversity = ZERO
  proof.version = 0

  if (value.kind == JSONValueKind.OBJECT) {
    applyProofObject(proof, value.toObject())
  }

  proof.save()
}

function applyProofObject(proof: SustainabilityProofDocument, object: TypedMap<string, JSONValue>): void {
  const version = readI64(object, 'version')
  if (version == 2) {
    proof.version = 2
    applyProofV2(proof, object)
    return
  }

  proof.version = 1
  applyProofV1(proof, object)
}

function applyProofV2(proof: SustainabilityProofDocument, object: TypedMap<string, JSONValue>): void {
  if (object.isSet('proof')) {
    const proofValue = object.get('proof')
    if (proofValue != null && proofValue.kind == JSONValueKind.OBJECT) {
      const proofObject = proofValue.toObject()
      setFirstProofData(proof, proofObject, 'image')
      setFirstProofData(proof, proofObject, 'link')
      setFirstProofData(proof, proofObject, 'video')
      setFirstProofData(proof, proofObject, 'text')
    }
  }

  proof.description = readString(object, 'description')
  proof.additionalInfo = readString(object, 'additional_info')

  if (object.isSet('impact')) {
    const impactValue = object.get('impact')
    if (impactValue != null && impactValue.kind == JSONValueKind.OBJECT) {
      const impact = impactValue.toObject()
      proof.carbon = readNumberAsBigInt(impact, 'carbon')
      proof.water = readNumberAsBigInt(impact, 'water')
      proof.energy = readNumberAsBigInt(impact, 'energy')
      proof.wasteMass = readNumberAsBigInt(impact, 'waste_mass')
      proof.plastic = readNumberAsBigInt(impact, 'plastic')
      proof.timber = readNumberAsBigInt(impact, 'timber')
      proof.educationTime = readNumberAsBigInt(impact, 'education_time')
      proof.treesPlanted = readNumberAsBigInt(impact, 'trees_planted')
      proof.caloriesBurned = readNumberAsBigInt(impact, 'calories_burned')
      proof.sleepQualityPercentage = readNumberAsBigInt(impact, 'sleep_quality_percentage')
      proof.cleanEnergyProduction = readNumberAsBigInt(impact, 'clean_energy_production')
    }
  }
}

function applyProofV1(proof: SustainabilityProofDocument, object: TypedMap<string, JSONValue>): void {
  if (object.isSet('proof')) {
    const proofValue = object.get('proof')
    if (proofValue != null && proofValue.kind == JSONValueKind.OBJECT) {
      const proofObject = proofValue.toObject()
      proof.proofType = readString(proofObject, 'proof_type')
      proof.proofData = readString(proofObject, 'proof_data')
    }
  }

  if (object.isSet('metadata')) {
    const metadataValue = object.get('metadata')
    if (metadataValue != null && metadataValue.kind == JSONValueKind.OBJECT) {
      const metadata = metadataValue.toObject()
      proof.description = readString(metadata, 'description')
      proof.additionalInfo = readString(metadata, 'additional_info')
    }
  }

  if (object.isSet('impact')) {
    const impactValue = object.get('impact')
    if (impactValue != null && impactValue.kind == JSONValueKind.OBJECT) {
      const impact = impactValue.toObject()
      proof.carbon = readDigitsAsBigInt(impact, 'carbon')
      proof.water = readDigitsAsBigInt(impact, 'water')
      proof.energy = readDigitsAsBigInt(impact, 'energy')
      proof.wasteMass = readDigitsAsBigInt(impact, 'waste_mass')
      proof.wasteItems = readDigitsAsBigInt(impact, 'waste_items')
      proof.people = readDigitsAsBigInt(impact, 'people')
      proof.biodiversity = readDigitsAsBigInt(impact, 'biodiversity')
      proof.plastic = readDigitsAsBigInt(impact, 'plastic')
      proof.timber = readDigitsAsBigInt(impact, 'timber')
    }
  }
}

function setFirstProofData(proof: SustainabilityProofDocument, object: TypedMap<string, JSONValue>, key: string): void {
  if (proof.proofData != null || !object.isSet(key)) {
    return
  }
  const value = readString(object, key)
  if (value == null) {
    return
  }
  proof.proofType = key
  proof.proofData = value
}

function readString(object: TypedMap<string, JSONValue>, key: string): string | null {
  if (!object.isSet(key)) return null
  const value = object.get(key)
  if (value == null || value.kind != JSONValueKind.STRING) return null
  return value.toString()
}

function readI64(object: TypedMap<string, JSONValue>, key: string): i64 {
  if (!object.isSet(key)) return 0
  const value = object.get(key)
  if (value == null || value.kind != JSONValueKind.NUMBER) return 0
  return value.toI64()
}

function readNumberAsBigInt(object: TypedMap<string, JSONValue>, key: string): BigInt {
  if (!object.isSet(key)) return ZERO
  const value = object.get(key)
  if (value == null || value.kind != JSONValueKind.NUMBER) return ZERO
  const parts = value.toF64().toString().split('.')
  return BigInt.fromString(parts[0])
}

function readDigitsAsBigInt(object: TypedMap<string, JSONValue>, key: string): BigInt {
  const value = readString(object, key)
  if (value == null) return ZERO
  const digits = value as string
  if (!isDigitsOnly(digits)) return ZERO
  return BigInt.fromString(digits)
}

function isDigitsOnly(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code < 48 || code > 57) return false
  }
  return true
}
