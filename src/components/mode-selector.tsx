import React, { useState, useCallback } from 'react';
import { View, TouchableNativeFeedback as Touchable, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { FontAwesome5} from '@expo/vector-icons'

import Colors from '../theme/colors'

import IconButton from './icon-button'

enum PillType {
  High = "sun",
  Low = "moon",
  Auto = "clock",
  NoFreeze = "snowflake"
}

interface PillProps {
  type: PillType,
  selected: PillType,
  onSelect: (PillType) => void,
  iconLib?: React.ComponentType,
}

function Pill({ type, selected, onSelect, iconLib }: PillProps): React.ReactElement {
  const Icon = iconLib || FontAwesome5
  return <IconButton
    name={type} color={Colors.accent} size={20} provider={Icon} 
    style={[styles.pill, selected === type && styles.active]}
    onPress={() => onSelect(type)} />
}

export default function ModeSelector(): React.ReactElement {
  const [selected, setSelected] = useState<PillType>(PillType.High)
  
  return <View style={styles.container}>
    <Pill type={PillType.High} selected={selected} onSelect={setSelected} iconLib={Feather} />
    <Pill type={PillType.Low} selected={selected} onSelect={setSelected} />
  </View>
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    height: 42,
    marginTop: 16,
    justifyContent: 'center'
  },
  pill: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
  },
  active: {
    opacity: 1
  }
})