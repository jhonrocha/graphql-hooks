import { GraphQLClient } from 'graphql-hooks'
import { parse } from 'graphql'

const getQueryInfo = ({ query, operationName }) => {
  const defs = parse(query).definitions.filter(def => {
    if (def.kind === 'OperationDefinition') {
      if (!operationName) return def.kind === 'OperationDefinition'

      return def.name && def.name.value === operationName
    }

    return false
  })

  if (defs.length > 1) {
    return {
      error: new Error(
        `GraphQLMockClient: multiple operations are defined inside the query. Please provide an operationName`
      )
    }
  }

  if (defs.length === 0) {
    return {
      error: new Error(
        `GraphQLMockClient: there is no ${operationName} operation inside the query`
      )
    }
  }

  const type = defs[0].operation
  const name = defs[0].name && defs[0].name.value

  if (!name) {
    return {
      error: new Error(
        `GraphQLMockClient: the provided ${type} doesn't have a name, if this is intended enable the fallbackOnFetch option`
      )
    }
  }

  return {
    type,
    name
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
    const info = getQueryInfo(operation)

    if (!info.error && this.mocks[info.type]) {
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
      if (info.error) {
        throw info.error
      }

      throw new Error(
        `GraphQLMockClient: couldn't match any mocks for "${info.type} ${info.name}", if this is intended enable the fallbackOnFetch option`
      )
    }

    return super.request.call(this, operation, options)
  }
}
