import { useState, useEffect } from 'react'
import { AsyncStorage } from 'react-native'
import { Updates } from 'expo'


import { InMemoryCache } from 'apollo-cache-inmemory'
import { CachePersistor } from 'apollo-cache-persist'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink, from } from 'apollo-link'

import { initialState as tempRecordState } from './src/data/temperature-records/queries'

const cache = new InMemoryCache()
const httpLink = new HttpLink({
  uri: process.env.API_URL + '/graphql',
  credentials: 'include'
})

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: `Bearer ${process.env.API_KEY}`
    }
  }))

  return forward(operation)
})

const init = async () => {
  // Cache persistance
  // using the class to clear data on demand
  const persistor = new CachePersistor({
    cache,
    storage: AsyncStorage,
  })

  // Continue setting up Apollo as usual.
  const client = new ApolloClient({
    cache,
    link: from([
      authMiddleware,
      httpLink
    ]),
    resolvers: {
      Mutation: {
        // Clear cin memory cache and persisted cache
        resetApp: (_, _args, { client }) => {
          persistor.pause()
          persistor.purge()
          client.resetStore()
          persistor.resume()

          // Restart the Expo experience
          Updates.reloadFromCache()
        }
      }
    }
  })

  // Initial application local state
  cache.writeData({
    data: {
      ...tempRecordState
    }
  })

  return client
}

export default function () {
  let [client, setClient] = useState()

  useEffect(() => {
    init()
      .then((client) => setClient(client))
  }, [])

  return client
}