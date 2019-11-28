import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TextInput, Switch, CheckBox, StyleSheet, TouchableNativeFeedback as Touchable, TimePickerAndroid, TimePickerAndroidTimeSetAction } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useApi, getRules } from '../api'
import * as Svg from 'react-native-svg'

import { Day, DayShortNames } from '../api/types'
import { Rule, Schedule } from '../api/models/rule'

import Colors from '../theme/colors'
import Time from '../support/time'

import IconButton from '../components/icon-button'
import TemperatureSetter from '../components/temperature-set-modal'
import TimeBar from '../components/time-bar'
import ActionButton from '../components/action-button'

import {ToastAndroid} from 'react-native'
import { AsyncStorage } from 'react-native'
import uuid from 'uuid/v4'

import { Header, DaySelector, RepeatCheckBox, TimeSelector } from './rule/item'


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

function RuleElement({ rule, onRemove, onEdit }) {
  let [localRule, setLocalRule] = useState<Rule>(rule);
  let [width, setWidth] = useState<number>(0)
  let [editing, setEditing] = useState<boolean>(rule.name === undefined)
  let [modalVisible, setModalVisible] = useState<boolean>(false)
  
  const { schedules } = localRule
  
  let inputRef = useRef<TextInput>()
  useEffect(() => {
    if (editing) {
      inputRef.current && inputRef.current.focus()
      onEdit && onEdit(inputRef)
    }
  }, [editing])
  
  
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      let handler = setTimeout(() => {
        AsyncStorage.setItem(`Rule_${localRule.id}`, JSON.stringify(localRule), error => {
          if (error) { console.error(error) }

          ToastAndroid.show("Modifications saved", ToastAndroid.SHORT)
        })
      }, 1000)

      return () => clearTimeout(handler)
    }
  }, [localRule])

  const updateSchedule = useCallback((idx, schedule) => {
    let update = {
      ...localRule,
      schedules: schedules.map((s, i) => {
        if (i === idx) {
          return schedule
        }

        return s
      })
    }

    setLocalRule(update)
  }, [localRule])

  const removeSchedule = useCallback((idx) => {
    let update = {
      ...localRule,
      schedules: schedules.filter((_, i) => i !== idx)
    }

    setLocalRule(update)
  }, [localRule])

  const setActive = useCallback((active) => {
    let update = {
      ...localRule,
      active
    }

    setLocalRule(update)
  }, [localRule])

  const addHours = useCallback(async () => {
    let schedule: Schedule = {
      from: Time.fromDate(new Date()),
      to: Time.fromDate(new Date()),
      high: 20
    }

    schedule = await openTimePicker(schedule, 'from')

    if (schedule) {
      schedule = await openTimePicker(schedule, 'to')

      if (schedule) {
        setLocalRule({
          ...localRule,
          schedules: [
            ...localRule.schedules,
            schedule
          ].sort((a, b) => {
            return +a.from - +b.from
          })
        })
      }
    }

  }, [localRule])

  const setDay = useCallback((day: Day, active: boolean) => {
    setLocalRule({
      ...localRule,
      days: {
        ...localRule.days,
        [day]: active
      }
    })
  }, [localRule])

  const setName = useCallback((name: string) => {
    setLocalRule({
      ...localRule,
      name
    })
  }, [localRule])

  const setRepeat = useCallback((repeat) => {
    setLocalRule({
      ...localRule,
      repeat
    })
  }, [localRule])

  return (
    <View style={styles.item} onLayout={({ nativeEvent: { layout: { width } } }) => setWidth(width - 2)}>
      <Touchable onPress={() => setEditing(!editing)}>
        <View collapsable={false}>
          {/* Header of the rule view */}
          <Header name={localRule.name} active={localRule.active} days={localRule.days} editing={editing} onNameChange={setName} onActiveChange={setActive} onEditingChange={setEditing }/>
          
          {/* Row with day selection and repeatable */}
          {editing &&
            <View style={styles.subHeader}>
              <DaySelector ruleId={localRule.id} days={localRule.days} onDayChange={setDay} />
              <RepeatCheckBox repeat={localRule.repeat} onChange={setRepeat} />
            </View>
          }

          {/* Time bar */}
          <TimeBar schedules={schedules} width={width} height={18+4} padding={8} />

          {/* Rule Editor */}
          { editing && (<>
            {/* Schedule editor */}
            <View style={styles.ruleEditor}>
              {
                schedules.map((schedule, idx) => (
                  <View key={`${rule.id}_${schedule.from}_${schedule.to}`} style={{ flexDirection: 'row', alignItems:'center', paddingVertical: 8 }}>
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

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: Colors.fineBorder, borderStyle: 'solid'}}>
              {/* Add a schedule to the rule */}
              <ActionButton onPress={addHours} icon="plus" Provider={Feather} iconPosition="start" title="Add hours" align="start" />
              {/* Delete the rule */}
              <ActionButton onPress={onRemove} icon="trash-2" Provider={Feather} iconPosition="start" title="Remove hours" align="end" />
            </View>
          </>)}
      </View>
      
      </Touchable>
    </View>
  )
}

export default function RuleList({ rules, onReady, onEdit }) {
  let [localRules, setLocalRules] = useState([])

  useEffect(() => {
    setLocalRules(rules ? rules.items as Rule[] : [])
  }, [rules])

  let add = useCallback(() => {
    setLocalRules([
      ...localRules,
      {
        id: uuid(),
        active: true,
        name: undefined,
        days: { 
          [Day.Mon]: false,
          [Day.Tue]: false,
          [Day.Wed]: false,
          [Day.Thu]: false,
          [Day.Fri]: false,
          [Day.Sat]: false,
          [Day.Sun]: false,
        },
        schedules: []
      }
    ])
  }, [localRules])

  useEffect(() => {
    onReady(add)
  }, [localRules])


  let removeRule = useCallback((rid) => {
    setLocalRules(localRules.filter(r => r.id !== rid))
    AsyncStorage.removeItem(`Rule_${rid}`, () => {
      ToastAndroid.show(
        "Rule removed",
        ToastAndroid.SHORT,
        // ToastAndroid.BOTTOM
      )
    })
  }, [localRules])

  return (
    <View style={styles.container}>
      {
        localRules.map(rule => <RuleElement key={rule.id} rule={rule} onRemove={() => removeRule(rule.id)} onEdit={onEdit} />)
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // position: 'relative',
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 30, 
    // paddingBottom: 54 + 24,
    marginTop: 40,
  },
  item: {
    borderBottomWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'solid',
    borderRadius: 0,
    // padding: 8,
    paddingBottom: 0, 
    overflow: 'visible',
    marginBottom: 16,
    position: 'relative',
  },
  subHeader: {
    paddingHorizontal: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
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