/**
 * @category Components
 * @module components/hold
 * @packageDocumentation
 */
import React from 'react'
import { View, Text, TouchableNativeFeedback as Touchable, StyleSheet } from 'react-native'

import { text } from 'theme/styles'
import Colors from 'theme/colors'
import { TargetTemperature } from 'data/target-temperature/model'

interface HoldButtonProps {
  /** [[TargetTemperature]] object containing the information to be displayed */
  targetTemperature: TargetTemperature
  /** React to touch events */
  onPress: () => void
}

/**
 * Displays the current target temperature, next change and it results from regular schedule or a hold
 */
// TODO: Rename to TargetTemperatureButton or something similar
export function HoldButton (props: HoldButtonProps) {
  const { targetTemperature, onPress } = props

  return (
    <Touchable onPress={onPress}>
      <View style={styles.schedule}>
        <Text style={[text.default, text.primary, text.semiBold, styles.timeText]}>
          { targetTemperature.display() }
        </Text>
      </View>
    </Touchable>
  )
}

/**
 * @hidden
 */
const styles = StyleSheet.create({
  timeText: {
    fontSize: 16,
    lineHeight: 16,
  },
  schedule: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 2,
  }
});
