import React from 'react';
import {
  View, Text, Modal,
  StyleSheet
} from 'react-native'

import dayjs from 'dayjs'

import Button from '../buttons/Button'
import TemperaturePicker from '../../containers/temperature-records/TemperaturePicker'

import Colors from '../../theme/colors'
import { flex, h, v, m, p, text } from '../../theme/styles'

function displayDatetime(datetime: dayjs.Dayjs): string {
  let time = datetime.format('H:mm')
  let day = ''

  let now = dayjs()
  if (datetime.isSame(now, 'day')) {
    return time
  }

  let tomorrow = now.add(1, 'day')
  if (datetime.isSame(tomorrow, 'day')) {
    day = 'tomorrow'
  }
  else {
    day = datetime.format('ddd')
  }

  return `${day} at ${time}`
}

interface HoldModalProps {
  visible: boolean,
  value: number | string,
  untilTime: dayjs.Dayjs,
  ongoing: boolean
  onTemperatureChange: (value: number) => void,
  onSelectDefaultDateTime: () => void,
  onSelectDateTime: () => Promise<void>
  onResumeSchedule: () => void,
  onCancel: () => void,
}

export default function HoldModal(props: HoldModalProps) {
  const {
    visible,
    value,
    untilTime,
    ongoing,
    onTemperatureChange,
    onSelectDefaultDateTime,
    onSelectDateTime,
    onResumeSchedule,
    onCancel,
  } = props

  return <Modal
    visible={visible}
    onRequestClose={onCancel}
    onDismiss={onCancel}
    transparent={false}
    animationType='slide'
    hardwareAccelerated={true}
    presentationStyle="pageSheet"
  >
    <View style={styles.container}>
      <Text style={[styles.text, styles.heading]}>Override temperature</Text>
      <Text style={[styles.text, styles.paragraph]}>
        Temporarily override schedule
      </Text>
      <View style={[flex, h.alignMiddle]}>
        <View style={styles.inputContainer}>
          <TemperaturePicker value={value.toString()} onValueChange={onTemperatureChange} />
        </View>
      </View>
      <View style={[flex, v.justifyCenter, v.alignEnd]}>
        { untilTime &&
          <Button onPress={onSelectDefaultDateTime} style={p.v12} textStyle={[ text.default, text.primary, { fontSize: 22 }]}>Until {displayDatetime(untilTime)}</Button>
        }
        <Button onPress={onSelectDateTime} style={p.v12} textStyle={[ text.default, text.primary, { fontSize: 22 }]}>Until a specific time</Button>
        {
          ongoing &&
          <Button onPress={onResumeSchedule} style={p.v12} textStyle={[ text.default, text.accent, { fontSize: 22 }]}>Resume schedule</Button>
        }
        <Button onPress={onCancel} style={[p.t12, p.b0, m.t20]} textStyle={[ text.default, text.primary, { fontSize: 22 }]}>Cancel</Button>
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
    paddingTop: '10%',
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