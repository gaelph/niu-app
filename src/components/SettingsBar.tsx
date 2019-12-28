import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions as Dim, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { withNavigation } from 'react-navigation'

import IconButton from './buttons/IconButton'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { text, flex, m } from '../theme/styles'
import { useDimensions } from '../support'

export default withNavigation(function SettingsBar({ navigation }) {
  let Screen = useDimensions('window')

  let onPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  return (
    <View style={[styles.container, { width: Screen.width }]}>
      <IconButton name="arrow-left" onPress={onPress} size={24} color={Colors.foreground} provider={Feather} style={styles.icon} />
      <Text style={[text.default, text.primary, flex, m.l12]}>
        Settings
      </Text>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: Dim.get('window').width,
    flexDirection: 'row',
    height: Dimensions.appBar.height,
    padding: 16,
    // backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  icon: {
    padding: 12,
  }
});
