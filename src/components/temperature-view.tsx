import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableNativeFeedback as Touchable, StyleSheet } from'react-native';

import dayjs from 'dayjs'
import weekdays from 'dayjs/plugin/weekday'

import { TemperatureRecord } from '../api/models/temperature-record'
import { Override } from '../api/models/override'
import { DayFromNumber } from '../api/types'

import ModeSelector from './mode-selector'

import Colors from '../theme/colors'

import { CurrentState } from '../rules'

import { TemperatureOverrideModal } from './temperature-override-modal'

dayjs.extend(weekdays)


const temp = {
  integer(t: number): number {
    return Math.floor(t)
  },
  decimals(t: number): number {
    return Math.floor((t - this.integer(t)) * 10)
  }
}

type TemperatureViewProps = {
  record: TemperatureRecord
  defaultTemperature: number
  deviceState: CurrentState
  override: Override
  onOverride: (override, update: { value: number, untilTime: dayjs.Dayjs }) => void
}


function displayDatetime(datetime: dayjs.Dayjs): string {
  const time = `${datetime.hour()}h${datetime.minute().toString().padStart(2, '0')}`

  let now = dayjs();
  if (datetime.isSame(now, 'day')) {
    return time
  }

  let tomorrow = now.add(1, 'day')
  let dayName = ''

  if (datetime.isSame(tomorrow, 'day')) {
    dayName = 'tomorrow'
  } else {
    dayName = DayFromNumber[datetime.weekday() - 1]
  }
  return `${dayName} at ${time}`
}

function displayDeviceState({ current, nextChange }: CurrentState, defaultTemperature: number): string {
  if (!current && !nextChange) return ''

  if (!current) {
    return `${defaultTemperature}˚ until ${displayDatetime(nextChange)}`
  }

  return `${current.schedule.high}˚ until ${displayDatetime(nextChange)}`
}

export default function TemperatureView({ record, defaultTemperature, deviceState, override, onOverride }: TemperatureViewProps): React.ReactElement {
  const scheduleString = displayDeviceState(deviceState, defaultTemperature)

  const overrideActive: boolean = useMemo(() => {
    if (override === null) return false
    
    return override.isActive()
  }, [override])

  const [overrideModal, setOverrideModal] = useState<boolean>(false)

  const _onOverride = useCallback((update: { value: number, untilTime: dayjs.Dayjs} ) => {
    setOverrideModal(false)
    onOverride(override, update)
  }, [override])

  const currentOverride = overrideActive
    ? override
    : {
        value: (deviceState.current && deviceState.current.schedule.high) || defaultTemperature,
        untilTime: deviceState.nextChange
      }

  return (
    <View style={styles.content}>
      <View style={styles.tempView}>
        <Text style={[styles.text, styles.temp]}>{temp.integer(record.value)}</Text>
        <Text style={[styles.text, styles.tempUnit]}>˚</Text>
        <Text style={[styles.text, styles.tempDecimals]}>.{temp.decimals(record.value)}</Text>
      </View>
      <Touchable onPress={() => setOverrideModal(true)}>
        <View style={styles.schedule}>
          <Text style={[styles.text, styles.timeText]}>
            {
              overrideActive
              ? `Holding ${override.value}˚ until ${displayDatetime(override.untilTime)}`
              : scheduleString
              }
          </Text>
        </View>
      </Touchable>
      <ModeSelector deviceState={deviceState} />
      <TemperatureOverrideModal visible={overrideModal}  onValueChange={_onOverride} onClose={() => setOverrideModal(false)} value={currentOverride} />
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
  },
  text: {
    color: Colors.text.primary,
    fontFamily: 'Raleway-SemiBold'
  },
  tempView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: -4
  },
  temp: {
    fontSize: 96,
    fontFamily: 'Raleway-SemiBold'
  },
  tempUnit: {
    fontSize: 60,
    marginBottom: 20,
  },
  tempDecimals: {
    fontSize: 40,
    marginLeft: -16,
    paddingBottom: 13
  },
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
