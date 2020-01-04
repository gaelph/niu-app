/**
 * @category Containers
 * @module containers/settings
 * @packageDocumentation
 */
import React, { useCallback, useMemo } from 'react'
import Toast from 'support/toast'

import { Setting } from 'data/settings/model'
import { useSettings, DEFAULT_TARGET, AWAY_TEMPERATURE, APP_VERSION, RESET_APP } from 'data/settings/hooks'

import TemperatureItem from './TemperatureItem'

import SettingItem, { ListItem } from 'components/settings/Item'

import { FlatList } from 'react-native'

interface SettingItem<T> extends ListItem<T> {
  component: ({ item: ListItem, onChange: Function }) => React.ReactElement
}

const SETTINGS_STRUCTURE = [
  AWAY_TEMPERATURE,
  DEFAULT_TARGET,
  APP_VERSION,
  RESET_APP
]

/**
 * Returns the appropriate component for a setting
 */
function componentForSetting(setting: Setting): ({ item: ListItem, onChange: Function }) => React.ReactElement {
  switch (setting.id) {
    case AWAY_TEMPERATURE.id:
    case DEFAULT_TARGET.id:
      return TemperatureItem;

    default:
      return SettingItem;
  }
}

/**
 * Builds a list of setting descriptor suitable for use by a `FlatList`
 */
function buildSettingsList(settings: Setting[]): SettingItem<any>[] {
  let items = []

  SETTINGS_STRUCTURE.forEach(preset => {
    let setting, item
    if (setting = settings.find(setting => setting.id === preset.id)) {
      item = {
        title: setting.title,
        description: setting.description,
        value: setting.value,
        preset: preset,
        component: componentForSetting(setting)
      }
    } else {
      let setting = new Setting(preset.id, preset.title, preset.description, preset.defaultValue)
      item = {
        title: preset.title,
        description: preset.description,
        value: setting.value,
        preset: preset,
        component: componentForSetting(setting)
      }

    }

    items.push(item)
  })

  return items
}

/**
 * Display a list of Settings.\
 * Meant for the Settings screen
 */
export default function SettingsList(): React.ReactElement {
  const Settings = useSettings({
    onUpdate: Toast.showChangesOK,
    onError: error => {
      console.error(error)
      
      Toast.showError()
    }
  })
  
  const items = useMemo(() => {
    const settings = Settings.all()
    return buildSettingsList(settings)
  }, [Settings])

  const updateSetting = useCallback((preset, value) => {
    Settings.set(preset, value)
  }, [Settings])

  return <FlatList
    data={items}
    renderItem={({ item }) => {
      let C = item.component

      return <C item={item} onChange={value => updateSetting(item.preset, value)} />
    }}
    keyExtractor={item => item.title}
  />
}