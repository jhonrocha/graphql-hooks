import { GraphQLMockClient } from '../src/index'

describe('GraphQLMockClient - no schema', () => {
  it('matches the query', async () => {
    const variables = {
      data: {
        some: 'data'
      }
    }

    const client = new GraphQLMockClient({
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

  it("doesn't clean the result", async () => {
    const client = new GraphQLMockClient({
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
          first: 1,
          second: 2
        }
      }
    })
  })

  it('matches when operationName is provided', async () => {
    const client = new GraphQLMockClient({
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
    const client = new GraphQLMockClient({
      resolvers: {
        Mutation: {
          value: () => 1
        }
      }
    })

    const mutationResult = await client.request({
      query: `
        mutation ($data: Any) {
          value(data: $data)
        }
      `
    })

    expect(mutationResult).toEqual({
      data: {
        value: 1
      }
    })
  })
})
