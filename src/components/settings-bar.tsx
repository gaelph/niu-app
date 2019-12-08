import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions as Dim, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { Link } from 'react-router-native'

import IconButton from './icon-button'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { text, flex, m } from '../theme/styles'
import { useDimensions } from '../support'

export default function AppBar() {
  let Screen = useDimensions('window')


  return (
    <View style={[styles.container, { width: Screen.width }]}>
      <Link to="/">
        <IconButton name="arrow-left" size={18} color={Colors.foreground} provider={Feather} style={styles.icon} />
      </Link>
      <Text style={[text.default, text.primary, flex, m.l12]}>
        Settings
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: Dim.get('window').width,
    flexDirection: 'row',
    height: Dimensions.appBar.height,
    padding: 16,
    paddingHorizontal: 30,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  icon: {
    margin: -4
  }
});
