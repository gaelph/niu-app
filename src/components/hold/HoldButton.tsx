import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { View, Text, TouchableNativeFeedback as Touchable, StyleSheet } from 'react-native'
import dayjs from 'dayjs'

import { text, h, m } from '../../theme/styles'
import Colors from '../../theme/colors'
import { DayFromNumber } from '../../support/days'
import Toast from '../../support/toast'

import { useHold } from '../../data/hold/hooks'
import { useCurrentSchedule } from '../../data/rules/hooks'
import { CurrentState } from '../../data/rules/device-state'
import { useSettings, AWAY_TEMPERATURE, TIMEZONE_OFFSET } from '../../data/settings/hooks'

import { HoldModal } from './HoldModal'

function displayDatetime(datetime: dayjs.Dayjs, timezone: number): string {
  const datetimeWithZone = datetime.add(timezone / 60, 'minute')
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
    dayName = DayFromNumber[datetime.weekday()]

    if (datetime.diff(now, 'day') > 7) {
      dayName += ' ' + datetime.date()
    }
  }
  return `${dayName} at ${time}`
}

function displayDeviceState({ current, nextChange }: CurrentState, defaultTemperature: number = 15, timezone: number): string {
  if (!current && !nextChange) return ''

  if (!current) {
    return `${defaultTemperature}˚ until ${displayDatetime(nextChange, timezone)}`
  }

  return `${current.schedule.high}˚ until ${displayDatetime(nextChange, timezone)}`
}


export function HoldButton () {
  const [showModal, setShowModal] = useState<boolean>(false)
  const { hold, updateHold } = useHold({
    onMutationSuccess: () => {
      Toast.showChangesOK()
      setShowModal(false)
    },
    onMutationError: (error: Error) => {
      console.error(error)
      Toast.showError()
    }
  })
  
  const currentSchedule = useCurrentSchedule()
  const Settings = useSettings()
  const awayTemperature = Settings.get(AWAY_TEMPERATURE)
  const timezone = Settings.get(TIMEZONE_OFFSET)

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

  const onValueChange = useCallback((hold) => {
    updateHold(hold)
  }, [updateHold, setShowModal])

  return (Settings &&
  <View style={[h.justifyCenter, h.alignMiddle, m.t24]}>
    <Touchable onPress={() => setShowModal(true)}>
      <View style={styles.schedule}>
        <Text style={[text.default, text.primary, text.semiBold, styles.timeText]}>
          { holdText }
        </Text>
      </View>
    </Touchable>
    <HoldModal visible={showModal} onClose={() => setShowModal(false)} value={hold} onValueChange={onValueChange} />
  </View>
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
