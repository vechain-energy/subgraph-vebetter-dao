const graphNodeUrl = process.env.GRAPH_NODE_URL

if (!graphNodeUrl) {
  fail('you need to set GRAPH_NODE_URL')
}

const endpoint = process.env.GRAPH_ADMIN_GRAPHQL_URL || statusEndpointFromGraphNode(graphNodeUrl)
const currentOnly = process.argv.includes('--current')
const names = [
  'vebetter/dao-dev-v2',
  'vebetter/dao-dev-v2-apps-source',
  'vebetter/dao-dev-v2-rewards-source',
  'vebetter/dao-dev-v2-apps-rewards-source',
  'vebetter/dao-dev-v2-tokens-source',
  'vebetter/dao-dev-v2-governance-source',
  'vebetter/dao-dev-v2-passport-source',
  'vebetter/dao-dev-v2-nodes-lock-source',
  'vebetter/dao-dev-v2-identity-source',
]

const rows = []

for (const name of names) {
  const statuses = await fetchStatuses(endpoint, name)
  const visibleStatuses = currentOnly ? [statuses.current].filter(Boolean) : statuses.all
  if (visibleStatuses.length === 0) {
    rows.push({
      name,
      version: 'missing',
      deployment: '',
      health: 'not found',
      synced: '',
      items: '',
      latest: '',
      head: '',
      error: '',
    })
    continue
  }

  for (const status of visibleStatuses) {
    const chain = status?.chains?.[0]
    rows.push({
      name,
      version: versionLabel(status, statuses.current),
      deployment: status?.subgraph || '',
      health: status?.health || 'unknown',
      synced: status?.synced === true ? 'yes' : 'no',
      items: formatCount(status?.entityCount),
      latest: chain?.latestBlock?.number || '',
      head: chain?.chainHeadBlock?.number || '',
      error: truncate(status?.fatalError?.message || '', 140),
    })
  }
}

printRows(rows)

function statusEndpointFromGraphNode(value) {
  const url = new URL(value)
  url.hostname = url.hostname.replace(/^admin\./, '')
  url.port = ''
  url.pathname = '/graphql'
  url.search = ''
  url.hash = ''
  return url.toString()
}

async function fetchStatuses(endpointUrl, name) {
  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: `
        query Status($name: String!) {
          current: indexingStatusForCurrentVersion(subgraphName: $name) {
            subgraph
            synced
            health
            entityCount
            node
            fatalError { message }
            chains {
              network
              latestBlock { number }
              chainHeadBlock { number }
            }
          }
          all: indexingStatusesForSubgraphName(subgraphName: $name) {
            subgraph
            synced
            health
            entityCount
            node
            fatalError { message }
            chains {
              network
              latestBlock { number }
              chainHeadBlock { number }
            }
          }
        }
      `,
      variables: { name },
    }),
  })

  if (!response.ok) {
    fail(`status query failed: ${response.status} ${response.statusText}`)
  }

  const body = await response.json()
  if (body.errors?.length) {
    fail(body.errors.map((error) => error.message).join('\n'))
  }

  return {
    current: body.data.current,
    all: sortStatuses(body.data.all || [], body.data.current),
  }
}

function formatCount(value) {
  if (!value) {
    return ''
  }

  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function versionLabel(status, current) {
  if (!status) {
    return ''
  }

  if (current?.subgraph === status.subgraph) {
    return 'current'
  }

  if (status.node) {
    return 'pending'
  }

  return 'old'
}

function sortStatuses(statuses, current) {
  return statuses.sort((left, right) => {
    const leftRank = statusRank(left, current)
    const rightRank = statusRank(right, current)
    if (leftRank !== rightRank) {
      return leftRank - rightRank
    }

    return String(left.subgraph).localeCompare(String(right.subgraph))
  })
}

function statusRank(status, current) {
  if (current?.subgraph === status.subgraph) {
    return 0
  }

  if (status.node) {
    return 1
  }

  if (status.health === 'failed') {
    return 2
  }

  return 3
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 3)}...`
}

function printRows(rows) {
  const headers = ['name', 'version', 'health', 'synced', 'items', 'latest', 'head', 'deployment', 'error']
  const widths = Object.fromEntries(headers.map((header) => [header, header.length]))

  for (const row of rows) {
    for (const header of headers) {
      widths[header] = Math.max(widths[header], String(row[header]).length)
    }
  }

  const line = headers.map((header) => header.padEnd(widths[header])).join('  ')
  console.log(line)
  console.log(headers.map((header) => '-'.repeat(widths[header])).join('  '))

  for (const row of rows) {
    console.log(headers.map((header) => String(row[header]).padEnd(widths[header])).join('  '))
  }
}

function fail(message) {
  console.error(message)
  process.exit(1)
}
