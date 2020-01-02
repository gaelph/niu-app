import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { Feather } from '@expo/vector-icons'
import IconButton from '../buttons/IconButton'
import { h, text } from '../../theme/styles'
import Colors from '../../theme/colors'

interface TemperaturePickerProps {
  value: string,
  onIncrement: () => void,
  onDecrement: () => void
}

export default function TemperaturePicker({ value, onIncrement, onDecrement }: TemperaturePickerProps) {
  

  return (
    <View style={[h.center, h.alignMiddle]}>
      <IconButton style={styles.round} name="minus" provider={Feather} onPress={onDecrement} size={18} color={Colors.grey} />


      <Text style={[text.default, text.accent, {fontSize: 64, width: 98, textAlign: 'center' }]}>
        {value}˚
      </Text>

      <IconButton style={styles.round} name="plus" provider={Feather} onPress={onIncrement} size={18} color={Colors.grey} />

    </View>
  )
}

const styles = StyleSheet.create({
  round: {
    ...h.center,
    ...text.default,
    borderColor: '#ccc',
    color: '#ccc',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 24,
    width: 48,
    height: 48,
    marginHorizontal: 16,
    marginTop: 10,
  },
  roundText: {
    color: '#777',
    ...text.light,
    ...text.large,
    lineHeight: 38
  }
})