import { render, screen, fireEvent } from './test-utils'
import PostsWithErrorBoundary from '../src/components/PostsWithErrorBoundary'
import React from 'react'

describe('Posts', () => {
  it('should fire the error', async () => {
    render(<PostsWithErrorBoundary />)

    fireEvent.click(
      screen.getByRole('button', {
        name: /error/i
      })
    )

    expect(
      await screen.findByText(/Something went wrong/i)
    ).toBeTruthy()
  })
})
