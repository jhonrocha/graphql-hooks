import { render, screen } from './test-utils'
import Posts, { allPostsQuery } from '../src/components/Posts'
import React from 'react'

describe('Posts', () => {
  it('should render successfully', async () => {
    render(<Posts />, {
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

    expect(
      await screen.findByRole('link', {
        name: /Test/i
      })
    ).toBeTruthy()
  })
})
