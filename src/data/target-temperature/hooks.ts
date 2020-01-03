import {useState, useRef, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'

import { CurrentSchedule, TargetTemperature } from './model'

import { useSettings, TIMEZONE_OFFSET, AWAY_TEMPERATURE } from '../settings/hooks'
import { useRules } from '../rules/hooks'
import { useHold } from '../hold/hooks'

import { currentDeviceState } from './utils'

function useCurrentDateTime() {
  const interval = useRef<number>()
  const [currentDateTime, setCurrentDateTime] = useState<dayjs.Dayjs>(dayjs())

  useEffect(() => {
    if (interval.current) clearInterval(interval.current)

    interval.current = setInterval(() => {
      setCurrentDateTime(dayjs())
    }, 1000) as unknown as number

    return () => clearInterval(interval.current)
  }, [])

  return currentDateTime
}

export function useCurrentSchedule(): CurrentSchedule {
  const datetime = useCurrentDateTime()
  const Rules = useRules()
  const Settings = useSettings()

  const timezoneOffset = useMemo(() => {
    return Settings.get<number>(TIMEZONE_OFFSET)
  }, [Settings])

  const currentSchedule = useMemo(() => {
    return currentDeviceState(Rules.rules, timezoneOffset)
  }, [datetime, Rules.rules, timezoneOffset])

  return currentSchedule
}


export function useCurrentTargetTemperature(): TargetTemperature {
  const currentSchedule = useCurrentSchedule()
  const { hold } = useHold()
  const Settings = useSettings()

  const awayTemperature = useMemo(() => {
    return Settings.get<number>(AWAY_TEMPERATURE)
  }, [Settings])

  const timezone = useMemo(() => {
    return Settings.get<number>(TIMEZONE_OFFSET)
  }, [Settings])

  const currentTargetTemperature: TargetTemperature = useMemo(() => {
    if (hold && hold.isActive()) {
      return TargetTemperature.fromHold(hold, timezone)
    }
    else {
      return TargetTemperature.fromCurrentSchedule(currentSchedule, timezone, awayTemperature)
    }
  }, [currentSchedule, hold, awayTemperature, timezone])

  return currentTargetTemperature
}