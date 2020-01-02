import React from 'react'
import { View, Text, TouchableNativeFeedback as Touchable, StyleSheet } from 'react-native'

import { SettingParam } from '../../data/settings/hooks'

import { text, h, v, flex } from '../../theme/styles'
import Dimensions from '../../theme/dimensions'

export interface ListItem<T> {
  title: string,
  description: string,
  value: any,
  preset: SettingParam<T>
}

interface SettingItemProps<T> {
  item: ListItem<T>,
  onChange: () => void,
  rightView?: React.ReactElement | React.ReactElement[]
}

function SettingListItem<T>({ item: { title, description }, onChange, rightView }: SettingItemProps<T>): React.ReactElement {
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

const styles = StyleSheet.create({
  item: {
    padding: Dimensions.padding,
    paddingVertical: 16
  }
})