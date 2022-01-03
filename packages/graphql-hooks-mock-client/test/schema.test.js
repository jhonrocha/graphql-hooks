import { GraphQLMockClient } from '../src/index'

describe('GraphQLMockClient - with schema', () => {
  it('matches the query', async () => {
    const variables = {
      data: {
        some: 'data'
      }
    }

    const client = new GraphQLMockClient({
      schema: `
        type Query {
          value(data: Any): Int
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

    const result = await client.request({
      query: `
        query($data: Any) {
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
    const client = new GraphQLMockClient({
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
    const client = new GraphQLMockClient({
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

    const result = await client.request({
      query: `
        query ActiveQuery {
          value
        }

        query NotEnabled {
          notEnabled
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

    const client = new GraphQLMockClient({
      schema: `
        type Mutation {
          value(data: Any): Int
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

    const mutationResult = await client.request({
      query: `
        mutation ($data: Any) {
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
