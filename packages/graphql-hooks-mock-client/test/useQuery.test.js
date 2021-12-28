import { GraphQLMockClient } from '../index'
import { ClientContext, useQuery } from 'graphql-hooks'
import React from 'react'
import { render, screen } from '@testing-library/react'

describe('GraphQLMockClient', () => {
  const mockClient = new GraphQLMockClient({
    mocks: {
      query: {
        GetVariables({ variables }) {
          return { data: variables }
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

  it('matches the query GetVariables', async () => {
    const variables = { value: 1 }
    const query = `
      query GetVariables($value: Int) {
        value(value: $value) Int
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
