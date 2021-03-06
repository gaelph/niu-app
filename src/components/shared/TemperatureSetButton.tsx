/**
 * @category Components
 * @module components/shared
 * @packageDocumentation
 */
import React from 'react'
import { View, Text, TouchableNativeFeedback as Touchable, StyleSheet } from 'react-native'

import { text, h } from 'theme/styles'
import Colors from 'theme/colors'

type TemperatureSetButtonProps = {
  value: number,
  onPress: () => void
}

/**
 * A button displaying a temperature 
 */
export default function TemperatureSetButton({ value, onPress }: TemperatureSetButtonProps) {

  return (<Touchable onPress={onPress}>
    <View style={styles.container}>
      <Text style={styles.text}>{value}˚</Text>
    </View>
  </Touchable>
  )
}

/** @hidden */
const styles = StyleSheet.create({
  container: {
    ...h.alignEnd,
    ...h.justifyCenter,
    paddingHorizontal: 20
  },
  text: {
    ...text.default,
    fontSize: 24,
    color: Colors.accent
  },
})