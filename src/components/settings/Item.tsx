/**
 * # Settings Components
 * @category Components
 * @module components/settings
 * @packageDocumentation
 */
import React from 'react'
import { View, Text, TouchableNativeFeedback as Touchable, StyleSheet } from 'react-native'

import { SettingParam } from 'data/settings/hooks'

import { text, h, v, flex } from 'theme/styles'
import Dimensions from 'theme/dimensions'

/**
 * Descriptor for the settings list FlatList component
 * The `T` matches the Setting type (number, string, ...)
 */
export interface ListItem<T> {
  title: string,
  description: string,
  value: T,
  preset: SettingParam<T>
}


interface SettingItemProps<T> {
  /** A descriptor for the setting */
  item: ListItem<T>,
  /** React to user touch event */
  onChange: () => void,
  /** An optional component to display on the right */
  rightView?: React.ReactElement | React.ReactElement[]
}

/**
 * A Setting list Item\
 * Displays the setting name and description on two lines\
 * The `rightView` prop allows for adding an extra component to the right
 */
function SettingListItem<T>(props: SettingItemProps<T>): React.ReactElement {
  const { item: { title, description }, onChange, rightView } = props

  return (
    <Touchable onPress={onChange}>
      <View style={[styles.item, h.justifyLeft, h.alignStart]}>
        <View style={[v.justifyLeft, v.alignStart, flex]}>
          <Text style={[text.default, text.primary]}>{title}</Text>
          <Text style={[text.default, text.small]}>{description}</Text>
        </View>
        { rightView &&
          rightView
        }
      </View>
    </Touchable>
  )
}

export default SettingListItem

/** @hidden */
const styles = StyleSheet.create({
  item: {
    padding: Dimensions.padding,
    paddingVertical: 16
  }
})