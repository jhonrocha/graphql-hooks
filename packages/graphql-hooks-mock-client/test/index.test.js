import { GraphQLMockClient } from '../index'

describe('GraphQLMockClient', () => {
  const client = new GraphQLMockClient({
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
          getVariables(data: $variables) {
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

  it('matches the mutation SetVariables', async () => {
    const variables = { value: 1 }

    const mutationResult = await client.request({
      query: `
        mutation SetVariables($data: Variables) {
          setVariables(data: $variables) {
            value
          }
        }
      `,
      variables
    })

    expect(mutationResult).toEqual({
      data: {
        setVariables: variables
      }
    })
  })

  it('throws when there is no match', async () => {
    expect(() =>
      client.request({
        query: `
          mutation GetVariables($data: Variables) {
            variables(data: $variables) {
              value
            }
          }
        `
      })
    ).toThrow(/couldn't match any mocks for "mutation GetVariables"/)
  })

  it('throws when the operation name is not provided', async () => {
    expect(() =>
      client.request({
        query: `
          query {
            variables {
              value
            }
          }
        `
      })
    ).toThrow(/the provided query doesn't have a name/)
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
