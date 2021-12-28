import { GraphQLClient, ClientOptions } from 'graphql-hooks'

export interface Mocks {
  query: Record<string, GraphQLClient['request']>
  mutation: Record<string, GraphQLClient['request']>
}

export class GraphQLMockClient extends GraphQLClient {
  constructor(
    options: ClientOptions & {
      mocks?: Mocks
      fallbackOnFetch?: boolean
    }
  )

  mocks?: Mocks
  fallbackOnFetch?: boolean
}
