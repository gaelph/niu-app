/**
 * @category Components
 * @module components/buttons
 * @packageDocumentation
 */
import React from 'react'

import { View, Text, StyleSheet, TouchableNativeFeedback as Touchable, ViewStyle, TextStyle } from 'react-native'

import Colors from 'theme/colors'

interface ButtonProps {
  /** Add style for the view (padding, margin, background, ...) */
  style?: ViewStyle | TextStyle[]
  /** Add style for the button text (color, font, ...) */
  textStyle?: TextStyle | TextStyle[]
  /** Background color, defaults to `"transparent"`, web or rgb color */
  color?: string
  /** disables touch events. Defaults to false */
  disabled?: boolean
  /** callback fo touch events */
  onPress: () => void
  /** @hidden */
  children: React.ReactText | React.ReactText[]
}

/**
 * A simple styled button.\
 * It has the default font and foreground color
 * 
 * ## Example
 * ```jsx
 * <Button onPress={() => console.log("Button Clicked")}>
 *    Click me
 * </Button>
 * ```
 */
export default function Button(props: ButtonProps) {
  const { style = {}, onPress, disabled = false, color = 'transparent', textStyle = {}, children } = props

  return <Touchable onPress={onPress} disabled={disabled}>
    <View style={[styles.container, style, { backgroundColor: color }]}>
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </View>
  </Touchable>
}

/**
 * @hidden
 */
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  text: {
    fontFamily: 'Raleway-SemiBold',
    color: Colors.foreground
  }
})