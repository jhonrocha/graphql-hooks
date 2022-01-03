import { execute, parse } from 'graphql'
import { GraphQLClient } from 'graphql-hooks'
import { defineResolvers, makeSchema, updateDynamicFieldsArgs } from './utils'

/* istanbul ignore next */
const noop = () => {}

export class GraphQLMockClient extends GraphQLClient {
  constructor(config = {}) {
    super(
      config.url
        ? config
        : {
            url: '/graphql',
            fetch: noop,
            ...config
          }
    )

    this.fallback = Boolean(config.url)

    const { resolvers } = config

    const schema = makeSchema(config.schema, resolvers && resolvers.Mutation)
    const { dynamicFields, rootValue } = defineResolvers(schema, resolvers)

    this.schema = schema
    this.rootValue = rootValue
    this.dynamicFields = dynamicFields
  }

  async request(operation, options = {}) {
    const queryAst = parse(operation.query)

    updateDynamicFieldsArgs(this.schema, this.dynamicFields, queryAst)

    const execution = await execute({
      schema: this.schema,
      document: queryAst,
      rootValue: this.rootValue,
      variableValues: operation.variables,
      operationName: operation.operationName
    })

    // TODO Better error checking
    if (execution.data === null && this.fallback) {
      return super.request.call(this, operation, options)
    }

    return this.generateResult({
      graphQLErrors: execution.errors,
      data: execution.data
    })
  }
}
