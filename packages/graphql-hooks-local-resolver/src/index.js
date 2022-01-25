import { execute, validate, parse } from 'graphql'
import { defineResolvers, makeSchema } from './utils'

export class LocalResolver {
  constructor(config = {}) {
    const { resolvers } = config

    const schema = makeSchema(config.schema, resolvers && resolvers.Mutation)
    const { rootValue } = defineResolvers(schema, resolvers)

    this.schema = schema
    this.rootValue = rootValue
  }

  resolve(operation) {
    const queryAst = parse(operation.query)

    const validationErrors = validate(this.schema, queryAst)

    if (validationErrors.length) {
      return Promise.resolve({
        errors: validationErrors
      })
    }

    return execute({
      schema: this.schema,
      document: queryAst,
      rootValue: this.rootValue,
      variableValues: operation.variables,
      operationName: operation.operationName
    })
  }
}
