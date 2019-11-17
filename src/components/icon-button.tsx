import React, { ComponentClass, ReactElement, ReactNode } from 'react';
import { View, ViewStyle, TouchableNativeFeedback as Touchable, StyleSheet } from 'react-native'

interface IconProviderProps {
  name: string,
  size: number,
  color: string,
}

interface IconButtonProps extends IconProviderProps {
  style?: ViewStyle | ViewStyle[],
  provider: ComponentClass<Readonly<any> & Readonly<{ children?: ReactNode; }>>,
  onPress?: () => void
}

export default function IconButton({ provider, onPress, style, ...props }: IconButtonProps): ReactElement {
  const Provider = provider
  return (
    <Touchable onPress={onPress} useForeground background={Touchable.SelectableBackgroundBorderless()}>
      <View style={style}>
        <Provider {...props} />
      </View>
    </Touchable>
  )
}