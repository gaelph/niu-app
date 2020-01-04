/**
 * @category Api
 * @module api/middlewares
 * @packageDocumentation
 */
import { ApolloLink } from 'apollo-link'

/**
 * Request authentication middleware\
 * Adds the authentication token to every request
 */
const AuthLink = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: `Bearer ${process.env.API_KEY}`
    }
  }))

  return forward(operation)
})

export default AuthLink