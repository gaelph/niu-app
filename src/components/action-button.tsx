import React from 'react';
import { View, Text, TouchableNativeFeedback as Touchable} from 'react-native';
import IconButton from './icon-button'

import { flex, h, p } from '../theme/styles'

export default function ActionButton({ onPress, icon, Provider, title, iconPosition, align }) {
  const textSpacing = align === "start"
    ? { marginLeft: 8 }
    : { marginRight: 8 }


  return (
    <Touchable onPress={onPress}>
      <View style={[flex, h.alignMiddle, p.v8, { justifyContent: `flex-${align}` }]}>
        {iconPosition === 'start' && <IconButton name={icon} size={16} color="gray" provider={Provider} />}
        <Text style={[{ color: 'gray' }, textSpacing]}>{title}</Text>
        {iconPosition === 'end' && <IconButton name={icon} size={16} color="gray" provider={Provider} />}
      </View>
    </Touchable>
  )
}