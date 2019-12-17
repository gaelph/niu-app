import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, Modal,
  DatePickerAndroid, TimePickerAndroid, 
  DatePickerAndroidDateSetAction, TimePickerAndroidTimeSetAction,
  StyleSheet
} from 'react-native'

import dayjs from 'dayjs'

import Button from './button'
import TemperaturePicker from './temperature-picker'

import Colors from '../theme/colors'
import { flex, h, v, m, p, text } from '../theme/styles'

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

interface TemperatureOverrideModalProps {
  visible: boolean,
  onValueChange: (change: { value: number, untilTime: dayjs.Dayjs }) => void,
  onClose: () => void,
  value: { id?: string, value: number, untilTime: dayjs.Dayjs },
}

export function TemperatureOverrideModal({ visible, onValueChange, onClose, value }: TemperatureOverrideModalProps) {
  let [high, setHigh] = useState<number>(value.value)
  let [untilTime, setUntilTime] = useState<dayjs.Dayjs>(value.untilTime)

  useEffect(() => {
    //@ts-ignore
    setHigh(parseInt(value.value, 10))
    setUntilTime(value.untilTime)
  }, [value])

  const selectDateTime = useCallback(async () => {
    let {action, year, month, day } = await DatePickerAndroid.open({
      date: untilTime.toDate(),
      minDate: untilTime.toDate()
    }) as DatePickerAndroidDateSetAction

    if (action === DatePickerAndroid.dateSetAction) {
      let date = dayjs().year(year).month(month).day(day)

      let { action, hour, minute } = await TimePickerAndroid.open({
        hour: untilTime.hour(),
        minute: untilTime.minute(),
        is24Hour: true
      }) as TimePickerAndroidTimeSetAction

      if (action === TimePickerAndroid.timeSetAction) {
        let untilTime = dayjs(date).hour(hour).minute(minute)
        
        onValueChange({ value: high, untilTime })
      }
    }
    setHigh(value.value)
    setUntilTime(value.untilTime)
  }, [high, untilTime])
  
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
      <Text style={[styles.text, styles.heading]}>Override temperature</Text>
      <Text style={[styles.text, styles.paragraph]}>
        Temporarily override schedule
      </Text>
      <View style={[flex, h.alignMiddle]}>
        <View style={styles.inputContainer}>
          <TemperaturePicker value={high.toString()} onValueChange={value => setHigh(value)} />
        </View>
      </View>
      <View style={[flex, v.justifyCenter, v.alignEnd]}>
        <Button onPress={() => onValueChange({ value: high, untilTime })} style={p.v12} textStyle={[ text.default, text.primary, { fontSize: 22 }]}>Until {value.untilTime && displayDatetime(value.untilTime)}</Button>
        <Button onPress={selectDateTime} style={p.v12} textStyle={[ text.default, text.primary, { fontSize: 22 }]}>Until a specific time</Button>
        {
          value.id &&
          <Button onPress={() => onValueChange(null)} style={p.v12} textStyle={[ text.default, text.accent, { fontSize: 22 }]}>Resume schedule</Button>
        }
        <Button onPress={onClose} style={[p.t12, p.b0, m.t20]} textStyle={[ text.default, text.primary, { fontSize: 22 }]}>Cancel</Button>
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