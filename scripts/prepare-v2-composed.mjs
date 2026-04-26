import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const composedDir = path.join(root, 'subgraphs/v2/dao-v2-composed')
const configPath = path.join(composedDir, 'source-deployments.json')
const examplePath = path.join(composedDir, 'source-deployments.example.json')

if (!fs.existsSync(configPath)) {
  throw new Error(`you need to copy ${relative(examplePath)} to ${relative(configPath)} and set all source deployment IDs`)
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const appsSource = readDeployment(config, 'appsSource')
const rewardsSource = readDeployment(config, 'rewardsSource')
const tokensSource = readDeployment(config, 'tokensSource')
const governanceSource = readDeployment(config, 'governanceSource')
const identitySource = readDeployment(config, 'identitySource')

writeTemplate('subgraph.template.yaml', 'subgraph.yaml', {
  __APPS_SOURCE_DEPLOYMENT__: appsSource,
  __REWARDS_SOURCE_DEPLOYMENT__: rewardsSource,
  __TOKENS_SOURCE_DEPLOYMENT__: tokensSource,
  __GOVERNANCE_SOURCE_DEPLOYMENT__: governanceSource,
  __IDENTITY_SOURCE_DEPLOYMENT__: identitySource,
})

writeTemplate('src/mapping.template.ts', 'src/mapping.ts', {
  __APPS_SOURCE_MODULE__: `subgraph-${appsSource}`,
  __REWARDS_SOURCE_MODULE__: `subgraph-${rewardsSource}`,
  __TOKENS_SOURCE_MODULE__: `subgraph-${tokensSource}`,
  __GOVERNANCE_SOURCE_MODULE__: `subgraph-${governanceSource}`,
  __IDENTITY_SOURCE_MODULE__: `subgraph-${identitySource}`,
})

function readDeployment(config, key) {
  const value = config[key]
  if (typeof value !== 'string' || value.length === 0 || value.startsWith('QmReplace')) {
    throw new Error(`you need to set ${key} in subgraphs/v2/dao-v2-composed/source-deployments.json`)
  }
  return value
}

function writeTemplate(templateName, outputName, replacements) {
  const templatePath = path.join(composedDir, templateName)
  const outputPath = path.join(composedDir, outputName)
  let content = fs.readFileSync(templatePath, 'utf8')
  for (const [needle, replacement] of Object.entries(replacements)) {
    content = content.split(needle).join(replacement)
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, content)
}

function relative(file) {
  return path.relative(root, file)
}
