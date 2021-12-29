import { render, screen } from './test-utils'
import Posts from '../src/components/Posts'
import React from 'react'

describe('Posts', () => {
  it('should render successfully', async () => {
    render(<Posts />)

    expect(
      await screen.findByRole('link', {
        name: /Test/i
      })
    ).toBeTruthy()
  })
})
