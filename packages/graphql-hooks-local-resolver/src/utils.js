import {
  buildSchema,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLUnionType
} from 'graphql'

export function makeSchema(schema) {
  if (Array.isArray(schema)) {
    schema = schema.join('\n')
  }

  return buildSchema(schema)
}

export function defineResolvers(schema, resolvers) {
  const rootValue = {}

  for (const name of Object.keys(resolvers)) {
    const type = schema.getType(name)

    if (typeof resolvers[name] === 'function') {
      rootValue[name] = resolvers[name]
    } else if (type instanceof GraphQLObjectType) {
      const fields = type.getFields()
      const resolver = resolvers[name]

      if (resolver.isTypeOf) {
        type.isTypeOf = resolver.isTypeOf
        delete resolver.isTypeOf
      }

      for (const prop of Object.keys(resolver)) {
        //TODO How we should handle the subscription?
        if (name === 'Subscription') {
          fields[prop] = {
            ...fields[prop],
            ...resolver[prop]
          }
        } else if (prop === '__resolveReference') {
          type.resolveReference = resolver[prop]
        } else if (fields[prop]) {
          fields[prop].resolve = resolver[prop]
        } else {
          throw new Error(
            `LocalResolver: Cannot find field ${prop} of type ${type}`
          )
        }
      }
    } else if (
      type instanceof GraphQLScalarType ||
      type instanceof GraphQLEnumType
    ) {
      const resolver = resolvers[name]
      for (const prop of Object.keys(resolver)) {
        type[prop] = resolver[prop]
      }
    } else if (
      type instanceof GraphQLInterfaceType ||
      type instanceof GraphQLUnionType
    ) {
      const resolver = resolvers[name]
      type.resolveType = resolver.resolveType
    } else {
      throw new Error(`LocalResolver: Cannot find type ${name}`)
    }
  }

  return {
    rootValue
  }
}
