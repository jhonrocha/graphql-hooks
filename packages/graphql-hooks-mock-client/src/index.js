import { GraphQLClient } from 'graphql-hooks'
import { parse } from 'graphql'

const getQueryInfo = query => {
  const operationDef = parse(query).definitions.find(def => {
    return def.kind === 'OperationDefinition'
  })

  return {
    type: operationDef.operation,
    name: operationDef.name && operationDef.name.value
  }
}

/* istanbul ignore next */
const noop = () => {}

export class GraphQLMockClient extends GraphQLClient {
  constructor(config = {}) {
    super(
      config.fallbackOnFetch
        ? config
        : {
            url: '/graphql',
            fetch: noop,
            ...config
          }
    )

    if (!config.mocks || typeof config.mocks !== 'object') {
      throw new Error('GraphQLMockClient: config.mocks must be an object')
    }

    this.mocks = config.mocks
    this.fallbackOnFetch = config.fallbackOnFetch
  }

  request(operation, options = {}) {
    const info = getQueryInfo(operation.query)

    if (info !== null && info.name && this.mocks[info.type]) {
      const mock = this.mocks[info.type][info.name]

      if (mock) {
        const result = mock(
          { query: operation.query, variables: operation.variables },
          options
        )

        return Promise.resolve(result)
      }
    }

    if (!this.fallbackOnFetch) {
      if (!info.name) {
        throw new Error(
          `GraphQLMockClient: the provided ${info.type} doesn't have a name, if this is intended enable the fallbackOnFetch option`
        )
      }

      throw new Error(
        `GraphQLMockClient: couldn't match any mocks for "${info.type} ${info.name}", if this is intended enable the fallbackOnFetch option`
      )
    }

    return super.request.call(this, operation, options)
  }
}
