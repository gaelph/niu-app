/**
 * # Apollo Cache Persistance
 * Persists Apollo Cache to ReactNative's AsyncStorage
 * 
 * To initialize persistance:
 * 
 * ```ts
 * import { InMemoryCache } from 'apollo-cache-inmemory'
 * import { initPersistor } from 'api/persistance'
 * 
 * (async () => {
 *   const cache = new InMemoryCache()
 *   const Peristor = await initPersistor(cache)
 * })()
 * ```
 * 
 * To be able to reset the app storage (clear all data),
 * the persistance resolvers must be added to the client instance:
 * 
 * ```ts
 * import { ApolloClient } from 'apollo-client'
 * import { resolvers as persistanceResolvers } from 'api/persistance'
 * 
 * const client = new ApolloClient()
 * 
 * client.addResolvers(persistanceResolvers)
 * ```
 * 
 * After the persistor is initialized, the `Persistor` can be accessed
 * from anywhere:
 * 
 * ```ts
 * import Persistor from 'api/persistance'
 * 
 * // Persistor.pause()
 * // Persistor.resume()
 * // ...
 * ```
 * @category Api
 * @module api/persistance
 * @packageDocumentation
 */
import { AsyncStorage } from 'react-native'
import { Updates } from 'expo'
import { CachePersistor } from 'apollo-cache-persist'

let persistor = undefined

export async function initPersistor(cache) {
  persistor = new CachePersistor({
    cache,
    storage: AsyncStorage,
  })

  await persistor.restore()

  return persistor
}

export const resolvers = {
  Mutation: {
    // Clear in memory cache and persisted cache
    resetApp: (_, _args, { client }) => {
      if (!persistor) {
        console.error(new Error('persistor is not ready ?'))
        return
      }
      persistor.pause()
      persistor.purge()
      client.resetStore()
      persistor.resume()

      // Restart the Expo experience
      Updates.reloadFromCache()
    }
  }
}

export default persistor