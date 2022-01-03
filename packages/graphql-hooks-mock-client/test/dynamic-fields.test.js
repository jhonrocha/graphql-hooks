import { GraphQLMockClient } from '../src/index'

describe('GraphQLMockClient - dynamic fields', () => {
  it('accepts new arguments', async () => {
    let passedVars

    const client = new GraphQLMockClient({
      resolvers: {
        Query: {
          value: (_, v) => {
            passedVars = v

            return 1
          }
        }
      }
    })

    const firstResult = await client.request({
      query: `
        query($first: Int) {
          value(first: $first)
        }
      `,
      variables: {
        first: 1
      }
    })

    expect(firstResult).toEqual({
      data: {
        value: 1
      }
    })

    expect(passedVars).toEqual({
      first: 1
    })

    const secondResult = await client.request({
      query: `
          query($second: Int) {
            value(second: $second)
          }
        `,
      variables: {
        second: 2
      }
    })

    expect(secondResult).toEqual({
      data: {
        value: 1
      }
    })

    expect(passedVars).toEqual({
      second: 2
    })
  })

  it('takes Any as argument', async () => {
    let passedVars

    const client = new GraphQLMockClient({
      resolvers: {
        Query: {
          value: (_, v) => {
            passedVars = v

            return 1
          }
        }
      }
    })

    const result = await client.request({
      query: `
        query($value: Any) {
          value(value: $value)
        }
      `,
      variables: {
        value: {
          hello: 'world'
        }
      }
    })

    expect(result).toEqual({
      data: {
        value: 1
      }
    })

    expect(passedVars).toEqual({
      value: {
        hello: 'world'
      }
    })

    const secondResult = await client.request({
      query: `
          query($second: Int) {
            value(second: $second)
          }
        `,
      variables: {
        second: 2
      }
    })

    expect(secondResult).toEqual({
      data: {
        value: 1
      }
    })

    expect(passedVars).toEqual({
      second: 2
    })
  })
})
