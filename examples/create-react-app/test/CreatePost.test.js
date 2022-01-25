import { render, screen, fireEvent, waitFor } from './test-utils'
import CreatePost, { createPostMutation } from '../src/components/CreatePost'
import React from 'react'

describe('CreatePost', () => {
  it('should submit the new post', async () => {
    const createSpy = jest.fn()

    render(<CreatePost />, {
      localQueries: {
        [createPostMutation]({ variables }) {
          createSpy(variables)

          return { createPost: { id: 1 } }
        }
      }
    })

    fireEvent.input(
      screen.getByRole('textbox', {
        name: /title/i
      }),
      {
        target: {
          value: 'Test'
        }
      }
    )

    fireEvent.input(
      screen.getByRole('textbox', {
        name: /url/i
      }),
      {
        target: {
          value: 'https://example.com'
        }
      }
    )

    fireEvent.submit(
      screen.getByRole('textbox', {
        name: /url/i
      })
    )

    waitFor(() =>
      expect(createSpy).toHaveBeenCalledWith({
        title: 'Test',
        url: 'https://example.com'
      })
    )
  })
})
