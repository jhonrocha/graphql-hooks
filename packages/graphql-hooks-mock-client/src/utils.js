import {
  visit,
  buildSchema,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  Kind,
  typeFromAST
} from 'graphql'

const Any = new GraphQLScalarType({
  name: 'Any'
})

const anyField = (name, resolve) => ({
  name,
  args: [],
  resolve,
  type: Any
})

export function makeSchema(schema, withMutations) {
  if (Array.isArray(schema)) {
    schema = schema.join('\n')
  }

  if (typeof schema === 'string') {
    schema = buildSchema(`
        scalar Any

        type _FillTypeMap {
            int: Int,
            float: Float,
            string: String,
            boolean: Boolean,
            id: ID
        }

        ${!schema.includes('Query') ? `type Query { _: Any }` : ``}

        ${schema}
    `)
  } else if (!schema) {
    schema = buildSchema(`
        scalar Any

        type _FillTypeMap {
            int: Int,
            float: Float,
            string: String,
            boolean: Boolean,
            id: ID
        }

        type Query { _: Any }

        ${withMutations ? `type Mutation { _: Any }` : ``}
    `)
  }

  return schema
}

export function defineResolvers(schema, resolvers) {
  const rootValue = {}
  const dynamicFields = {}

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
          fields[prop] = anyField(prop, resolver[prop])

          if (type.name === 'Query' || type.name === 'Mutation') {
            dynamicFields[prop] = fields[prop]
          }
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
      //TODO Better errors
      throw new Error(`Cannot find type ${name}`)
    }
  }

  return {
    dynamicFields,
    rootValue
  }
}

export function updateDynamicFieldsArgs(schema, dynamicFields, queryAST) {
  visit(queryAST, {
    [Kind.SELECTION_SET]({ selections }) {
      for (const selection of selections) {
        const field = dynamicFields[selection.name.value]

        if (field) {
          for (const argument of selection.arguments) {
            if (
              !field.args.some(item => item.name.value === argument.name.value)
            ) {
              field.args.push({
                type: resolveVarType(schema, queryAST, argument),
                name: argument.name.value
              })
            }
          }
        }
      }
    }
  })
}

function resolveVarType(schema, queryAST, argument) {
  let result

  visit(queryAST, {
    [Kind.VARIABLE_DEFINITION]({ variable, type }) {
      if (variable.name.value === argument.name.value) {
        result = typeFromAST(schema, type)
      }
    }
  })

  return result
}
