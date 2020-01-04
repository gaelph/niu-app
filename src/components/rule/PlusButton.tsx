/**
 * @category Components
 * @module components/rule
 * @packageDocumentation
 */
import React from 'react';
import { View, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import IconButton from '../buttons/IconButton'

import Colors from 'theme/colors'
import Dimensions from 'theme/dimensions'

interface PlusButtonProps {
  /** React to touch events */
  onPress: () => void
}

/**
 * A button to add a Rule\
 * It is positionned at the bottom center of the view
 */
export default function PlusButton(props: PlusButtonProps) {
  const { onPress } = props

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <IconButton name="plus" size={24} color='white' provider={Feather} onPress={onPress} />
      </View>
    </View>
  )
} 

/**
 * @hidden
 */
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12,
    left: 0, right: 0,
    height: Dimensions.appBar.height,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    backgroundColor: Colors.text.primary,
    width: 48, 
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.07,
    shadowRadius: 3.84,

    elevation: 2,
  }
})