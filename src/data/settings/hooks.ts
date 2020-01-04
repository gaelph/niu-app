/**
 * React Hook use to fetch and interact with Settings
 * 
 * **Example**
 * ```ts
 * import { useSettings, AWAY_TEMPERATURE } from 'data/settings/hooks'
 * 
 * function Component() {
 *   const Settings = useSettings()
 *   // Get the setting value
 *   const awayTemperature = Settings.get(AWAY_TEMPERATURE)
 * 
 *   // Set the setting value
 *   Settings.set(AWAY_TEMPERATURE, 12)
 *   
 *   return ...
 * }
 * ```
 * @category Data Hooks
 * @module data/settings/hooks
 * @packageDocumentation
 */
import { useMemo } from 'react'
import { ApolloClient } from 'apollo-client'
import { useQuery, useApolloClient } from '@apollo/react-hooks'

import * as queries from "./queries"
import { Setting } from './model'

import packageJson from '../../../package.json'

/**
 * Updates a setting on the server
 */
async function updateSetting(client: ApolloClient<any>, id, value) {
  try {
    const result = await client.mutate({
      mutation: queries.updateSetting,
      variables: {
        setting: {
          id: id,
          value: value.toString()
        }
      }
    })
    const { data: { updateSetting: setting }, errors } = result

    if (errors) {
      const error = new Error('Error updating Setting')
      // @ts-ignore
      error.graphQLErrors = errors

      throw error
    }

    // UPDATE THE APOLLO CACHE
    const readResult = await client.readQuery({
      query: queries.fetchSettings
    })
    
    const { listSettings: settings } = readResult

    await client.writeQuery({
      query: queries.fetchSettings,
      data: {
        listSettings: settings.map(s => {
          if (s.id == setting.id) {
            return {
              ...s,
              setting
            }
          }
          return s
        })
      }
    })
    
    return true
  } catch (err) {
    console.error(err)
  }
}

/**
 * Describes a setting
 * @typeparam T Type of the setting
 */
export interface SettingParam<T> {
  /** A slug name for the setting*/
  id: string,
  /** Setting title, used for display */
  title: string,
  /** Setting description, used for display */
  description: string,
  /** A function to parse string input into `T` */
  type: Function,
  /** Setting default value */
  defaultValue: T,
  /** Updates the setting. The returns `true` if a message should be displayed */
  update: (client: ApolloClient<any>, value: T) => Promise<boolean>
}

/**
 * Default target temperature when creating new Schedule
 */
export const DEFAULT_TARGET: SettingParam<number> = {
  id: "default_target",
  title: "Default target temperature",
  description: "Default temperature when creating new schedules",
  type: Number,
  defaultValue: 20,
  /** Updates the `default_target` setting on server */
  update: (client: ApolloClient<any>, value: number) => {
    return updateSetting(client, "default_target", value)
  }
}

/**
 * Temperature to target if no rule, no schedule, and no hold is active
 */
export const AWAY_TEMPERATURE: SettingParam<number> = {
  id: "away_temperature",
  title: "Away temperature",
  description: "Temperature when you are away from home",
  type: Number,
  defaultValue: 15,
  /** Updates the `away_temperature` setting on server */
  update: (client: ApolloClient<any>, value: number) => {
    return updateSetting(client, "away_temperature", value)
  }
}

/**
 * Timezone offset of the device
 */
export const TIMEZONE_OFFSET: SettingParam<number> = {
  id: "timezone",
  title: null,
  description: null,
  type: Number,
  defaultValue: 0,
  /** Updates the `timezone` setting on server */
  update: (client: ApolloClient<any>, value: number) => {
    return updateSetting(client, "timezone", value)
  }
}

/**
 * Application version.\
 * This setting is readonly.
 */
export const APP_VERSION: SettingParam<void> = {
  id: "app_version",
  title: "Application Version",
  description: packageJson.version,
  type: () => void 0,
  defaultValue: void 0,
  /** This is is a no-op */
  update: async (_client: ApolloClient<any>, _value: void) => {
    return false
  }
}

/**
 * Reset App.\
 * Resets the application data and restarts it
 */
export const RESET_APP: SettingParam<void> = {
  id: "reset_app",
  title: "Reset Application",
  description: "Clear all the data and restart the application",
  type: () => void 0,
  defaultValue: void 0,
  /** Clears the cache, its persistance and restarts the app */
  update: async (client: ApolloClient<any>, _value: void) => {
    try {
      await client.mutate({ mutation: queries.resetApp })
    } catch (error) {
      console.log("error resetting app")
      console.error(error)
    }

    return false
  }
}

interface SettingsResult {
  /** Loading status */
  loading: boolean
  /** Gets setting */
  get: <T>(param: SettingParam<T>) => T | null,
  /** Sets a setting and calls the `update()` function of the param object passed as first parameter */
  set: <T>(param: SettingParam<T>, value?: T) => void,
  /** Returns all settings */
  all: () => Setting[]
}

interface SettingsOptions {
  /** Called when mutation is successful */
  onUpdate?: () => void
  /** Called when mutation fails*/
  onError?: (error: Error) => void
}

// Prevents re-renders
const DEFAULT_SETTINGS = []

export function useSettings(options?: SettingsOptions): SettingsResult | null {
  const client = useApolloClient()
  const { loading, data } = useQuery(queries.fetchSettings)

  // Map objects returned by the Api to Setting class
  let settings = useMemo(() => {
    return data
      ? data.listSettings.map(setting => Setting.fromObject(setting))
      : DEFAULT_SETTINGS
  }, [data])

  let Settings = useMemo(() => {
    return {
      loading,
      get<T>(param: SettingParam<T>) {
        let s = settings.find(s => s.id == param.id)

        if (s) return param.type(s.value)
        else   return null
      },

      set<T>(param: SettingParam<T>, value?: T) {
        let stringValue = value instanceof Date ? value.toISOString() : value.toString()

        param.update(client, stringValue as unknown as T)
        .then((showMessage) => showMessage && options && options.onUpdate())
        .catch(error => options && options.onError(error))
      },

      all() {
        return [
          AWAY_TEMPERATURE,
          DEFAULT_TARGET,
          APP_VERSION,
          RESET_APP
        ].map(param => {
          let s = settings.find(s => s.id == param.id)

          if (s) return new Setting(s.id, s.title, s.description, param.type(s.value))
          else   return new Setting(param.id, param.title, param.description, param.type())
        })
      }
    }
  }, [loading, settings])

  // TODO: There might be some re-render optimization possible here
  return data
    ? Settings
    : { loading, get: () => null, set: () => null, all: () => DEFAULT_SETTINGS }
}
