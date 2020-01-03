import { useState, useEffect } from 'react'

import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { from } from 'apollo-link'

import { initPersistor, resolvers as persistanceResolvers } from './persistance'

import AuthLink from './middlewares/auth'
import LoggerLink from './middlewares/logger'
import { HttpLink } from 'apollo-link-http'

import { initialState as tempRecordState } from '../data/temperature-records/queries'
import { initialState as boilerStatusState } from '../data/boiler-status/queries'

const cache = new InMemoryCache()
const httpLink = new HttpLink({
  uri: process.env.API_URL + '/graphql',
  credentials: 'include'
})

const init = async () => {
  // Cache persistance
  // using the class to clear data on demand
  await initPersistor(cache)

  // Continue setting up Apollo as usual.
  const client = new ApolloClient({
    cache,
    link: from([
      AuthLink,
      LoggerLink,
      httpLink,
    ])
  })

  // persistance resolvers has the reset App behavior
  client.addResolvers(persistanceResolvers)

  // Initial application local state
  cache.writeData({
    data: {
      ...tempRecordState,
      ...boilerStatusState
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