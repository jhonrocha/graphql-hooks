import type { GraphQLClient, ClientOptions } from 'graphql-hooks'

interface Operation {
  query: string
  variables?: object
  operationName?: string
}

interface HttpError {
  status: number
  statusText: string
  body: string
}

interface APIError {
  fetchError?: Error
  httpError?: HttpError
  graphQLErrors?: object[]
}

interface Result{
  data?: object
  error?: APIError
}

export class GraphQLMockClient extends GraphQLClient {
  constructor(
    options: Partial<ClientOptions>
  )
}
