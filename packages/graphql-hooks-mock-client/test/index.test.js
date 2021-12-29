import { GraphQLMockClient } from '../src/index'

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

  it('matches when operationName is provided', async () => {
    const variables = { value: 1 }

    const result = await client.request({
      query: `
        query GetVariables($data: Variables) {
          getVariables(data: $variables) {
            value
          }
        }

        mutation SetVariables($data: Variables) {
          setVariables(data: $variables) {
            value
          }
        }
      `,
      variables,
      operationName: 'GetVariables'
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

  it('throws when there are multiple operations', async () => {
    expect(() =>
      client.request({
        query: `
          query GetVariables($data: Variables) {
            getVariables(data: $variables) {
              value
            }
          }

          mutation SetVariables($data: Variables) {
            setVariables(data: $variables) {
              value
            }
          }
        `
      })
    ).toThrow(/multiple operations are defined inside the query/)
  })

  it('throws when there is no match for the operationName', async () => {
    expect(() =>
      client.request({
        operationName: 'foo',
        query: `
          query GetVariables($data: Variables) {
            getVariables(data: $variables) {
              value
            }
          }

          mutation SetVariables($data: Variables) {
            setVariables(data: $variables) {
              value
            }
          }
        `
      })
    ).toThrow(/there is no foo operation inside the query/)
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

  it('throws when the mocks option is not an object', () => {
    expect(() => {
      new GraphQLMockClient({ mocks: 'mocks' })
    }).toThrow('GraphQLMockClient: config.mocks must be an object')
  })

  it('throws when the no mocks are provided', () => {
    expect(() => {
      new GraphQLMockClient()
    }).toThrow('GraphQLMockClient: config.mocks must be an object')
  })
})
