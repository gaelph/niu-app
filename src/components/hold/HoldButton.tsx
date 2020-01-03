import React from 'react'
import { View, Text, TouchableNativeFeedback as Touchable, StyleSheet } from 'react-native'

import { text } from '../../theme/styles'
import Colors from '../../theme/colors'
import { TargetTemperature } from '../../data/target-temperature/model'



interface HoldButtonProps {
  targetTemperature: TargetTemperature
  onPress: () => void
}

export function HoldButton ({ targetTemperature, onPress }: HoldButtonProps) {

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
