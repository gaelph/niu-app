import React from 'react'
import { View, Text, Modal, StyleSheet } from 'react-native'
import Button from '../buttons/Button'
import TemperaturePicker from '../../containers/temperature-records/TemperaturePicker'

import Colors from '../../theme/colors'

export default function TemperatureModal({ visible, onValueChange, onClose, onConfirm, value, children }) {

  return <Modal
    visible={visible}
    onRequestClose={onClose}
    onDismiss={onClose}
    transparent={false}
    animationType='slide'
    hardwareAccelerated={true}
    presentationStyle="pageSheet"
  >
    <View style={styles.container}>
      <Text style={[styles.text, styles.heading]}>Temperature Settings</Text>
      <Text style={[styles.text, styles.paragraph]}>
        {children}
      </Text>
      <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
        <View style={styles.inputContainer}>
          <TemperaturePicker value={value.toString()} onValueChange={onValueChange} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', width: '100%', alignItems: 'flex-end'}}>
        <Button onPress={onClose} textStyle={{ fontSize: 22 }}>Cancel</Button>
        <View collapsable={false} style={{ flex: 1 }}></View>
        <Button onPress={onConfirm} textStyle={{ fontSize: 22, color: Colors.text.primary }}>OK</Button>
      </View>
    </View>
  </Modal>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.background,
    alignItems: 'center',
    padding: 16,
    paddingTop: 96,
    justifyContent: 'flex-start'
  },
  text: {
    fontFamily: 'Raleway-Regular',
    color: 'gray'
  },
  small: {
    fontSize: 24,
  },
  heading: {
    fontFamily: 'Raleway-SemiBold',
    color: Colors.text.primary,
    fontSize: 24,
  },
  paragraph: {
    paddingVertical: 40,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    margin: 8,
    padding: 8
  },
  input: {
    fontFamily: 'Raleway-Medium',
    color: Colors.text.primary,
    fontSize: 40,
  },
  high: {
    color: Colors.accent,
  },
})