import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, TouchableNativeFeedback as Touchable, TimePickerAndroid, TimePickerAndroidTimeSetAction } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useApi, getRules } from '../api'
import * as Svg from 'react-native-svg'

import { Rule, Day, DayShortNames } from '../api/types'

import Colors from '../theme/colors'

import IconButton from '../components/icon-button'


interface TimeBarProps {
  schedules: { from: string, to: string }[]
  width: number,
  height: number
  padding: number
}

function timeAsMinutes(time: string): number {
  const [hoursString, minutesString] = time.split(':')
  const hours = parseInt(hoursString, 10)
  const minutes = parseInt(minutesString, 10)

  return hours * 60 + minutes
}

const MINUTES_IN_DAY = 24 * 60

function xForTime(time: string, width: number, margin: number = 0): number {
  let minutes = timeAsMinutes(time)
  let ratio = minutes / MINUTES_IN_DAY

  return Math.round(ratio * width)
}

function TimeIndicator({ from, to, width, margin, padding }) {
  let fromMinutes = timeAsMinutes(from)
  let toMinutes = timeAsMinutes(to)

  let textAnchor = 'middle' as Svg.TextAnchor
  let x = padding
  if (toMinutes - fromMinutes <= 3 * 60) {
    const center = fromMinutes + ((toMinutes - fromMinutes) / 2)
    
    if (center > timeAsMinutes("22:20")) {
      x = width
      textAnchor = 'end'
    } else if (center < timeAsMinutes("3:00")) {
      textAnchor = 'start'
    } else {
      let ratio = center / MINUTES_IN_DAY
      x += Math.round(ratio * width)
    }

    return <Svg.Text x={x} y={14} {...timeIndicatorStyle} textAnchor={textAnchor}>{`${from} - ${to}`}</Svg.Text>
  } else {
    let [[xFrom, anchorFrom], [xTo, anchorTo]] = [from, to].map(v => {
      let minutes = timeAsMinutes(v)
      let x = padding
      let anchor = 'middle' as Svg.TextAnchor
      if (minutes > timeAsMinutes("22:20")) {
        x = width
        anchor = 'end'
      } else if (minutes < timeAsMinutes("3:00")) {
        anchor = 'start'
      } else {
        let ratio = minutes / MINUTES_IN_DAY
        x += Math.round(ratio * (width - x))
      }    
      
      return [x, anchor as Svg.TextAnchor]
    })

    return (<>
      <Svg.Text x={xFrom} y={14} textAnchor={anchorFrom} {...timeIndicatorStyle}>{from}</Svg.Text>
      <Svg.Text x={xTo} y={14} textAnchor={anchorTo} {...timeIndicatorStyle}>{to}</Svg.Text>
    </>)
  }
}

const timeIndicatorStyle = {
  opacity: 0.4,
  fontSize: 10,
}

function TimeBar({ schedules, width, height, padding }: TimeBarProps) {
  width -= padding

  return <Svg.Svg width={width} height={height}>
    <Svg.G>
      {schedules.map((s, i) => {
        return (<TimeIndicator key={`${i}_time`} from={s.from} to={s.to} width={width} margin={15} padding={padding} />
        )
      })}
    </Svg.G>
    <Svg.G>
      {schedules.map((s, i) => {
        const x = xForTime(s.from, width) + padding
        const w = xForTime(s.to, width) - x
        return (<>
          <Svg.Rect key={`${i}_rect`} x={x} y={18} width={w} height={4} fill={Colors.accent}>{s.from}</Svg.Rect>
          </>
        )
      })}
    </Svg.G>
  </Svg.Svg>
}

async function openTimePicker(schedule, property) {
  let [hours, minutes] = schedule[property].split(':')
  let {action, hour, minute} = await TimePickerAndroid.open({
    hour: parseInt(hours, 10),
    minute: parseInt(minutes, 10),
    is24Hour: true
  }) as TimePickerAndroidTimeSetAction

  if (action == TimePickerAndroid.timeSetAction) {
    return {
      ...schedule,
      [property]: `${hour}:${minute.toString().padStart(2, '0')}`
    }
  }
}

