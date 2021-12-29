# graphql-hooks-mock-client

__This library is still in early stage. Expect breaking changes and overhaul redesigns.__

A mock client for `graphql-hooks`

## Install

`npm install -D graphql-hooks-mock-client`

or

`yarn add --dev graphql-hooks-mock-client`

## Quick Start

You can use `GraphQLMockClient` in your tests in place of `GraphQLClient`:

```js
import { GraphQLMockClient } from 'graphql-hooks-mock-client'
import { ClientContext, useQuery } from 'graphql-hooks'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { users } from './fixtures/'
import { MyComponent } from '../components'

describe('MyComponent', () => {
  const mockClient = new GraphQLMockClient({
    mocks: {
      query: {
        HomePage({ variables }) {
          return { data: { users: users.slice(0, variables.limit) } }
        }
      }
    }
  })

  const Wrapper = ({ children }) => (
    <ClientContext.Provider value={mockClient}>
      {children}
    </ClientContext.Provider>
  )

  it('renders the users list', async () => {
    render(<MyComponent />, { wrapper: Wrapper })

    // The first render is in loading state
    expect(screen.getByText(/loading.../i)).toBeTruthy()

    // And then we wait for the results to come
    expect(await screen.findByText(/gdorsi/i)).toBeTruthy()
  })
})
```

The mock client will match every query by operation kind (query/mutation) and by name and will throw on miss.

You can use it also in your application to mock some of the requests by enabling the `fallbackOnFetch` option.
In that case it will fall back to the normal `GraphQLClient` behavoir when an operation mock is not provided.

Check out the [create-react-app example tests](../../examples/create-react-app/test) for a more in-depth usage example.

### API

## `GraphQLMockClient`

**Usage**:

```js
import { GraphQLMockClient } from 'graphql-hooks-mock-client'
const mockClient = new GraphQLMockClient(config)
```

`GraphQLMockClient` extends `GraphQLClient` and inherits all of it's options/methods with these additions:

**`config`**:
- `mocks`: The object with the mocks definitions. 
- `fallbackOnFetch`: When enabled will move from the "throw on miss" behavoir to "fallback to the normal GraphQLClient on miss"

The mocks definitions are rapresented by an object with this shape:

```ts
interface Mocks {
  // Will intercept the queries by operation kind (query/mutation)
  query: {
    // and by name. Then the provided callback will be called
    [name: string]: (
      operation: { variables: object; query: string },
      options: object
    ) => { data?: object; errors?: object }
  };
  mutation: {
    [name: string]: (
      operation: { variables: object; query: string },
      options: object
    ) => { data?: object; errors?: object }
  }
}
```
