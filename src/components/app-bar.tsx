import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions as Dim } from 'react-native'
import { Feather } from '@expo/vector-icons'

import IconButton from './icon-button'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { useDimensions } from '../support'

export default function AppBar() {
  let Screen = useDimensions('window')

  return (
    <View style={[styles.container, { width: Screen.width }]}>
      <IconButton name="settings" size={24} color={Colors.foreground} provider={Feather}  />
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
