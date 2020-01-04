/**
 * @category Components
 * @module components/rule
 * @packageDocumentation
 */
import React, { useRef, useEffect, useState } from 'react'
import { View, Text, TextInput, CheckBox, Switch, StyleSheet, TouchableNativeFeedback as Touchable, Animated, TimePickerAndroid, TimePickerAndroidTimeSetAction } from 'react-native'
import { Feather } from '@expo/vector-icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

// TODO: Move to App initialization
dayjs.extend(relativeTime)
dayjs.extend(utc)

import IconButton from '../buttons/IconButton'

import { text, flex, h, v, m, p } from 'theme/styles'
import Colors from 'theme/colors'

import { Rule, Schedule } from 'data/rules/model'
import { Day, DayShortNames, sortDays } from 'support/days'
import Time from 'support/time'
import { weekday } from 'support/days'

import TimeBar from './TimeBar'
import TemperatureSetButton from 'containers/temperature-records/TemperatureSetButton'
import ActionButton from './ActionButton'


interface HeaderProps {
  rule: Rule
  editing: boolean,
  /** Used to scroll to the input when the focus on it */
  inputRef: React.MutableRefObject<TextInput>,
  onNameChange: (rule: Rule, name: string) => void,
  onActiveChange: (rule: Rule, active: boolean) => void,
}

/**
 * Rule Item Header\
 * Shows the Rule name and active Switch
 * @hidden
 */
export function Header(props: HeaderProps) {
  const { rule, editing, inputRef, onNameChange, onActiveChange } = props
  const { name, repeat, active, days, next_dates: nextDates } = rule

  // If the rule is set active, but a non-repeat one,
  // Don't show it as active if all the dates it
  // was set for are past
  let actualActive = repeat
    ? active
    : active && !nextDates.every(d => {
      let date = dayjs(d)
      let today = dayjs()
      return date.isBefore(today, 'day')
    })

  // A string such as Mon, Tue, Fri... for repeat Rules
  // Like Today, Fri, Sun for non repeat
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

  // Autofocus the input when editing starts
  useEffect(() => {
    editing && inputRef.current && inputRef.current.focus()
  }, [editing, inputRef])

  return (
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

/**
 * Day Selector\
 * Selector for days when editing the Rule\
 * Allows the user to select on which day the rule should happen
 * @hidden
 */
export function DaySelector(props: DaySelectorProps) {
  const { rule, onDayChange } = props
  const { id: ruleId, days } = rule

  return (
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
  )
}


interface RepeatCheckBox {
  repeat: boolean
  onChange: (value: boolean) => void
}

/**
 * Repeat Check Box\
 * Allows the user to set the rule as a repeat or non-repeat one
 * @hidden
 */
export function RepeatCheckBox(props) {
  const { repeat, onChange } = props
  return (
    <View style={[h.justifyRight, h.alignMiddle, m.t8, dayStyles.repeatContainer]} collapsable={false}>
      <Text style={[text.default, text.small]}>Repeat</Text>
      <CheckBox value={repeat} onValueChange={onChange} />
    </View>
  )
}

/**
 * @hidden
 * Opens a Time picker for Schedules
 * @param {"from" | "to"} property Which property of the Schedule this Time Picker is for
 */
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

/**
 * Time Selector\
 * Allows the user to pick start and end times for [[Schedule]]s
 * @hidden
 */
// TODO: Input validation, a user should not be able to pick a end time that's sooner than the start time
export function TimeSelector(props: TimeSelectorProps) {
  const { schedule, prop, onChange } = props

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
  /** 
   * Default temperature setting used when creating new schedules.\
   * See [[Settings]]
   */
  defaultTemperature: number
  /**
   * Called when user starts editing a [[Rule]]\
   * The `inputRef` passed as parameter can be used
   * to scroll the containing `ScrollView` to it
   */
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

/**
 * Rule List Item\
 * Displays a single Rule in the Rule List 
 * @hidden
 */
export default function RuleListItem (props: RuleListItemProps) {
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


  // Due to drawing the TimeBar in SVG, width has to be know `onLayout`
  const [width, setWidth] = useState<number>(0)

  // TODO: This should be handled from this list instead
  const [editing, setEditing] = useState<boolean>(rule.name === null || rule.name === undefined)
  // Used for auto scrolling when focus is on the Rule name input
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

/**
 * @hidden
 */
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

/**
 * @hidden
 */
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
