import React, { useState, useCallback, useEffect } from 'react';
import {
  DatePickerAndroid, TimePickerAndroid, 
  DatePickerAndroidDateSetAction, TimePickerAndroidTimeSetAction,
} from 'react-native'

import dayjs from 'dayjs'

import { TargetTemperature } from '../../data/target-temperature/model'
import { Hold } from '../../data/hold/model'

import HoldModalComponent from '../../components/hold/HoldModal'

interface HoldModalProps {
  visible: boolean,
  targetTemperature: TargetTemperature,
  onValueChange: (change: Hold | null) => void,
  onClose: () => void,
}

export function HoldModal({ visible, targetTemperature, onValueChange, onClose }: HoldModalProps) {
  let [high, setHigh] = useState<number>(targetTemperature && targetTemperature.value ? targetTemperature.value : 15)
  let [untilTime, setUntilTime] = useState<dayjs.Dayjs>(targetTemperature ? targetTemperature.nextChange : dayjs())

  useEffect(() => {
    //@ts-ignore
    if (!visible) {
      setHigh(targetTemperature.value)
      setUntilTime(targetTemperature.nextChange)
    }
  }, [targetTemperature, visible])

  const valueChanged = useCallback((high, untilTime?) => {
    if (high == null) {
      onValueChange(null)
      return
    }

    let hold: Hold
    if (targetTemperature.hold) {
      hold = Hold.from({ id: targetTemperature.hold, value: high, untilTime })
    }
    else {
      hold = Hold.new(high, untilTime)
    }

    onValueChange(hold)
  }, [targetTemperature])

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
        
        valueChanged(high, untilTime)
      }
    }
    
  }, [high, untilTime, valueChanged])

  const defaultDateTime = useCallback(() => {
    valueChanged(high, untilTime)
  }, [high, untilTime, valueChanged])

  const resumeSchedule = useCallback(() => {
    valueChanged(null)
  }, [valueChanged])

  const setTemperature = useCallback((temperature) => {
    setHigh(temperature)
  }, [high, setHigh])
  
  return <HoldModalComponent
    visible={visible}
    value={high || ''}
    untilTime={untilTime}
    ongoing={!!targetTemperature.hold}
    onTemperatureChange={setTemperature}
    onSelectDefaultDateTime={defaultDateTime}
    onSelectDateTime={selectDateTime}
    onResumeSchedule={resumeSchedule}
    onCancel={onClose}
  />
}
