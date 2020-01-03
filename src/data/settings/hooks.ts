import { useMemo } from 'react'
import { ApolloClient } from 'apollo-client'
import { useQuery, useApolloClient } from '@apollo/react-hooks'

import * as queries from "./queries"
import { Setting } from './model'

import packageJson from '../../../package.json'

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

export interface SettingParam<T> {
  id: string,
  title: string,
  description: string,
  type: Function,
  defaultValue: T,
  update: (client: ApolloClient<any>, value: T) => Promise<boolean>
}

export const DEFAULT_TARGET: SettingParam<number> = {
  id: "default_target",
  title: "Default target temperature",
  description: "Default temperature when creating new schedules",
  type: Number,
  defaultValue: 20,
  update: (client: ApolloClient<any>, value: number) => {
    return updateSetting(client, "default_target", value)
  }
}

export const AWAY_TEMPERATURE: SettingParam<number> = {
  id: "away_temperature",
  title: "Away temperature",
  description: "Temperature when you are away from home",
  type: Number,
  defaultValue: 15,
  update: (client: ApolloClient<any>, value: number) => {
    return updateSetting(client, "away_temperature", value)
  }
}

export const TIMEZONE_OFFSET: SettingParam<number> = {
  id: "timezone",
  title: null,
  description: null,
  type: Number,
  defaultValue: 0,
  update: (client: ApolloClient<any>, value: number) => {
    return updateSetting(client, "timezone", value)
  }
}

export const APP_VERSION: SettingParam<void> = {
  id: "app_version",
  title: "Application Version",
  description: packageJson.version,
  type: () => void 0,
  defaultValue: void 0,
  update: async (_client: ApolloClient<any>, _value: void) => {
    return false
  }
}

export const RESET_APP: SettingParam<void> = {
  id: "reset_app",
  title: "Reset Application",
  description: "Clear all the data and restart the application",
  type: () => void 0,
  defaultValue: void 0,
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

type SettingGetter<T> = <T>(param: SettingParam<T>) => T | null
type SettingSetter<T> = <T>(param: SettingParam<T>, value?: T) => void
type SettingLister = () => Setting[]

interface SettingsResult {
  loading: boolean
  get: SettingGetter<unknown>,
  set: SettingSetter<unknown>,
  all: SettingLister
}

interface SettingsOptions {
  onUpdate?: () => void
  onError?: (error: Error) => void
}

const DEFAULT_SETTINGS = []

export function useSettings(options?: SettingsOptions): SettingsResult | null {
  const client = useApolloClient()
  const { loading, data } = useQuery(queries.fetchSettings)

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

  return data
    ? Settings
    : { loading, get: () => null, set: () => null, all: () => DEFAULT_SETTINGS }
}
