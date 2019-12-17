import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableNativeFeedback as Touchable, StyleSheet, AsyncStorage } from 'react-native';

import SettingsStore, { DEFAULT_TARGET, AWAY_TEMPERATURE } from '../settings'

import { StatusBar, useDimensions } from '../support/dimensions'

import { h, v, m, p, text, flex } from '../theme/styles'
import Dimensions from '../theme/dimensions'

import { useApi } from '../api'
import { listSettings } from '../api/queries'
import { Setting } from '../api/models/setting'

import SettingsBar from '../components/settings-bar'
import { TemperatureSetModal } from '../components/temperature-set-modal'

const packageJson = require('../../package.json')

const SettingItem = ({ title, description }: ListItem): React.ReactElement => (
  <View style={[styles.item]}>
    <Text style={[text.default, text.primary]}>{title}</Text>
    <Text style={[text.default, text.small]}>{description}</Text>
  </View>
)

const AwayTemperatureComponent = ({ title, description }: ListItem): React.ReactElement => {
  let [showModal, setShowModal] = useState(false)
  let [value, setValue] = useState('')

  useEffect(() => {
    SettingsStore.get(AWAY_TEMPERATURE)
    .then(v => setValue(v))
  })

  let updateValue = useCallback(async value => {
    await SettingsStore.set(AWAY_TEMPERATURE, value)
    setValue(value)
  }, [])

  console.log('AwayTemperatureComponent', value)

  return (
    <Touchable onPress={() => setShowModal(true)}>
      <View style={[styles.item, h.justifyLeft, h.alignStart]}>
        <View style={[v.justifyLeft, v.alignStart, flex]}>
          <Text style={[text.default, text.primary]}>{title}</Text>
          <Text style={[text.default, text.small]}>{description}</Text>
        </View>
        <Text style={[text.default, text.accent]}>{value}˚</Text>
        <TemperatureSetModal
          visible={showModal}
          value={value}
          onValueChange={v => {
            updateValue(v)
            setShowModal(false)
          }}
          onClose={() => setShowModal(false)}
        >
          Select the target temperture when you are away from home
        </TemperatureSetModal>
      </View>
    </Touchable>
  )
}

const DefaultTargetComponent = ({ title, description }: ListItem): React.ReactElement => {
  let [showModal, setShowModal] = useState(false)
  let [value, setValue] = useState('')

  useEffect(() => {
    SettingsStore.get(DEFAULT_TARGET)
      .then(v => setValue(v))
  }, [])

  let updateSetting = useCallback(async value => {
    await SettingsStore.set(DEFAULT_TARGET, value)
    setValue(value)
  }, [])

  console.log('AwayTemperatureComponent', value)

  return (
    <Touchable onPress={() => setShowModal(true)}>
      <View style={[styles.item, h.justifyLeft, h.alignStart]}>
        <View style={[v.justifyLeft, v.alignStart, flex]}>
          <Text style={[text.default, text.primary]}>{title}</Text>
          <Text style={[text.default, text.small]}>{description}</Text>
        </View>
        <Text style={[text.default, text.accent]}>{value}˚</Text>
        <TemperatureSetModal
          visible={showModal}
          value={value}
          onValueChange={v => {
            updateSetting(v)
            setShowModal(false)
          }}
          onClose={() => setShowModal(false)}
        >
          Select the default target temperature when creating new schedules
        </TemperatureSetModal>
      </View>
    </Touchable>
  )
}

interface ListItem {
  title: string,
  description: string
}

interface SettingItem extends ListItem{
  component: (item: ListItem) => React.ReactElement
}

const SETTINGS_STRUCTURE = [
  AWAY_TEMPERATURE,
  DEFAULT_TARGET
]

function componentForSetting(setting: Setting): (item: ListItem) => React.ReactElement {
  switch (setting.id) {
    case AWAY_TEMPERATURE.id:
      return AwayTemperatureComponent;

    case DEFAULT_TARGET.id:
      return DefaultTargetComponent;

    default:
      return SettingItem;
  }
}

function buildSettingsList(settings: Setting[]): SettingItem[] {
  let items = []

  SETTINGS_STRUCTURE.forEach(preset => {
    let setting, item
    if (setting = settings.find(setting => setting.id === preset.id)) {
      item = {
        title: setting.title,
        description: setting.description,
        component: componentForSetting(setting)
      }
    } else {
      let setting = new Setting(preset.id, preset.title, preset.description, preset.defaultValue)
      item = {
        title: preset.title,
        description: preset.description,
        component: componentForSetting(setting)
      }

    }

    items.push(item)
  })


  items.push({
    title: "Application Version",
    description: packageJson.version,
    component: (item) => <SettingItem {...item} />
  })

  return items
}


export const Settings = () => {
  let Screen = useDimensions('window')

  let { loading, error, data, refresh } = useApi(listSettings)

  if (error) {
    console.error(error)
  }

  let [items, setItems] = useState<SettingItem[]>([])

  useEffect(() => {
    SettingsStore.all()
      .then((settings) => buildSettingsList(settings))
  }, [])
  
  
  useEffect(() => {
    if (data) {
      setItems(buildSettingsList(data as Setting[]))
    }
  }, [data])

  // TODO load settings from storage, and from API

  return <View style={{ width: Screen.width, height: Screen.height, paddingTop: StatusBar.height }}>
    <SettingsBar />
    <FlatList
      data={items}
      renderItem={({ item }) => {
        let C = item.component

        return <C {...item} />
      }}
      keyExtractor={item => item.title}
    />
  </View>
}

const styles = StyleSheet.create({
  item: {
    padding: Dimensions.padding,
    paddingVertical: 8
  }
})