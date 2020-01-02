import React, { useMemo } from 'react'
import { View, Text, TouchableNativeFeedback as Touchable, StyleSheet } from 'react-native'
import dayjs from 'dayjs'

import { text } from '../../theme/styles'
import Colors from '../../theme/colors'
import { DayFromNumber, weekday } from '../../support/days'
import { CurrentState } from '../../data/rules/device-state'
import { Hold } from '../../data/hold/model'

function displayDatetime(datetime: dayjs.Dayjs, timezone: number): string {

  const datetimeWithZone = datetime.utc().add(timezone / 60, 'minute')
  const hours = datetimeWithZone.hour().toString()
  const minutes = datetimeWithZone.minute().toString().padStart(2, '0')

  const time = `${hours}h${minutes}`

  let now = dayjs();
  if (datetime.isSame(now, 'day')) {
    return time
  }

  let tomorrow = now.add(1, 'day')
  let dayName = ''

  if (datetime.isSame(tomorrow, 'day')) {
    dayName = 'tomorrow'
  } else {
    dayName = DayFromNumber[weekday(datetime)]

    if (datetime.diff(now, 'day') > 7) {
      dayName += ' ' + datetime.date()
    }
  }
  return `${dayName} at ${time}`
}

function displayDeviceState({ current, nextChange }: CurrentState, defaultTemperature: number = 15, timezone: number): string {
  if (!current && !nextChange) return `${defaultTemperature || '...'}˚`

  if (!current) {
    return `${defaultTemperature}˚ until ${displayDatetime(nextChange, timezone)}`
  }

  return `${current.schedule.high}˚ until ${displayDatetime(nextChange, timezone)}`
}

interface HoldButtonProps {
  currentSchedule: CurrentState
  hold: Hold
  awayTemperature: number
  timezone: number
  onPress: () => void
}

export function HoldButton ({ currentSchedule, hold, awayTemperature, timezone, onPress }: HoldButtonProps) {
  const holdActive = useMemo(() => {
    return hold
      ? hold.isActive()
      : false
  }, [hold])

  const holdText = useMemo(() => {
    return holdActive
      ? `Holding ${hold.value}˚ until ${displayDatetime(hold.untilTime, timezone)}`
      : displayDeviceState(currentSchedule, awayTemperature, timezone)
  }, [hold, holdActive, currentSchedule, awayTemperature])


  return (
    <Touchable onPress={onPress}>
      <View style={styles.schedule}>
        <Text style={[text.default, text.primary, text.semiBold, styles.timeText]}>
          { holdText }
        </Text>
      </View>
    </Touchable>
  )
}


const styles = StyleSheet.create({
  timeText: {
    fontSize: 16,
    lineHeight: 16,
  },
  schedule: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 2,
  }
});
