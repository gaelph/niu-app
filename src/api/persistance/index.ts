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