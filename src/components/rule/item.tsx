import React, { useRef, useEffect, useState, useCallback } from 'react'
import { View, Text, TextInput, CheckBox, Switch, StyleSheet, TouchableNativeFeedback as Touchable, Animated, TimePickerAndroid, TimePickerAndroidTimeSetAction } from 'react-native'
import { Feather } from '@expo/vector-icons'
import dayjs from 'dayjs'
import weekdays from 'dayjs/plugin/weekday'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

dayjs.extend(weekdays)
dayjs.extend(relativeTime)
dayjs.extend(utc)


import IconButton from '../icon-button'

import { text, flex, h, v, m, p } from '../../theme/styles'
import Colors from '../../theme/colors'

import { Rule, Schedule } from '../../api/models/rule'
import { Day, DayShortNames, DayFromNumber, sortDays, dayToInt } from '../../api/types'
import Time from '../../support/time'

import TimeBar from '../time-bar'
import TemperatureSetter from '../temperature-set-modal'
import ActionButton from '../action-button'


export function FadeInOut({ duration, children }) {
  let opacity = new Animated.Value(0)
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration }).start()

    return () => {
      Animated.timing(opacity, { toValue: 0, duration }).start()
    }
  }, [])

  return (
    <Animated.View style={{ opacity: opacity }}>{children}</Animated.View>
  )
}


interface HeaderProps {
  name: string
  active: boolean,
  days: {
    [T in Day]: boolean
  }
  nextDates: Date[],
  editing: boolean,
  inputRef: React.MutableRefObject<TextInput>,
  onStartEditing: (inputRef: React.MutableRefObject<TextInput>) => void,
  onNameChange: (name: string) => void,
  onActiveChange: (active: boolean) => void,
}

export function Header({ name, active, days, nextDates, editing, inputRef, onNameChange, onActiveChange }: HeaderProps) {
  let _inputRef = useRef<TextInput>()

  const daysString = nextDates.length == 0 
  ? Object.keys(days)
    .filter(day => days[day])
    .sort(sortDays)
    .map(day => DayShortNames[day])
    .filter(day => day !== undefined)
    .join(', ')
  : nextDates
    .map(d => dayjs(d))
    .filter(d => !d.isBefore(dayjs()))
    .map((d: dayjs.Dayjs) => d.unix())
    .sort()
    .map((timestamp: number) => dayjs.unix(timestamp))
    .map((day: dayjs.Dayjs) => {
      let tomorrow = dayjs().utc().add(1, 'day')
      if (day.utc().isSame(dayjs().utc(), 'day')) {
        return 'Today'
      }
      else if (day.utc().isSame(tomorrow, 'day')) {
        return 'Tomorrow'
      }
      else {
        return DayShortNames[(day.weekday() - 1).toString()]
      }
    })
    .join(', ')

  useEffect(() => {
    editing && inputRef.current && inputRef.current.focus()
  }, [editing, inputRef])

  return (
    // <View style={[h.alignStart, p[8], p.b0, headerStyles.container]}>
    <View style={[h.alignStart, p[8], p.b0, { flexDirection: 'row' }]}>
      <View collapsable={false} style={flex}>
        <View style={[h.alignMiddle, flex ]}>
          <TextInput ref={inputRef} editable={editing} placeholder={"Preset"} onChangeText={onNameChange} style={[text.default, text.primary, text.italic, m.r4]} value={name}/>
          <IconButton name={editing ? "chevron-up": "chevron-down"} size={24} color={Colors.border} provider={Feather} />
        </View>
        {!editing &&
          <Text style={[text.default, text.primary, text.small, text.bold]}>{daysString}</Text>
        }
      </View>
      <Switch value={active} onValueChange={onActiveChange} />
    </View>
  )
}

interface DaySelectorProps {
  days: {
    [T in Day]: boolean
  },
  ruleId: string,
  onDayChange: (day: Day, value: boolean) => void,
}

export function DaySelector({ days, ruleId, onDayChange }: DaySelectorProps) {
  return (
    // <FadeInOut duration={400}>
      <View style={[flex, m.t8, h.justifyLeft, h.alignMiddle]}>
      {
        Object.keys(DayShortNames)
        .map((Day, idx) => (
          <Touchable key={`${ruleId}_${Day.toString()}`} onPress={() => onDayChange(idx.toString() as unknown as Day, !days[idx])}>
            <View style={[v.center, m.r4, dayStyles.dayCircle, { opacity: days[idx] ? 1 : 0.4 }]}>
              <Text style={[text.default, text.primary, text.bold, text.small]}>{DayShortNames[Day].charAt(0)}</Text>
            </View>
          </Touchable>
        ))
      }
      </View>
    // </FadeInOut>
  )
}