function RuleElement({ rule, onRemove }) {
  let [localRule, setLocalRule] = useState<Rule>(rule);
  let [width, setWidth] = useState<number>(0)
  let [editing, setEditing] = useState<boolean>(rule.id === undefined)
  
  const { name, days, schedules } = localRule

  let inputRef = useRef<TextInput>()
  useEffect(() => {
    if (editing) {
      inputRef.current && inputRef.current.focus()
    }
  }, [editing])

  const daysString = Object.keys(days)
  .filter(day => days[day])
  .map(day => DayShortNames[day])
  .join(', ')

  const updateSchedule = useCallback((idx, schedule) => {
    setLocalRule({
      ...localRule,
      schedules: schedules.map((s, i) => {
        if (i === idx) {
          return schedule
        }

        return s
      })
    })
  }, [localRule])

  const removeSchedule = useCallback((idx) => {
    setLocalRule({
      ...localRule,
      schedules: schedules.filter((_, i) => i !== idx)
    })
  }, [localRule])

  const setActive = useCallback((active) => {
    setLocalRule({
      ...localRule,
      active
    })
  }, [localRule])

  const addHours = useCallback(async () => {
    let now = new Date();
    let h = now.getHours();
    let mm = now.getMinutes();

    let schedule = {
      from: `${h}:${mm.toString().padStart(2, '0')}`,
      to: `${h}:${mm.toString().padStart(2, '0')}`
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
            let afrom = timeAsMinutes(a.from)
            let bfrom = timeAsMinutes(b.from)
            return afrom - bfrom
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

  console.log(localRule)

  return (
    <View style={styles.item} onLayout={({ nativeEvent: { layout: { width } } }) => setWidth(width - 2)}>
      <Touchable onPress={() => setEditing(!editing)}>
        <View collapsable={false}>
          {/* Header of the rule view */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 8, paddingBottom: 0, position: 'relative', overflow: 'visible'}}>
            <View style={{flex: 1, justifyContent: 'flex-start'}}>
              <View style={{ flexDirection: 'row'}}>
                <TextInput ref={inputRef} editable={editing} placeholder={"Preset"} onChangeText={(text) => setName(text)} style={[styles.text, styles.name]} value={name}/>
                <IconButton name={editing ? "chevron-up": "chevron-down"} size={24} color={Colors.border} provider={Feather} onPress={() => setEditing(!editing)} />
              </View>
            </View>
            <Switch value={localRule.active} onValueChange={(value) => setActive(value)} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 8, paddingBottom: 4, position: 'relative', overflow: 'visible'}}>
            {!editing &&
              <Text style={[styles.text, { fontSize: 12 }]}>{daysString}</Text>
            }
            {editing &&
              <View style={{ flexDirection: 'row'}}>
                {
                  Object.keys(DayShortNames)
                  .map((day, i) => (
                    <Touchable onPress={() => setDay(day as unknown as Day, !days[day])}>
                      <View style={{ width: 24, height: 24, marginRight: 8, marginTop: 8, alignItems: 'center', justifyContent: 'center', borderColor: Colors.text.primary, borderWidth: 1, borderRadius: 12, opacity: localRule.days[day] ? 1 : 0.4 }}>
                        <Text style={[styles.text, { fontSize: 12}]}>{DayShortNames[day].charAt(0)}</Text>
                      </View>
                    </Touchable>
                  ))
                }
              </View>
            }
          </View>
          {/* Time bar */}
          <TimeBar schedules={schedules} width={width} height={18+4} padding={8} />
      { editing && (<>
        <View style={{ paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: Colors.fineBorder, borderStyle: 'solid' }}>
          { schedules.map((schedule, idx) => {
            
            return <View style={{ flexDirection: 'row', alignItems:'center', paddingVertical: 8 }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Touchable onPress={async () => {
                  let newSchedule = await openTimePicker(schedule, 'from')
                  newSchedule && updateSchedule(idx, newSchedule)
                }}>
                  <View>
                    <Text style={styles.timeSelector}>{schedule.from}</Text>
                  </View>
                </Touchable>
                <Text style={styles.timeSelector}>-</Text>
                <Touchable onPress={async () => {
                  let newSchedule = await openTimePicker(schedule, 'to')
                  newSchedule && updateSchedule(idx, newSchedule)
                }}>
                  <View>
                    <Text style={styles.timeSelector}>{schedule.to}</Text>
                  </View>
                </Touchable>
              </View>
              <IconButton name="x" size={16} color="gray" provider={Feather} onPress={() => removeSchedule(idx)} />
            </View>
          })}
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: Colors.fineBorder, borderStyle: 'solid'}}>
          <Touchable onPress={() => addHours()}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
              <IconButton name="plus" size={16} color="gray" provider={Feather} />
              <Text style={{ color: 'gray', marginLeft: 8 }}>Add hours</Text>
            </View>
          </Touchable>
          <Touchable onPress={() => onRemove()}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingVertical: 8 }}>
              <IconButton name="trash-2" size={16} color="gray" provider={Feather} />
              <Text style={{ color: 'gray', marginLeft: 8 }}>Delete</Text>
            </View>
          </Touchable>
        </View>
      </>)}
      </View>
      
      </Touchable>
    </View>
  )
}

export default function RuleList({ rules, onReady }) {
  let [localRules, setLocalRules] = useState([])

  useEffect(() => {
    setLocalRules(rules ? rules.items as Rule[] : [])
  }, [rules])

  let add = useCallback(() => {
    console.log('new rules')
    setLocalRules([
      ...localRules,
      {
        active: true,
        name: "",
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
    console.log('rule ready')
    onReady(add)
  }, [localRules])


  let removeRule = useCallback((rid) => {
    console.log('removeRule', rid)
    setLocalRules(localRules.filter(r => r.id !== rid))
  }, [localRules])

  return (
    <View style={styles.container}>
      {
        localRules.map(rule => <RuleElement key={rule.id} rule={rule} onRemove={() => removeRule(rule.id)} />)
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
    marginTop: 60,
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
  text: {
    color: Colors.text.primary,
    fontSize: 20,
    fontFamily: 'Raleway-Bold'
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