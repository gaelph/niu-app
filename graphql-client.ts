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

const loggerMiddleware = new ApolloLink((operation, forward) => {
  const start = +new Date()
  const queries = operation.query.definitions.reduce((acc, def) => {
    // @ts-ignore
    acc[def.name.value] = {
      // @ts-ignore
      type: def.operation,
      // @ts-ignore
      selections: (def.selectionSet.selections).map(s => s.name.value)
    }

    return acc
  }, {})

  return forward(operation).map(result => {
    const { data, errors } = result
    const duration = +new Date() - start

    Object.keys(queries).forEach(key => {
      // console.group(key)
      const { type, selections } = queries[key]
      if (data) {
        selections.forEach(selection => {
          if (data.hasOwnProperty(selection)) {
            console.info(`%c${type} %c${selection} %cOK %c+${duration}ms`, type == "query" ? "color:cyan;" : "color:coral;", "color:white;", "color:lime", "color:gray;")
          }
        })
      }

      // console.groupEnd() 
    })

    if (errors) {
      errors.forEach(error => {
        console.info(`%c${error.path.join('.')}: ${error.message}`, "color:red;")
      })
    }

    return result
  })
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
      loggerMiddleware,
      httpLink,
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