import React from 'react';
import { View, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as Support from '../support/dimensions'

import IconButton from './icon-button'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'

export default function AppBar() {
  return (
    <View style={styles.container}>
      <IconButton name="settings" size={24} color={Colors.foreground} provider={Feather}  />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: Support.screenWidth(),
    flexDirection: 'row',
    height: Dimensions.appBar.height,
    padding: 16,
    marginTop: Support.statusBarHeight(),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    left: 0, right: 0
  },
});
