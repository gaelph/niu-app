import { useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks';

import * as queries from "./queries"
import { Setting } from './model'

export interface SettingParam {
  id: string,
  title: string,
  description: string,
  type: Function,
  defaultValue: any
}

export const DEFAULT_TARGET: SettingParam = {
  id: "default_target",
  title: "Default target temperature",
  description: "Default temperature when creating new schedules",
  type: Number,
  defaultValue: 20
}

export const AWAY_TEMPERATURE: SettingParam = {
  id: "away_temperature",
  title: "Away temperature",
  description: "Temperature when you are away from home",
  type: Number,
  defaultValue: 15
}

export const TIMEZONE_OFFSET: SettingParam = {
  id: "timezone",
  title: null,
  description: null,
  type: Number,
  defaultValue: 0
}

type SettingGetter = (param: SettingParam) => any | null
type SettingSetter = (param: SettingParam, value: any) => void
type SettingLister = () => Setting[]

interface SettingsResult {
  loading: boolean
  get: SettingGetter,
  set: SettingSetter,
  all: SettingLister
}

interface SettingsOptions {
  onUpdate?: () => void
  onError?: (error: Error) => void
}

export function useSettings(options?: SettingsOptions): SettingsResult | null {
  const { loading, data } = useQuery(queries.fetchSettings)
  const [updateSetting, _] = useMutation(queries.updateSetting, {
    onCompleted: options && options.onUpdate,
    onError: options && options.onError
  })

  let settings = useMemo(() => {
    return data
      ? data.listSettings.map(setting => Setting.fromObject(setting))
      : []
  }, [data])

  let Settings = useMemo(() => {
    return {
      loading,
      get(param: SettingParam) {
        let s = settings.find(s => s.id == param.id)

        if (s) return param.type(s.value)
        else   return null
      },

      set(param: SettingParam, value: any) {
        let stringValue = value instanceof Date ? value.toISOString() : value.toString()

        let s = settings.find(s => s.id == param.id)

        if (s) {
          updateSetting({ variables: { setting: { id: s.id, value: stringValue }}})
        }
      },

      all() {
        return [
          AWAY_TEMPERATURE,
          DEFAULT_TARGET,
        ].map(param => {
          let s = settings.find(s => s.id == param.id)

          if (s) return new Setting(s.id, s.title, s.description, param.type(s.value))
          else   return null
        })
      }
    }
  }, [loading, settings])

  return data
    ? Settings
    : { loading, get: () => null, set: () => null, all: () => [] }
}
