/**
 * @category Components
 * @module components/rule
 * @packageDocumentation
 */
import React from 'react';
import { View, Text, TouchableNativeFeedback as Touchable} from 'react-native';
import IconButton from '../buttons/IconButton'

import { flex, h, p } from 'theme/styles'

interface ActionButtonProps {
  onPress?: () => void
  /** Specify a name for an icon to be drawn left or right to the button text. A Provider prop is required if `icon` is set */
  icon?: string
  /** Provider from `@expo/vector-icons` */
  Provider?: any
  /** Button text */
  title: string
  /** Where to place the icon relative to the title */
  iconPosition?: 'start' | 'end'
  /** How to align the text within the button */
  align: 'start' | 'end'
}

/**
 * Used in Rule List Items, this buttons are meant to be
 * displayed at the bottom of an item while editing.\
 * Actions associated with an `ActionButton` should be about
 * removing a `Rule` or altering its properties
 * 
 * @throws Error if the `icon` prop is set without the `Provider` prop
 * @hidden
 */
export default function ActionButton(props: ActionButtonProps) {
  const { onPress, icon, Provider, title, iconPosition, align } = props
  if (icon && !Provider) {
    throw new Error("Provider prop missing on ActionButton. If a `icon` prop is provided, you must provide a `Provider` for it")
  }

  const textSpacing = align === "start"
    ? { marginLeft: 8 }
    : { marginRight: 8 }


  return (
    <Touchable onPress={onPress}>
      <View style={[flex, h.alignMiddle, p.v8, { justifyContent: `flex-${align}` as any }]}>
        {iconPosition === 'start' && <IconButton name={icon} size={16} color="gray" provider={Provider} />}
        <Text style={[{ color: 'gray' }, textSpacing]}>{title}</Text>
        {iconPosition === 'end' && <IconButton name={icon} size={16} color="gray" provider={Provider} />}
      </View>
    </Touchable>
  )
}