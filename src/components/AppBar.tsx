import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions as Dim, Alert } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { withNavigation } from 'react-navigation'

import IconButton from './buttons/IconButton'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { useDimensions } from '../support'


export default withNavigation(function AppBar({ navigation }) {
  let Screen = useDimensions('window')

  let toSettings = useCallback(() => {
    navigation.navigate('Settings')
  }, [navigation])


  return (
    <View style={[styles.container, { width: Screen.width }]}>
      <IconButton name="settings" onPress={toSettings} size={24} color={Colors.foreground} provider={Feather} style={styles.icon} />
    </View>
  )
})

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
