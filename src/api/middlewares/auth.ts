import { ApolloLink } from 'apollo-link'

export default new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: `Bearer ${process.env.API_KEY}`
    }
  }))

  return forward(operation)
})