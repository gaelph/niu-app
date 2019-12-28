import React from 'react';

import { View, Text, StyleSheet, TouchableNativeFeedback as Touchable} from 'react-native';

import Colors from '../../theme/colors'

export default function Button({ style = {}, onPress, disabled = false, color = 'transparent', textStyle = {}, children }) {
  return <Touchable onPress={onPress} disabled={disabled}>
    <View style={[styles.container, style, { backgroundColor: color }]}>
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </View>
  </Touchable>
}

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