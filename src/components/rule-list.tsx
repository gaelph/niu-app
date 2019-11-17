import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native'
import { useApi, getRules } from '../api'
import * as Svg from 'react-native-svg'

import { Rule, Day, DayShortNames } from '../api/types'

import Colors from '../theme/colors'

import PlusButton from '../components/plus-button'


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

function RuleElement({ rule }: { rule: Rule }) {
  const daysString = Object.keys(rule.days)
  .filter(day => rule.days[day])
  .map(day => DayShortNames[day])
  .join(', ')

  let [width, setWidth] = useState<number>(0)

  return (
    <View style={styles.item} onLayout={({ nativeEvent: { layout: { width } } }) => setWidth(width - 2)}>
      {/* Header of the rule view */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 8, paddingBottom: 4 }}>
        <View style={{flex: 1, justifyContent: 'flex-start'}}>
          <Text style={[styles.text, styles.name]}>{rule.name}</Text>
          <Text style={[styles.text, { fontSize: 12 }]}>{daysString}</Text>
        </View>
        <Switch value={rule.active} />
      </View>
        {/* <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', paddingHorizontal: 8 }}> */}
        {/* </View> */}
      {/* Time bar */}
      <TimeBar schedules={rule.schedules} width={width} height={18+4} padding={8} />
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
    overflow: 'hidden',
    marginBottom: 16
  },
  text: {
    color: Colors.text.primary,
    fontSize: 20,
    fontFamily: 'Raleway-Bold'
  },
  name: {
    fontFamily: 'Raleway-MediumItalic'
  }
})