import { ClientContext } from 'graphql-hooks'
import { GraphQLMockClient } from 'graphql-hooks-mock-client'
import { render } from '@testing-library/react'
import React from 'react'
import T from 'prop-types'

// In this file we define a custom render function
// that already comes with our mock client

const client = new GraphQLMockClient({
  schema: `
    type Post {
      id: String,
      title: String,
      url: String
    }
    type Query {
      allPosts: [Post]
    }
  `,
  resolvers: {
    Query: {
      allPosts() {
        return [
          {
            id: 1,
            title: 'Test',
            url: 'https://example.com'
          }
        ]
      }
    }
  }
})

const Wrapper = ({ children }) => {
  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  )
}

Wrapper.propTypes = {
  children: T.node.isRequired
}

const customRender = (ui, options) => {
  return render(ui, {
    wrapper: Wrapper,
    ...options
  })
}

export * from '@testing-library/react'

export { customRender as render }
