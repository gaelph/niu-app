import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableNativeFeedback as Touchable, StyleSheet } from 'react-native';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks'


import { StatusBar, useDimensions } from '../support/dimensions'
import Toast from '../support/toast'

import { h, v, text, flex } from '../theme/styles'
import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'

import { Setting } from '../data/settings/model'

import { useSettings, SettingParam, DEFAULT_TARGET, AWAY_TEMPERATURE } from '../data/settings/hooks'

import SettingsBar from '../containers/SettingsBar'
import TemperatureModal from '../containers/temperature-records/TemperatureModal'

const packageJson = require('../../package.json')

const RESET_MUTATION = gql`
mutation ResetApp {
  resetApp @client
}
`

const SettingItem = ({ item: { title, description } }: { item: ListItem }): React.ReactElement => (
  <View style={[styles.item]}>
    <Text style={[text.default, text.primary]}>{title}</Text>
    <Text style={[text.default, text.small]}>{description}</Text>
  </View>
)

const ResetAppItem = ({ item: { title, description } }: { item: ListItem }): React.ReactElement => {
  const [resetApp, _ ] = useMutation(RESET_MUTATION)

  return <Touchable onPress={() => resetApp()}>
    <View style={[styles.item]}>
      <Text style={[text.default, text.primary]}>{title}</Text>
      <Text style={[text.default, text.small]}>{description}</Text>
    </View>
  </Touchable>
}


const TemperatureComponent = ({ item: { title, description, preset, value }, onChange }: { item: ListItem, onChange: Function }): React.ReactElement => {
  let [showModal, setShowModal] = useState(false)

  const sentence = description.charAt(0).toLocaleLowerCase() + description.substring(1)

  return (
    <Touchable onPress={() => setShowModal(true)}>
      <View style={[styles.item, h.justifyLeft, h.alignStart]}>
        <View style={[v.justifyLeft, v.alignStart, flex]}>
          <Text style={[text.default, text.primary]}>{title}</Text>
          <Text style={[text.default, text.small]}>{description}</Text>
        </View>
        <Text style={[text.default, text.accent]}>{value}˚</Text>
        <TemperatureModal
          visible={showModal}
          value={value}
          onValueChange={v => {
            onChange(v)
          }}
          onClose={() => setShowModal(false)}
        >
          Select the {sentence}
        </TemperatureModal>
      </View>
    </Touchable>
  )
}

interface ListItem {
  title: string,
  description: string,
  value: any,
  preset: SettingParam
}

interface SettingItem extends ListItem{
  component: ({ item: ListItem, onChange: Function }) => React.ReactElement
}

const SETTINGS_STRUCTURE = [
  AWAY_TEMPERATURE,
  DEFAULT_TARGET
]

function componentForSetting(setting: Setting): ({ item: ListItem, onChange: Function }) => React.ReactElement {
  switch (setting.id) {
    case AWAY_TEMPERATURE.id:
    case DEFAULT_TARGET.id:
      return TemperatureComponent;

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
        value: setting.value,
        preset,
        component: componentForSetting(setting)
      }
    } else {
      let setting = new Setting(preset.id, preset.title, preset.description, preset.defaultValue)
      item = {
        title: preset.title,
        description: preset.description,
        value: setting.value,
        preset,
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

  items.push({
    title: "Reset Application",
    description: "Clear all the data and restart the application",
    component: (item) => <ResetAppItem {...item} />
  })

  return items
}


export const Settings = () => {
  let Screen = useDimensions('window')

  const Settings = useSettings({
    onUpdate: Toast.showChangesOK,
    onError: error => {
      console.error(error)
      
      Toast.showError()
    }
  })
  const settings = Settings.all()

  const items = buildSettingsList(settings)

  const updateSetting = useCallback((preset, value) => {
    Settings.set(preset, value)
  }, [Settings])

  return <View style={{ width: Screen.width, height: Screen.height, paddingTop: StatusBar.height, backgroundColor: Colors.background, }}>
    <SettingsBar />
    <FlatList
      data={items}
      renderItem={({ item }) => {
        let C = item.component

        return <C item={item} onChange={value => updateSetting(item.preset, value)} />
      }}
      keyExtractor={item => item.title}
    />
  </View>
}

const styles = StyleSheet.create({
  item: {
    padding: Dimensions.padding,
    paddingVertical: 16
  }
})