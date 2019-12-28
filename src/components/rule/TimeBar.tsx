import React from 'react'
import * as Svg from 'react-native-svg'
import Time from '../../support/time'
import { Schedule } from '../../data/rules/model'

import Colors from '../../theme/colors'

const MINUTES_IN_DAY = 24 * 60


function xForMinutes(minutes: number, width: number, margin: number = 0): number {
  let ratio = minutes / MINUTES_IN_DAY

  return margin + Math.round(ratio * (width - margin))
}

interface TimeIndicatorProps {
  from: Time,
  to: Time,
  width: number,
  margin?: number,
  padding: number
}

function TimeIndicator({ from, to, width, padding }: TimeIndicatorProps) {
  let fromMinutes = from.toMinutes()
  let toMinutes = to.toMinutes()

  let textAnchor = 'middle' as Svg.TextAnchor
  let x = padding
  if (toMinutes - fromMinutes <= 3 * 60) {
    const center = fromMinutes + ((toMinutes - fromMinutes) / 2)
    
    if (center > +Time.fromString("22:20")) {
      x = width
      textAnchor = 'end'
    } else if (center < +Time.fromString("3:00")) {
      textAnchor = 'start'
    } else {
      let ratio = center / MINUTES_IN_DAY
      x += Math.round(ratio * width)
    }

    return <Svg.Text x={x} y={14} {...timeIndicatorStyle} textAnchor={textAnchor}>{`${from.toString()} - ${to.toString()}`}</Svg.Text>
  } else {
    let [[xFrom, anchorFrom], [xTo, anchorTo]] = [from, to].map(time => {
      let x = padding
      let anchor = 'middle' as Svg.TextAnchor
      if (+time > +Time.fromString("22:30")) {
        x = width
        anchor = 'end'
      } else if (+time < +Time.fromString("3:00")) {
        anchor = 'start'
      } else {
        x = xForMinutes(+time, width, x)
      }    
      
      return [x, anchor as Svg.TextAnchor]
    })

    return (<>
      <Svg.Text x={xFrom} y={14} textAnchor={anchorFrom} {...timeIndicatorStyle}>{from.toString()}</Svg.Text>
      <Svg.Text x={xTo} y={14} textAnchor={anchorTo} {...timeIndicatorStyle}>{to.toString()}</Svg.Text>
    </>)
  }
}

const timeIndicatorStyle = {
  opacity: 0.4,
  fontSize: 10,
}

interface TimeBarProps {
  schedules: Schedule[]
  width: number,
  height: number
  padding: number
}

export default function TimeBar({ schedules, width, height, padding }: TimeBarProps) {
  width -= padding

  return <Svg.Svg width={width} height={height}>
    <Svg.G>
      {schedules.map((s, i) => {
        return (<TimeIndicator key={`${i}_time`} from={s.from} to={s.to} width={width} padding={padding} />
        )
      })}
    </Svg.G>
    <Svg.G>
      {schedules.map((s, i) => {
        const x = xForMinutes(+s.from, width) + padding
        const w = xForMinutes(+s.to, width) - x
        return (
          <Svg.Rect key={`${i}_rect`} x={x} y={18} width={w} height={4} fill={Colors.accent}></Svg.Rect>
        )
      })}
    </Svg.G>
  </Svg.Svg>
}