export function RepeatCheckBox({ repeat, onChange }) {
  return (
    // <FadeInOut duration={400}>
      <View style={[h.justifyRight, h.alignMiddle, m.t8, dayStyles.repeatContainer]} collapsable={false}>
        <Text style={[text.default, text.small]}>Repeat</Text>
        <CheckBox value={repeat} onValueChange={onChange} />
      </View>
    // </FadeInOut>
  )
}

async function openTimePicker(schedule: Schedule, property: "from" | "to"): Promise<Schedule | undefined> {
  let time = schedule[property]
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

type TimeSelectorProps = {
  schedule: Schedule,
  prop: "from" | "to",
  onChange: (schedule: Schedule) => void
}

export function TimeSelector({ schedule, prop, onChange }: TimeSelectorProps) {
  return (
    <Touchable onPress={async () => {
      let newSchedule = await openTimePicker(schedule, prop)
      newSchedule && onChange(newSchedule)
    }}>
      <View>
        <Text style={[text.default, text.large, text.light]}>{schedule[prop].toString()}</Text>
      </View>
    </Touchable>
  )
}


function nextDays(days: {[K in Day]: boolean}, date: Date): Date[] {
  return Object.values(days)
    .map((bool: boolean, i: number) => [i, bool])
    .filter(([_, bool]: [number, boolean]) => bool)
    .map(([day, _]: [number, boolean]) => {
      return dayjs(date).weekday(day + 1).toDate()
    })

}

export default ({ rule, defaultTemperature, onStartEditing, onChange, onRemove }) => {
  const [name, setName] = useState<string>(rule.name)
  const [active, setActive] = useState<boolean>(rule.active)
  const [repeat, setRepeat] = useState<boolean>(rule.repeat)
  const [days, setDays] = useState(rule.days)
  const [nextDates, setNextDates] = useState<Date[]>(rule.next_dates)
  const [schedules, setSchedules] = useState(rule.schedules)

  const [width, setWidth] = useState<number>(0)
  const [editing, setEditing] = useState<boolean>(rule.name === null || rule.name === undefined)

  const inputRef = useRef<TextInput>()

  const updateName = useCallback((name) => {
    setName(name)
    onChange({ id: rule.id, name })
  }, [rule])

  const updateActive = useCallback((active) => {
    setActive(active)

    let next_dates = []
    if (active && !rule.repeat) {
      next_dates = nextDays(rule.days, new Date())
    }
    setNextDates(next_dates)

    onChange({ id: rule.id, active, next_dates })
  }, [rule])

  const updateRepeat = useCallback((repeat) => {
    setRepeat(repeat)

    let next_dates = []
    if (!repeat) {
      next_dates = nextDays(rule.days, new Date())
    }

    setNextDates(next_dates)

    onChange({ id: rule.id, repeat, next_dates })
  }, [rule])

  const updateDays = useCallback((day, value) => {
    let update = { ...days, [day]: value }

    let next_dates = []
    if (!rule.repeat) {
      next_dates = nextDays(update, new Date())
    }

    setDays(update)
    setNextDates(next_dates)
    onChange({ id: rule.id, days: update, next_dates })
  }, [rule])

  const updateSchedules = useCallback((schedules) => {
    setSchedules(schedules)
    onChange({ id: rule.id, schedules })
  }, [rule])

  const addSchedule = useCallback(async () => {
    let schedule = Schedule.default()
    schedule.high = defaultTemperature

    schedule = await openTimePicker(schedule, 'from')

    if (schedule) {
      schedule = await openTimePicker(schedule, 'to')

      if (schedule) {
        updateSchedules([...schedules, schedule])
      }
    }

  }, [schedules])

  const updateSchedule = useCallback((idx, schedule) => {
    let updated = schedules.map((s, i) => {
      if (i === idx)
        return schedule

      return s
    })

    updateSchedules(updated)
  }, [schedules])

  const removeSchedule = useCallback((idx: number) => {
    let updates = schedules.filter((_, i: number) => i !== idx)

    updateSchedules(updates)
  }, [schedules])

  let actualActive = repeat
    ? active
    : active && !nextDates.every(d => {
      let date = dayjs(d)
      let today = dayjs()
      return date.isBefore(today, 'day')
    })

  return (
    <View style={[m.b16, styles.item]} onLayout={({ nativeEvent: { layout: { width } } }) => setWidth(width - 2)}>
      <Touchable onPress={() => {
        setEditing(!editing)
        if (!editing) {
          onStartEditing(inputRef)
        }
      }}>
        <View collapsable={false}>
          {/* Header of the rule view */}
          <Header name={name} active={actualActive} days={days} nextDates={nextDates} editing={editing} inputRef={inputRef}
            onStartEditing={onStartEditing}
            onNameChange={updateName}
            onActiveChange={updateActive}
          />
          
          {/* Row with day selection and repeatable */}
          {editing &&
            <View style={[p.h8, p.b4, h.justifyLeft]}>
              <DaySelector ruleId={rule.id} days={days} onDayChange={updateDays} />
              <RepeatCheckBox repeat={repeat} onChange={updateRepeat} />
            </View>
          }

          {/* Time bar */}
          <TimeBar schedules={schedules} width={width} height={18+4} padding={8} />

          {/* Rule Editor */}
          { editing && (<>
            {/* Schedule editor */}
            <View style={[p.h8, styles.ruleEditor]}>
              {
                schedules.map((schedule: Schedule, idx: number) => (
                  <View key={`${rule.id}_${schedule.from}_${schedule.to}`} style={{ flexDirection: 'row', alignItems:'center', paddingVertical: 8 }}>
                    <View style={[flex, h.alignMiddle]}>
                      <TimeSelector schedule={schedule} prop="from" onChange={(s) => updateSchedule(idx, s)} />

                      <Text style={[text.default, text.large, text.light]}>-</Text>

                      <TimeSelector schedule={schedule} prop="to" onChange={(s) => updateSchedule(idx, s)} />
                    </View>

                    {/* schedule temperature override */}
                    <TemperatureSetter
                      value={schedule.high} 
                      defaultValue={defaultTemperature}
                      message="Select the temperture settings you would like to use for these hours"
                      onChange={value => updateSchedule(idx, {...schedule, high: value })}
                      />

                    {/* Delete Schedule Button */}
                    <IconButton name="x" size={16} color="gray" provider={Feather} onPress={() => removeSchedule(idx)} />
                  </View>
                ))
              }
            </View>

            {/* Action buttons */}
            <View style={[h.justifyLeft, p.h8, {borderTopWidth: 1, borderTopColor: Colors.fineBorder, borderStyle: 'solid'}]}>
              {/* Add a schedule to the rule */}
              <ActionButton onPress={addSchedule} icon="plus" Provider={Feather} iconPosition="start" title="Add hours" align="start" />
              {/* Delete the rule */}
              <ActionButton onPress={() => onRemove(rule)} icon="trash-2" Provider={Feather} iconPosition="start" title="Remove" align="end" />
            </View>
          </>)}
      </View>
      
      </Touchable>
    </View>
  )
}

const headerStyles = StyleSheet.create({
  container: {
    // position: 'relative',
    // overflow: 'visible'
  }
})

const dayStyles = StyleSheet.create({
  dayCircle: {
    width: 24,
    height: 24,
    borderColor: Colors.text.primary,
    borderWidth: 1,
    borderRadius: 12
  },
  repeatContainer: {
    height: 24,
  }
})

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'solid',
    borderRadius: 0,
    paddingBottom: 0, 
    overflow: 'visible',
    marginBottom: 16,
    position: 'relative',
  },
  subHeader: {
    flexWrap: 'wrap'
  },
  ruleEditor: {
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.fineBorder,
    borderStyle: 'solid'
  },
  text: {
    color: Colors.text.primary,
    fontSize: 20,
    fontFamily: 'Raleway-Bold'
  },
  smallText: {
    color: Colors.text.primary,
    fontSize: 24,
    fontFamily: 'Raleway-Regular'
  },
  name: {
    fontFamily: 'Raleway-MediumItalic',
    marginRight: 4
  },
  timeSelector: {
    fontSize: 34,
    fontFamily: 'Raleway-Light',
    color: 'grey'
  }
})
