/**
 * # AppBar
 * The application top bar
 * 
 * ## Example
 * ```jsx
 * import { AppBar, AppBarTitle, AppBarLeft, AppBarRight, AppBarButton } from 'components/AppBar'
 * 
 * const Component = () => {
 * 
 *   return (
 *     <AppBar>
 *       <AppBarTitle>Application Name</AppBarTitle>
 *       <AppBarLeft>
 *          <AppBarButton icon="menu" onPress={() => console.log("menu pressed")} />
 *       </AppBarLeft>
 *       <AppBarRight>
 *          { ... }
 *       </AppBarRight>
 *     </AppBar>
 *   )
 * }
 * ```
 * @category Components
 * @module components/AppBar
 * @packageDocumentation
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions as Dim, Alert } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { withNavigation } from 'react-navigation'

import IconButton from './buttons/IconButton'

import { text, flex, m, h } from 'theme/styles'
import Colors from 'theme/colors'
import Dimensions from 'theme/dimensions'
import { useDimensions } from 'support'

interface AppBarTitleProps {
  children: React.ReactText | React.ReactText[]
}

/**
 * The App bar title
 */
export const AppBarTitle = (props: AppBarTitleProps) => {
  const { children } = props

  return (
    <Text style={[text.default, text.primary, m.l12]}>
      { children }
    </Text>
  )
}
interface AppBarSidesProps {
  children: React.ReactElement | React.ReactElement[]
}

/**
 * Components (like [[AppBarButton]]) to be displayed on the AppBar left\
 * Such as a menu button
 */
export const AppBarLeft = (props: AppBarSidesProps) => {
  const { children } = props

  return <>
    { children }
  </>
}

/**
 * Components (like [[AppBarButton]]) to be displayed on the AppBar right\
 * Such as a settings button
 */
export const AppBarRight = (props: AppBarSidesProps) => {
  const { children } = props

  return <>
    {children}
  </>
}

interface AppBarButtonProps {
  icon: string
  provider?: React.ComponentClass
  onPress: () => void
}

/**
 * An [[IconButton]] wraped to match the Appbar styling
 */
export const AppBarButton = (props: AppBarButtonProps) => {
  const { icon, provider, onPress } = props

  return <IconButton name={icon} provider={provider || Feather} onPress={onPress} size={24} color={Colors.foreground} style={styles.icon} />
}

/**
 * @hidden
 * Wrap anything into an array if it isn't one
 */
const wrap = (maybeList) => {
  if (Array.isArray(maybeList)) return maybeList

  return [maybeList]
}

interface AppBarProps {
  /** @hidden */
  navigation: any
  /** wheter to show a back button on the right */
  backButton: boolean,
  /** @hidden */
  children: React.ReactElement | React.ReactElement[]
}

/**
 * Container component for the app bar
 */
export function AppBar(props: AppBarProps) {
  const { navigation, backButton, children } = props
  let Screen = useDimensions('window')

  let goBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const childrenArray = wrap(children)

  const title = childrenArray.find(child => child.type.name == AppBarTitle.name)

  const left = childrenArray.filter(child => child.type.name == AppBarLeft.name)
  const right = childrenArray.filter(child => child.type.name == AppBarRight.name)


  return (
    <View style={[styles.container, { width: Screen.width }]}>
      <View style={[flex, h.alignMiddle]} collapsable={false}>
        { backButton &&
        <IconButton name="arrow-left" onPress={goBack} size={24} color={Colors.foreground} provider={Feather} style={styles.icon} />
        }
        { left.length > 0 &&
          left
        }
        { title &&
          title
        }
      </View>
      {
        right.length > 0 &&
        right
      }
    </View>
  )
}

export default withNavigation(AppBar)

/** @hidden */
const styles = StyleSheet.create({
  container: {
    width: Dim.get('window').width,
    flexDirection: 'row',
    height: Dimensions.appBar.height,
    padding: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  icon: {
    margin: -4,
    padding: 12
  }
});
