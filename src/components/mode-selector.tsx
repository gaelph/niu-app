import React, { useState, useCallback } from 'react';
import { View, TouchableNativeFeedback as Touchable, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { FontAwesome5} from '@expo/vector-icons'

import Colors from '../theme/colors'

import IconButton from './buttons/IconButton'

import { CurrentState } from '../data/rules/device-state'

enum PillType {
  High = "sun",
  Low = "moon",
  Auto = "clock",
  NoFreeze = "snowflake"
}

interface PillProps {
  type: PillType,
  selected: boolean,
  onSelect?: (PillType) => void,
  iconLib?: React.ComponentType,
}

function Pill({ type, selected, onSelect, iconLib }: PillProps): React.ReactElement {
  const Icon = iconLib || FontAwesome5
  return <IconButton
    name={type} color={Colors.accent} size={20} provider={Icon} 
    style={[styles.pill, selected && styles.active]}
    onPress={() => onSelect && onSelect(type)} />
}

interface ModeSelectorProps {
  deviceState: CurrentState
}

export default function ModeSelector({ deviceState }: ModeSelectorProps): React.ReactElement {
  // const [selected, setSelected] = useState<PillType>(PillType.High)
  
  return <View style={styles.container}>
    <Pill type={PillType.High} selected={!!deviceState.current} iconLib={Feather} />
    <Pill type={PillType.Low} selected={!deviceState.current} />
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