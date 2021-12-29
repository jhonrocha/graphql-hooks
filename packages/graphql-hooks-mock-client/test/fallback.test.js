import { GraphQLMockClient } from '../src/index'

describe('GraphQLMockClient, fallbackOnFetch: true', () => {
  const client = new GraphQLMockClient({
    fallbackOnFetch: true,
    url: '/graphql',
    fetch: () => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'ok' })
      })
    },
    mocks: {
      query: {
        GetVariables(operation) {
          return { data: { getVariables: operation.variables } }
        }
      },
      mutation: {
        SetVariables(operation) {
          return { data: { setVariables: operation.variables } }
        }
      }
    }
  })

  it('matches the query GetVariables', async () => {
    const variables = { value: 1 }

    const result = await client.request({
      query: `
        query GetVariables($data: Variables) {
          variables(data: $variables) {
            value
          }
        }
      `,
      variables
    })

    expect(result).toEqual({
      data: {
        getVariables: variables
      }
    })
  })

  it('fallback to fatch when there is no match', async () => {
    const result = await client.request({
      query: `
        mutation GetVariables($data: Variables) {
          variables(data: $variables) {
            value
          }
        }
      `
    })

    expect(result).toEqual({
      data: 'ok'
    })
  })

  it('fallback to fatch when the operation name is not provided', async () => {
    const result = await client.request({
      query: `
        query {
          variables {
            value
          }
        }
      `
    })

    expect(result).toEqual({
      data: 'ok'
    })
  })

  it('throws when the query is not valid', async () => {
    expect(() =>
      client.request({
        query: `
          error {
            variables {
              value
            }
          }
        `
      })
    ).toThrow(`Syntax Error: Unexpected Name "error"`)
  })
})
