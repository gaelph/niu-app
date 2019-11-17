import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native'
import { useApi, getRules } from '../api'
import * as Svg from 'react-native-svg'

import { Rule, Day, DayShortNames } from '../api/types'

import Colors from '../theme/colors'


interface TimeBarProps {
  schedules: { from: string, to: string }[]
  width: number,
  height: number
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

  if (minutes > timeAsMinutes("22:30") || minutes < timeAsMinutes("1:30")) {
    return Math.round(ratio * (width - (2 * margin))) + margin
  }

  return Math.round(ratio * width)
}

function TimeIndicator({ from, to, width, margin }) {
  let fromMinutes = timeAsMinutes(from)
  let toMinutes = timeAsMinutes(to)

  if (toMinutes - fromMinutes <= 3 * 60) {
    const center = fromMinutes + ((toMinutes - fromMinutes) / 2)
    let ratio = center / MINUTES_IN_DAY

    let x
    if (center > timeAsMinutes("21:00") || center < timeAsMinutes("3:00")) {
      x = (1.25 * margin) + Math.round(ratio * (width - 3 * margin))
    } else {
      x = Math.round(ratio * width)
    }

    return <Svg.Text x={x} y={14} {...timeIndicatorStyle}>{`${from} - ${to}`}</Svg.Text>
  } else {
    return (<>
      <Svg.Text x={xForTime(from, width, margin)} y={14}  {...timeIndicatorStyle}>{from}</Svg.Text>
      <Svg.Text x={xForTime(to, width, margin)} y={14}  {...timeIndicatorStyle}>{to}</Svg.Text>
    </>)
  }
}

const timeIndicatorStyle = {
  opacity: 0.4,
  textAnchor: 'middle' as Svg.TextAnchor,
  fontSize: 10,
}

function TimeBar({ schedules, width, height }: TimeBarProps) {
  return <Svg.Svg width={width} height={height}>
    <Svg.G>
      {schedules.map((s, i) => {
        return (<TimeIndicator key={`${i}_time`} from={s.from} to={s.to} width={width} margin={15} />
        )
      })}
    </Svg.G>
    <Svg.G>
      {schedules.map((s, i) => {
        const x = xForTime(s.from, width)
        const w = xForTime(s.to, width) - x
        return (<>
          <Svg.Rect key={`${i}_rect`} x={xForTime(s.from, width)} y={16} width={w} height={4} fill={Colors.accent}>{s.from}</Svg.Rect>
          </>
        )
      })}
    </Svg.G>
  </Svg.Svg>
}

function RuleElement({ rule }: { rule: Rule }) {
  const daysString = Object.keys(rule.days)
  .filter(day => rule.days[day])
  .map(day => DayShortNames[day])
  .join(', ')

  let [width, setWidth] = useState<number>(0)

  return (
    <View style={styles.item} onLayout={({ nativeEvent: { layout: { width } } }) => setWidth(width - 2)}>
      {/* Header of the rule view */}
      <View style={{ flexDirection: 'row', padding: 8, paddingBottom: 0 }}>
        <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center'}}>
          <Text style={[styles.text]}>{daysString}</Text>
        </View>
        <Switch value={rule.active} />
      </View>
      {/* Time bar */}
      <TimeBar schedules={rule.schedules} width={width} height={16+4} />
    </View>
  )
}

export default function RuleList() {
  let { data } = useApi(getRules)
  let rules = (data ? data.items : []) as Rule[]

  console.log(rules)

  return (
    <View style={styles.container}>
      {
        rules.map(rule => <RuleElement key={rule.id} rule={rule} />)
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 30, 
    marginTop: 60,
  },
  item: {
    borderWidth: 1,
    borderColor: Colors.foreground,
    borderStyle: 'solid',
    borderRadius: 6,
    // padding: 8,
    paddingBottom: 0, 
    overflow: 'hidden',
    marginBottom: 8
  },
  text: {
    color: Colors.foreground,
    fontSize: 14,
    fontFamily: 'Raleway-Bold'
  },
})