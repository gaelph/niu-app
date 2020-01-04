/**
 * @category Containers
 * @module containers/rules
 * @packageDocumentation
 */
import React, { useCallback, useState, useRef, useEffect } from 'react'
import { TimePickerAndroid, TimePickerAndroidTimeSetAction } from 'react-native'
import dayjs from 'dayjs'

import { useRules } from 'data/rules/hooks'
import { useSettings, DEFAULT_TARGET } from 'data/settings/hooks'
import { Rule, Schedule } from 'data/rules/model'

import Toast from 'support/toast'
import { Day } from 'support/days'
import Time from 'support/time'

import RuleList from 'components/rule/RuleList'

function nextDays(days: {[K in Day]: boolean}, date: Date): Date[] {
  return Object.values(days)
    .map((bool: boolean, i: number) => [i, bool])
    .filter(([_, bool]: [number, boolean]) => bool)
    .map(([day, _]: [number, boolean]) => {
      return dayjs(date).weekday(day + 1).toDate()
    })
}

async function openTimePicker(schedule: Schedule, property: "from" | "to"): Promise<Schedule | undefined> {
  let time = schedule[property as string]
  let {action, hour, minute} = await TimePickerAndroid.open({
    hour: time.hours,
    minute: time.minutes,
    is24Hour: true
  }) as TimePickerAndroidTimeSetAction

  if (action == TimePickerAndroid.timeSetAction) {
    return {
      ...schedule,
      [property]: new Time(hour, minute)
    }
  }
}

interface RulesListProps {
  onStartEditing: (inputRef: React.MutableRefObject<React.ReactElement>) => void
}

/**
 * Displays a list of Rules and allows for modifying or deleting them
 */
export default function RulesList(props: RulesListProps): React.ReactElement {
  const { onStartEditing } = props
  const Rules = useRules({
    onMutationSuccess: () => Toast.showChangesOK(),
    onMutationError: error => {
      console.log(error)
      console.log(error.graphQLErrors)

      Toast.showError()
    }
  })
  // Keep a local copy of rules to allow for debouncing user input
  const [localRules, setLocalRules] = useState(Rules.rules)

  useEffect(() => {
    if (Rules.ready && !Rules.loading) {
      setLocalRules(Rules.rules)
    }
  }, [Rules.rules])

  const Settings = useSettings()
  const defaultTarget = Settings.get(DEFAULT_TARGET)

  const debounceTimeout = useRef<number>()

  // DEBOUNCE USER INPUT
  const debouncedUpdate = useCallback((update) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)

    let updatedRules = localRules.map(r => {
      if (r.id == update.id) {
        return update
      }

      return r
    })

    setLocalRules(updatedRules)

    debounceTimeout.current = setTimeout(() => {
      Rules.update(update)
    }, 1000) as unknown as number
  }, [Rules, localRules])

  // Updates a rule name
  const updateName = useCallback((rule: Rule, name: string) => {
    debouncedUpdate({ ...rule, name })
  }, [Rules])

  // Updates a rule active status
  const updateActive = useCallback((rule: Rule, active: boolean) => {
    let next_dates = []
    if (active && !rule.repeat) {
      next_dates = nextDays(rule.days, new Date())
    }

    debouncedUpdate({ ...rule, active, next_dates })
  }, [Rules])

  // Updates a rule repeat status
  const updateRepeat = useCallback((rule: Rule, repeat: boolean) => {
    let next_dates = []
    if (!repeat) {
      next_dates = nextDays(rule.days, new Date())
    }

    debouncedUpdate({ ...rule, repeat, next_dates })
  }, [Rules])

  // Updates a rule day value
  const updateDays = useCallback((rule: Rule, day: Day, value: boolean) => {
    let update = { ...rule.days, [day]: value }

    let next_dates = []
    if (!rule.repeat) {
      next_dates = nextDays(update, new Date())
    }

    debouncedUpdate({ ...rule, days: update, next_dates })
  }, [Rules])

  // Updates a rule schedule list
  const updateSchedules = useCallback((rule: Rule, schedules: Schedule[]) => {
    debouncedUpdate({ ...rule, schedules })
  }, [Rules])

  // Adds a schedule to a rule
  const addSchedule = useCallback(async (rule: Rule) => {
    let schedule = Schedule.default()
    schedule.high = defaultTarget

    schedule = await openTimePicker(schedule, 'from')

    if (schedule) {
      schedule = await openTimePicker(schedule, 'to')

      if (schedule) {
        updateSchedules(rule, [...rule.schedules, schedule])
      }
    }

  }, [Rules])

  // Updates a single schedule in a rule schdules list
  const updateSchedule = useCallback((rule, idx, schedule) => {
    let updated = rule.schedules.map((s, i) => {
      if (i === idx)
        return schedule

      return s
    })

    updateSchedules(rule, updated)
  }, [Rules])

  // Removes a schedule from a rule's schdule list
  const removeSchedule = useCallback((rule, idx: number) => {
    let updates = rule.schedules.filter((_, i: number) => i !== idx)

    updateSchedules(rule, updates)
  }, [Rules])

  return <RuleList
    rules={localRules}
    defaultTemperature={defaultTarget}
    onStartEditing={onStartEditing}
    onRemove={Rules.remove}
    onNameChange={updateName}
    onActiveChange={updateActive}
    onRepeatChange={updateRepeat}
    onDaysChange={updateDays}
    onAddSchedule={addSchedule}
    onUpdateSchedule={updateSchedule}
    onRemoveSchedule={removeSchedule}
  />
}