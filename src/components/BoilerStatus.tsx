import React from 'react'
import { View, StyleSheet } from 'react-native'

import Colors from '../theme/colors'

export default ({ status }) => {
  const indicatorStyle = status
      ? styles.statusIndicatorOn
      : styles.statusIndicatorOff

  return <View style={[styles.statusIndicator, indicatorStyle]} collapsable={false}></View>
}


const styles = StyleSheet.create({
  statusIndicator: {
    width: 12,
    height: 12,
    marginBottom: 8, 
    overflow: 'hidden',
    borderRadius: 6
  },
  statusIndicatorOn: {
    backgroundColor: Colors.accent,
    opacity: 1
  },
  statusIndicatorOff: {
    backgroundColor: Colors.foreground,
    opacity: 0.3
  },
})