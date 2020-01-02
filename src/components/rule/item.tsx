import React, { useRef, useEffect, useState, useCallback } from 'react'
import { View, Text, TextInput, CheckBox, Switch, StyleSheet, TouchableNativeFeedback as Touchable, Animated, TimePickerAndroid, TimePickerAndroidTimeSetAction } from 'react-native'
import { Feather } from '@expo/vector-icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

dayjs.extend(relativeTime)
dayjs.extend(utc)


import IconButton from '../buttons/IconButton'

import { text, flex, h, v, m, p } from '../../theme/styles'
import Colors from '../../theme/colors'

import { Rule, Schedule } from '../../data/rules/model'
import { Day, DayShortNames, sortDays } from '../../support/days'
import Time from '../../support/time'
import { weekday } from '../../support/days'

import TimeBar from './TimeBar'
import TemperatureSetButton from '../../containers/temperature-records/TemperatureSetButton'
import ActionButton from './ActionButton'


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
  rule: Rule
  editing: boolean,
  inputRef: React.MutableRefObject<TextInput>,
  onStartEditing: (inputRef: React.MutableRefObject<TextInput>) => void,
  onNameChange: (rule: Rule, name: string) => void,
  onActiveChange: (rule: Rule, active: boolean) => void,
}

export function Header({ rule, editing, inputRef, onNameChange, onActiveChange }: HeaderProps) {
  const { name, repeat, active, days, next_dates: nextDates } = rule

  let actualActive = repeat
    ? active
    : active && !nextDates.every(d => {
      let date = dayjs(d)
      let today = dayjs()
      return date.isBefore(today, 'day')
    })

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
  
        return DayShortNames[(weekday(day)).toString()]
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
          <TextInput ref={inputRef} editable={editing} placeholder={"Preset"} onChangeText={name => onNameChange(rule, name)} style={[text.default, text.primary, text.italic, m.r4]} value={name}/>
          <IconButton name={editing ? "chevron-up": "chevron-down"} size={24} color={Colors.border} provider={Feather} />
        </View>
        {!editing &&
          <Text style={[text.default, text.primary, text.small, text.bold]}>{daysString}</Text>
        }
      </View>
      <Switch value={actualActive} onValueChange={(active) => onActiveChange(rule, active)} />
    </View>
  )
}

interface DaySelectorProps {
  rule: Rule
  onDayChange: (rule: Rule, day: Day, value: boolean) => void,
}

export function DaySelector({ rule, onDayChange }: DaySelectorProps) {
  const { id: ruleId, days } = rule

  return (
    // <FadeInOut duration={400}>
      <View style={[flex, m.t8, h.justifyLeft, h.alignMiddle]}>
      {
        Object.keys(DayShortNames)
        .map((Day, idx) => (
          <Touchable key={`${ruleId}_${Day.toString()}`} onPress={() => onDayChange(rule, idx.toString() as unknown as Day, !days[idx])}>
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


interface RuleListItemProps {
  rule: Rule
  defaultTemperature: number
  onStartEditing: (inputRef: any) => void
  onRemove: (rule: Rule) => void
  onNameChange: (rule: Rule, name: string) => void
  onActiveChange: (rule: Rule, active: boolean) => void
  onRepeatChange: (rule: Rule, repeat: boolean) => void
  onDaysChange: (rule: Rule, day: Day, value: boolean) => void
  onAddSchedule: (rule: Rule) => void
  onUpdateSchedule: (rule: Rule, idx: number, schedule: Schedule) => void
  onRemoveSchedule: (rule: Rule, idx: number) => void
}

export default (props: RuleListItemProps) => {
  const {
    rule,
    defaultTemperature,
    onStartEditing,
    onRemove,
    onNameChange,
    onActiveChange,
    onRepeatChange,
    onDaysChange,
    onAddSchedule,
    onUpdateSchedule,
    onRemoveSchedule
  } = props


  const [width, setWidth] = useState<number>(0)
  const [editing, setEditing] = useState<boolean>(rule.name === null || rule.name === undefined)

  const inputRef = useRef<TextInput>()

  const {
    repeat,
    schedules,
  } = rule

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
          <Header rule={rule} editing={editing} inputRef={inputRef}
            onStartEditing={onStartEditing}
            onNameChange={onNameChange}
            onActiveChange={onActiveChange}
          />
          
          {/* Row with day selection and repeatable */}
          {editing &&
            <View style={[p.h8, p.b4, h.justifyLeft]}>
              <DaySelector rule={rule} onDayChange={onDaysChange} />
              <RepeatCheckBox repeat={repeat} onChange={repeat => onRepeatChange(rule, repeat)} />
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
                      <TimeSelector schedule={schedule} prop="from" onChange={(s) => onUpdateSchedule(rule, idx, s)} />

                      <Text style={[text.default, text.large, text.light]}>-</Text>

                      <TimeSelector schedule={schedule} prop="to" onChange={(s) => onUpdateSchedule(rule, idx, s)} />
                    </View>

                    {/* schedule temperature override */}
                    <TemperatureSetButton
                      value={schedule.high} 
                      defaultValue={defaultTemperature}
                      message="Select the temperture settings you would like to use for these hours"
                      onChange={(value: string) => onUpdateSchedule(rule, idx, {...schedule, high: parseInt(value, 10) })}
                      />

                    {/* Delete Schedule Button */}
                    <IconButton name="x" size={16} color="gray" provider={Feather} onPress={() => onRemoveSchedule(rule, idx)} />
                  </View>
                ))
              }
            </View>

            {/* Action buttons */}
            <View style={[h.justifyLeft, p.h8, {borderTopWidth: 1, borderTopColor: Colors.fineBorder, borderStyle: 'solid'}]}>
              {/* Add a schedule to the rule */}
              <ActionButton onPress={() => onAddSchedule(rule)} icon="plus" Provider={Feather} iconPosition="start" title="Add hours" align="start" />
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
