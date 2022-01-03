import { GraphQLMockClient } from '../src/index'
import { ClientContext, useQuery } from 'graphql-hooks'
import React from 'react'
import { render, screen } from '@testing-library/react'

describe('useQuery integration', () => {
  const mockClient = new GraphQLMockClient({
    schema: `
      type Query {
        value(value: Int): Int
      }
    `,
    resolvers: {
      Query: {
        value(_, { value }) {
          return value
        }
      }
    }
  })

  // eslint-disable-next-line react/prop-types
  const Wrapper = ({ children }) => (
    <ClientContext.Provider value={mockClient}>
      {children}
    </ClientContext.Provider>
  )

  it('matches the query', async () => {
    const variables = { value: 1 }
    const query = `
      query($value: Int) {
        value(value: $value)
      }
    `

    const Component = () => {
      const { data, loading } = useQuery(query, { variables })

      if (loading) return 'loading...'

      return `value: ${data.value}`
    }

    render(<Component />, { wrapper: Wrapper })

    expect(screen.getByText(/loading.../i)).toBeTruthy()
    expect(await screen.findByText(/value: 1/i)).toBeTruthy()
  })
})
