import React, { useMemo } from 'react';
import { View } from 'react-native'

import { AreaChart, LineChart, Grid, YAxis, XAxis } from 'react-native-svg-charts'
import { LinearGradient, Defs, Stop, Path } from 'react-native-svg'
import * as shape from 'd3-shape'

import { TemperatureRecord } from '../../data/temperature-records/model'
import { BoilerStatus } from '../../data/boiler-status/model'

import Colors from '../../theme/colors'
import Dimensions from '../../theme/dimensions'
import { useDimensions } from '../../support'



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
  boilerStatusHistory: BoilerStatus[]
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

interface StatusRange {
  records: TemperatureRecord[]
  value: boolean
  from: Date
  to: Date
}

function makeStatusRanges(statuses: BoilerStatus[]): StatusRange[] {
  let result = []
  const statusStack = [...statuses]

  let status = statusStack.pop()
  let nextStatus = statusStack.pop()

  if (status) {
    do {
      while (nextStatus && status.value === nextStatus.value) {
        nextStatus = statusStack.pop()
      }

      let range = {
        value: status.value,
        records: [],
        from: status.createdOn.toDate(),
        to: nextStatus
          ? nextStatus.createdOn.toDate()
          : new Date()
      }

      result.push(range)

      status = nextStatus
      nextStatus = statusStack.pop()
    }
    while (status && statusStack.length >= 0)
}

  return result
}

function putRecordsInRanges(records: TemperatureRecord[], ranges: StatusRange[]) : StatusRange[] {

  return ranges.map((range) => {
    const recordsInRange = records.filter((record) => {
      return record.createdOn >= range.from && record.createdOn <= range.to
    })

    return {
      ...range,
      records: recordsInRange
    }
  })
}

export default function RecordsChart({ records, boilerStatusHistory }: RecordsChartProps) {
  const { width } = useDimensions('window')
  const chartWidth = width - 2 * Dimensions.padding

  let ranges = makeStatusRanges(boilerStatusHistory)
  ranges = putRecordsInRanges(records, ranges)

  console.log('found', ranges.length, 'ranges')

  const [values, dates, Ybound, Xbound] = useMemo(() => {
    if (records.length === 0) return [[], [], { max: 25, min: 0 }, { max: 0, min: 0 }]
    records = [...records].sort((a: TemperatureRecord, b: TemperatureRecord) => +a.createdOn - +b.createdOn)
    let latest = records[records.length - 1].createdOn
    let recent = records
    .filter(((r: TemperatureRecord) => +latest - +r.createdOn < 8 * HOUR))

    recent = minMax(recent)

    let values = recent.map(r => r.value)
    let dates = recent.map(r => r.createdOn)
    
    let Ybound = {
      max: Math.max(...values) + 0.5,
      min: 5 // Math.min(...values) - 2
    }

    let Xbound = {
      min: +dates[0],
      max: +dates[dates.length - 1]
    }

    return [recent, dates, Ybound, Xbound]
  }, [records, width])

  return (
    <View style={{ paddingLeft: 30, marginTop: 20, width }}>
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <View style={{width: chartWidth, height: 110, position: 'relative'}}>
        <AreaChart
          style={{ height: 110, width: chartWidth, position: 'absolute' }}
          data={ values }
          yAccessor={({ item }) => item.value}
          xAccessor={({ item }) => +item.createdOn}
          curve={ shape.curveMonotoneX }
          svg={{ fill: 'url(#grad1)' }}
          yMin={Ybound.min}
          yMax={Ybound.max}
          xMin={Xbound.min}
          xMax={Xbound.max}
          gridMin={Ybound.min}
          gridMax={Ybound.max}
          start={Ybound.min}
          numberOfTicks={3}
          contentInset={{ top: 20, bottom: 0 }}
        >
          <Grid belowChart={false} svg={{ strokeOpacity: 0.15 }} />
          <Line />
          <Gradient />
        </AreaChart> 
        { ranges
          .filter(r => r.value && r.records.length > 0)
          .map(range => (
          <LineChart
            key={`${range.from}-${range.to}`}
            style={{ height: 110, width: chartWidth, position: 'absolute' }}
            data={[
              +range.from,
              +range.to
            ]}
            yAccessor={_ => Ybound.min}
            xAccessor={({ item }) => item}
            curve={ shape.curveLinear }
            svg={{ stroke: 'orange', strokeWidth: 4 }}
            yMin={Ybound.min}
            yMax={Ybound.max}
            xMin={Xbound.min}
            xMax={Xbound.max}>
            </LineChart>
          ))
        }
        </View>
        <YAxis data={values} 
        numberOfTicks={3} 
        formatLabel={(v) => `${Math.round(v * 10) / 10}˚`} 
        style={{ marginLeft: 8 }}
        contentInset={{ top: 20, bottom: 4 }}
        // min={0}
        // max={20}
        min={Ybound.min}
        max={Ybound.max}
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