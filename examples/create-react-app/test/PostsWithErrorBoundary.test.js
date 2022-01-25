import { render, screen, fireEvent } from './test-utils'
import PostsWithErrorBoundary, {
  allPostsQuery,
  errorAllPostsQuery
} from '../src/components/PostsWithErrorBoundary'
import React from 'react'

describe('Posts', () => {
  it('should fire the error', async () => {
    render(<PostsWithErrorBoundary />, {
      localQueries: {
        [allPostsQuery]() {
          return {
            allPosts: [
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

    fireEvent.click(
      screen.getByRole('button', {
        name: /error/i
      })
    )

    expect(await screen.findByText(/Something went wrong/i)).toBeTruthy()
  })
})
