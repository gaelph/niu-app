/**
 * @category Components
 * @module components/buttons
 * @packageDocumentation
 */
import React, { ComponentClass, ReactElement, ReactNode } from 'react';
import { View, ViewStyle, TouchableNativeFeedback as Touchable } from 'react-native'

interface IconProviderProps {
  /** Icon name (according the Provider passed to the provider prop) */
  name: string,
  /** Icon size */
  size: number,
  /** Foreground color for the icon */
  color: string,
}

interface IconButtonProps extends IconProviderProps {
  /** Add style (padding, margin, etc...) */
  style?: ViewStyle | ViewStyle[],
  /** An icon provider from `@expo/vector-icons` */
  provider: ComponentClass<Readonly<any> & Readonly<{ children?: ReactNode; }>>,
  /** Callback to respond to touch event */
  onPress?: () => void
}

/**
 * Button without text, single image\
 * Omitting the `onPress` press will result in it being a simple icon
 * 
 * ## Example
 * ```jsx
 * <IconButton name="settings" provider={Feathers} size={24} color="black" onPress={() => console.log("Icon pressed")} />
 * ```
 */
export default function IconButton(props: IconButtonProps): ReactElement {
  const { provider, onPress, style, ...otherProps } = props
  const Provider = provider
  if (onPress) {
    return (
      <Touchable onPress={onPress} background={Touchable.SelectableBackgroundBorderless()}>
        <View style={style}>
          <Provider {...otherProps} />
        </View>
      </Touchable>
    )
  } else {
    return (
      <View style={style}>
        <Provider {...otherProps} />
      </View>
    )
  }
}