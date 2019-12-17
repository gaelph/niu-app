import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableNativeFeedback as Touchable} from 'react-native'

import { Feather } from '@expo/vector-icons'
import IconButton from './icon-button'
import { h, m, p, text } from '../theme/styles'
import Colors from '../theme/colors'

interface TemperaturePickerProps {
  value: string,
  onValueChange: (value: number) => void
}

export default function TemperaturePicker({ value, onValueChange }: TemperaturePickerProps) {
  const increment = useCallback(() => {
    let v = parseInt(value, 10) + 1

    if (v <= 30) {
      onValueChange(v)
    }
  }, [onValueChange])

  const decrement = useCallback(() => {
    let v = parseInt(value, 10) - 1

    if (v >= 5) {
      onValueChange(v)
    }
  }, [onValueChange])

  return (
    <View style={[h.center, h.alignMiddle]}>
      <IconButton style={styles.round} name="minus" provider={Feather} onPress={decrement} size={18} color={Colors.grey} />


      <Text style={[text.default, text.accent, {fontSize: 64, width: 98, textAlign: 'center' }]}>
        {value}˚
      </Text>

      <IconButton style={styles.round} name="plus" provider={Feather} onPress={increment} size={18} color={Colors.grey} />

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