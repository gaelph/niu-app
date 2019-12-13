import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native'
import { Dimensions as Dim } from 'react-native'

import { AreaChart, Grid, YAxis, XAxis } from 'react-native-svg-charts'
import { LinearGradient, Defs, Stop, Path } from 'react-native-svg'
import * as shape from 'd3-shape'

import { TemperatureRecord } from '../api/models/temperature-record'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { useDimensions } from '../support'



const Gradient = () => (
  <Defs>
      <LinearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="110">
        <Stop offset={'0%'} stopColor={Colors.foreground} stopOpacity={0.6}/>
        <Stop offset={'100%'} stopColor={Colors.foreground} stopOpacity={0.1}/>
      </LinearGradient>
    </Defs>
)

const Line = ({ line }: { line?: any}) => (
  <Path
      key={'line'}
      d={line}
      stroke={Colors.text.primary}
      strokeWidth={2}
      fill={'none'}
  />
)

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR   = 60 * MINUTE

interface RecordsChartProps {
  records: TemperatureRecord[]
}

function minMax(records: TemperatureRecord[]): TemperatureRecord[] {
  let minAndMax: TemperatureRecord[] = []
  let previousAscent = 0;

  for (let i in records) {
    let index: number = parseInt(i, 10)
    let record = records[index]

    if (index === 0 || index === records.length - 1) {
      minAndMax.push(record)
      continue
    }

    let previousRecord = records[index - 1]
    let diff = record.value - previousRecord.value
    let ascent = diff > 0
      ? 1
      : diff < 0
        ? -1
        : 0

    if (ascent != previousAscent ) {
      previousAscent = ascent

      minAndMax.push(previousRecord)
    }
  }



  return minAndMax
}

export default function RecordsChart({ records }: RecordsChartProps) {
  const { width } = useDimensions('window')
  const chartWidth = width - 2 * Dimensions.padding

  const [values, dates, bound] = useMemo(() => {
    records = [...records].sort((a: TemperatureRecord, b: TemperatureRecord) => +a.createdOn - +b.createdOn)
    let latest = records[records.length - 1].createdOn
    let recent = records
    .filter(((r: TemperatureRecord) => +latest - +r.createdOn < 8 * HOUR))

    recent = minMax(recent)

    let values = recent.map(r => r.value)
    let dates = recent.map(r => r.createdOn)
    
    let bound = {
      max: Math.max(...values) + 0.5,
      min: 5 // Math.min(...values) - 2
    }

    return [recent, dates, bound]
  }, [records, width])

  return (
    <View style={{ paddingLeft: 30, marginTop: 20, width }}>
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <AreaChart
          style={{ height: 110, width: chartWidth }}
          data={ values }
          yAccessor={({ item }) => item.value}
          xAccessor={({ item }) => +item.createdOn}
          curve={ shape.curveMonotoneX }
          svg={{ fill: 'url(#grad1)' }}
          yMin={bound.min}
          yMax={bound.max}
          gridMin={bound.min}
          gridMax={bound.max}
          start={bound.min}
          numberOfTicks={3}
          contentInset={{ top: 20 }}
        >
          <Grid belowChart={false} svg={{ strokeOpacity: 0.15 }} />
          <Line />
          <Gradient />
        </AreaChart>
        <YAxis data={values} 
        numberOfTicks={3} 
        formatLabel={(v) => `${Math.round(v * 10) / 10}˚`} 
        style={{ marginLeft: 8 }}
        contentInset={{ top: 20, bottom: 0 }}
        min={bound.min}
        max={bound.max}
        svg={{ fontSize: 10, fill: Colors.foreground }} />
      </View>
      <XAxis data={values} numberOfTicks={3} formatLabel={(v) => {
        let date = dates[v];

        if (date) {
          let h = date.getHours();
          let m = date.getMinutes();

          return `${h}h${m.toString().padStart(2, '0')}`
        }
      }}
        style={{ marginTop: 8}}
        contentInset={{ left: 12, right: 42}}
        svg={{ fontSize: 10, fill: Colors.foreground }}
      />
    </View>
  )
}