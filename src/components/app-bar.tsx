import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions as Dim, Alert } from 'react-native'
import { Feather } from '@expo/vector-icons'

import IconButton from './icon-button'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { useDimensions } from '../support'

const packagJson = require('../../package.json')

export default function AppBar() {
  let Screen = useDimensions('window')

  const showVersionDialog = useCallback(() => {
    Alert.alert(
      'Niu',
      `version ${packagJson.version}`,
      [
        {text: 'OK'}
      ]
    )
  }, [])

  return (
    <View style={[styles.container, { width: Screen.width }]}>
      <IconButton name="settings" size={24} color={Colors.foreground} provider={Feather} onPress={showVersionDialog}  />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: Dim.get('window').width,
    flexDirection: 'row',
    height: Dimensions.appBar.height,
    padding: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
