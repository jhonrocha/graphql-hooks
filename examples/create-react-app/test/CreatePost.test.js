import { render, screen, fireEvent } from './test-utils'
import CreatePost from '../src/components/CreatePost'
import React from 'react'
import { ClientContext } from 'graphql-hooks'
import { GraphQLMockClient } from 'graphql-hooks-mock-client'

describe('CreatePost', () => {
  it('should submit the new post', async () => {
    const createSpy = jest.fn()

    // We create a new client here in order to check
    // if and how the mutation is called
    const client = new GraphQLMockClient({
      mocks: {
        mutation: {
          CreatePost({ variables }) {
            createSpy(variables)
            return {
              data: { createPost: { id: 1 } }
            }
          }
        }
      }
    })

    render(
      <ClientContext.Provider value={client}>
        <CreatePost />
      </ClientContext.Provider>
    )

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

    expect(createSpy).toHaveBeenCalledWith({
      title: 'Test',
      url: 'https://example.com'
    })
  })
})
