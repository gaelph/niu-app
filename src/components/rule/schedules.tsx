import React, { useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { Schedule } from '../../api/models/rule'

import { TimeSelector } from './item'
import TemperatureSetter from '../temperature-set-modal'
import IconButton from '../icon-button'

import { text, h, p } from '../../theme/styles'

type SchedulesProps = {
  id: string
  schedules: Schedule[]
  onChange: (schedules: Schedule[]) => void
}

export default function Schedules({ id, schedules, onChange }) {

  let updateSchedule = useCallback((idx, schedule) => {
    let updated = schedules.map((s, i) => {
      if (i === idx) {
        return schedule
      }

      return s
    })

    onChange(updated)
  }, [schedules])

  let removeSchedule = useCallback(idx => {
    let updated = schedules.map((_, i) => i !== idx)

    onChange(updated)
  }, [schedules])

  return (
    <View collapsable={false}>
      {
        schedules.map((schedule, idx) => (
          <View key={`${id}_${schedule.from}_${schedule.to}`} style={[h.alignMiddle, p.v8]}>
            <TimeSelector schedule={schedule} prop="from" onChange={(s) => updateSchedule(idx, s)} />

            <Text style={styles.timeSelector}>-</Text>

            <TimeSelector schedule={schedule} prop="to" onChange={(s) => updateSchedule(idx, s)} />

            {/* schedule temperature override */}
            <TemperatureSetter value={schedule.high} onChange={value => updateSchedule(idx, {...schedule, high: value })} />

            {/* Delete Schedule Button */}
            <IconButton name="x" size={16} color="gray" provider={Feather} onPress={() => removeSchedule(idx)} />
          </View>
        ))
      }
    </View>
  )
}

const styles = {
  timeSelector: [text.default, text.large, text.light]
}