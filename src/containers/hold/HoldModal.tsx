import React, { useState, useCallback, useEffect } from 'react';
import {
  DatePickerAndroid, TimePickerAndroid, 
  DatePickerAndroidDateSetAction, TimePickerAndroidTimeSetAction,
} from 'react-native'

import dayjs from 'dayjs'

import { CurrentState } from '../../data/rules/device-state'

import HoldModalComponent from '../../components/hold/HoldModal'

function eitherTime(value, currentSchedule) {
  if (value) {
    if (!value.untilTime.isBefore(dayjs())) {
      return value.untilTime
    }
  }
    
  return currentSchedule.nextChange
}

interface HoldModalProps {
  visible: boolean,
  onValueChange: (change: { id: string, value: number, untilTime: dayjs.Dayjs }) => void,
  onClose: () => void,
  value: { id?: string, value: number, untilTime: dayjs.Dayjs },
  currentSchedule: CurrentState
}

export function HoldModal({ visible, currentSchedule, onValueChange, onClose, value }: HoldModalProps) {
  let [high, setHigh] = useState<number>(value ? value.value : 15)
  let [untilTime, setUntilTime] = useState<dayjs.Dayjs>(eitherTime(value, currentSchedule))

  useEffect(() => {
    //@ts-ignore
    setHigh(parseInt(value.value, 10))
    setUntilTime(eitherTime(value, currentSchedule))
  }, [value, currentSchedule])

  const selectDateTime = useCallback(async () => {
    let {action, year, month, day } = await DatePickerAndroid.open({
      date: untilTime.toDate(),
      minDate: dayjs().toDate()
    }) as DatePickerAndroidDateSetAction

    if (action === DatePickerAndroid.dateSetAction) {
      let date = dayjs(`${year}-${month + 1}-${day}`)

      let { action, hour, minute } = await TimePickerAndroid.open({
        hour: untilTime.hour(),
        minute: untilTime.minute(),
        is24Hour: true
      }) as TimePickerAndroidTimeSetAction

      if (action === TimePickerAndroid.timeSetAction) {
        let untilTime = dayjs(date).hour(hour).minute(minute)
        
        onValueChange({ id: value.id, value: high, untilTime })
      }
    }
    setHigh(value.value)
    setUntilTime(value.untilTime)
  }, [high, untilTime, onValueChange])

  const defaultDateTime = useCallback(() => {
    onValueChange({id: value.id, value: high, untilTime })
  }, [high, untilTime, onValueChange])

  const resumeSchedule = useCallback(() => {
    onValueChange(null)
  }, [onValueChange])

  const setTemperature = useCallback((temperature) => {
    setHigh(temperature)
  }, [high, setHigh])
  
  return <HoldModalComponent
    visible={visible}
    value={high}
    untilTime={untilTime}
    ongoing={!!value.id}
    onTemperatureChange={setTemperature}
    onSelectDefaultDateTime={defaultDateTime}
    onSelectDateTime={selectDateTime}
    onResumeSchedule={resumeSchedule}
    onCancel={onClose}
  />
}
