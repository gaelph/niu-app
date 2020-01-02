import React from 'react'
import { View } from 'react-native'


import { StatusBar, useDimensions } from '../support/dimensions'

import Colors from '../theme/colors'


import SettingsBar from '../containers/SettingsBar'
import SettingsList from '../containers/settings/List'

export const Settings = () => {
  let Screen = useDimensions('window')

  return <View style={{ width: Screen.width, height: Screen.height, paddingTop: StatusBar.height, backgroundColor: Colors.background, }}>
    <SettingsBar />
    <SettingsList />
  </View>
}