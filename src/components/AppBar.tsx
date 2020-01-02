import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions as Dim, Alert } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { withNavigation } from 'react-navigation'

import IconButton from './buttons/IconButton'

import { text, flex, m, h } from '../theme/styles'
import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { useDimensions } from '../support'

export const AppBarTitle = ({ children }) => {
  return (
    <Text style={[text.default, text.primary, m.l12]}>
      { children }
    </Text>
  )
}

export const AppBarLeft = ({ children }) => {
  return <>
    { children }
  </>
}

export const AppBarRight = ({ children }) => {
  return <>
    {children}
  </>
}

interface AppBarButtonProps {
  icon: string
  provider?: React.ComponentClass
  onPress: () => void
}

export const AppBarButton = ({ icon, provider, onPress }: AppBarButtonProps) => {
  return <IconButton name={icon} provider={provider || Feather} onPress={onPress} size={24} color={Colors.foreground} style={styles.icon} />
}

const wrap = (maybeList) => {
  if (Array.isArray(maybeList)) return maybeList

  return [maybeList]
}


export default withNavigation(function AppBar({ navigation, backButton, children }) {
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
})

const styles = StyleSheet.create({
  container: {
    width: Dim.get('window').width,
    flexDirection: 'row',
    height: Dimensions.appBar.height,
    padding: 16,
    paddingHorizontal: 16,
    // backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  icon: {
    margin: -4,
    padding: 12
  }
});
