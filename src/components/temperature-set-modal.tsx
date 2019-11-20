import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet } from 'react-native'
import Button from './button'

import Colors from '../theme/colors'

function removeUnit(value) {
  return parseFloat(value).toString()
}

export default function TemperatureSetModal({ visible, onValueChange, onClose, value }) {
  let [high, setHigh] = useState(value.high.toString())

  console.log('render modal', visible, value)
  return <Modal
    visible={visible}
    onRequestClose={() => onValueChange({ high })}
    onDismiss={onClose}
    transparent={false}
    animationType='slide'
    hardwareAccelerated={true}
    presentationStyle="pageSheet"
  >
    <View style={styles.container}>
      <Text style={[styles.text, styles.heading]}>Temperature Settings</Text>
      <Text style={[styles.text, styles.paragraph]}>
        Select the temperture settings you would like to use for these hours
      </Text>
      <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
        <View style={styles.inputContainer}>
          <TextInput value={high} onChangeText={setHigh} autoFocus
           style={[styles.input, styles.high]} keyboardType='numeric' maxLength={3} onSubmitEditing={() => onValueChange(({ high }))} />
          <Text style={[styles.input, styles.high]}>˚</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', width: '100%', alignItems: 'flex-end'}}>
        <Button onPress={onClose} textStyle={{ fontSize: 22 }}>Cancel</Button>
        <View collapsable={false} style={{ flex: 1 }}></View>
        <Button onPress={() => onValueChange({ high })} textStyle={{ fontSize: 22, color: Colors.text.primary }}>OK</Button>
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
    borderColor: Colors.border,
    borderStyle: 'solid',
    borderBottomWidth: 1,
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