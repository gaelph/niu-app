import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions as Dim, Alert } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { useHistory } from 'react-router-native'

import IconButton from './buttons/IconButton'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { useDimensions } from '../support'


export default function AppBar() {
  let Screen = useDimensions('window')
  let history = useHistory()

  let toSettings = useCallback(() => {
    history.push('/settings')
  }, [history])


  return (
    <View style={[styles.container, { width: Screen.width }]}>
      <IconButton name="settings" onPress={toSettings} size={24} color={Colors.foreground} provider={Feather} style={styles.icon} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: Dim.get('window').width,
    flexDirection: 'row',
    height: Dimensions.appBar.height,
    padding: 16,
    paddingHorizontal: 16,
    // backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  icon: {
    margin: -4,
    padding: 12
  }
});
