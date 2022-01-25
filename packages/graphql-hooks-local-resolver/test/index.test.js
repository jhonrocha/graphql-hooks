import { LocalResolver } from '../src/index'
import { GraphQLClient } from 'graphql-hooks'

describe('GraphQLMockClient - with schema', () => {
  it('matches the query', async () => {
    const variables = {
      data: {
        some: 'data'
      }
    }

    const client = new GraphQLClient({
      local: new LocalResolver({
        schema: `
          input InputType { some: String! }
          type Query {
            value(data: InputType): Int
          }
        `,
        resolvers: {
          Query: {
            value: (_, v) => {
              expect(v).toEqual(variables)

              return 1
            }
          }
        }
      })
    })

    const result = await client.request({
      query: `
        query($data: InputType) {
          value(data: $data)
        }
      `,
      variables
    })

    expect(result).toEqual({
      data: {
        value: 1
      }
    })
  })

  it('cleans the result', async () => {
    const client = new GraphQLClient({
      local: new LocalResolver({
        schema: `
        type Result {
          first: Int,
          second: Int
        }
  
        type Query {
          value: Result
        }
      `,
        resolvers: {
          Query: {
            value: () => ({
              first: 1,
              second: 2
            })
          }
        }
      })
    })

    const result = await client.request({
      query: `
        query {
          value {
            first
          }
        }
      `
    })

    expect(result).toEqual({
      data: {
        value: {
          first: 1
        }
      }
    })
  })

  it('matches when operationName is provided', async () => {
    const client = new GraphQLClient({
      local: new LocalResolver({
        schema: `
          type Query {
            value: Int
          }
        `,
        resolvers: {
          Query: {
            value: () => 1
          }
        }
      })
    })

    const result = await client.request({
      query: `
        query ActiveQuery {
          value
        }

        query NotEnabled {
          value
        }
      `,
      operationName: 'ActiveQuery'
    })

    expect(result).toEqual({
      data: {
        value: 1
      }
    })
  })

  it('matches the mutation', async () => {
    const variables = {
      data: {
        some: 'data'
      }
    }

    const client = new GraphQLClient({
      local: new LocalResolver({
        schema: `
          input InputType { some: String! }

          type Query {
            value(data: InputType): Int
          }

          type Mutation {
            value(data: InputType): Int
          }
        `,
        resolvers: {
          Mutation: {
            value: (_, v) => {
              expect(v).toEqual(variables)

              return 1
            }
          }
        }
      })
    })

    const mutationResult = await client.request({
      query: `
        mutation ($data: InputType) {
          value(data: $data)
        }
      `,
      variables
    })

    expect(mutationResult).toEqual({
      data: {
        value: 1
      }
    })
  })
})
