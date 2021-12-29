//@ts-check

/**
 * @type import('graphql-hooks-mock-client').GraphQLHooksMocks
 */
export const mocks = {
  query: {
    GetAllPosts() {
      return {
        data: {
          allPosts: [
            {
              id: 1,
              title: 'Test',
              url: 'https://example.com'
            }
          ]
        }
      }
    },
    GetAllPostsWithError() {
      return {
        error: {
          graphQLErrors: [{ message: 'There are some errors in your query' }]
        }
      }
    }
  }
}
