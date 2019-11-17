import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native'
import { Dimensions as Dim } from 'react-native'

import { LineChart } from 'react-native-chart-kit'
import { AreaChart, Grid, YAxis, XAxis } from 'react-native-svg-charts'
import { LinearGradient, Defs, Stop, Path } from 'react-native-svg'
import * as shape from 'd3-shape'

import { TemperatureRecord } from '../api/models/temperature-record'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'


const SCREEN = Dim.get('window')

function buildLabels(records: TemperatureRecord[]): string[] {
  return records.map(r => {
    let hours = r.createdOn.getHours();
    let minutes = r.createdOn.getMinutes();
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  })
}

function values(records: TemperatureRecord[]): number[] {
  return records.map(r => r.value)
}

function buildDataset(records: TemperatureRecord[]): any {
  return {
    data: values(records),
    color: () => Colors.foreground,
    strokeWidth: 2
  }
}

function buildData(records: TemperatureRecord[]): any {
  let latest = records[records.length - 1].createdOn
  let recent = records.filter((r => +latest - +r.createdOn < 60 * 60 * 1000))

  let labels = buildLabels(recent)
  let dataset = buildDataset(recent)
  return {
    labels,
    datasets: [
      dataset,
      { 
        data: dataset.data.map((r, i) => Math.floor(Math.min(...dataset.data) - 3)),
        color: () => 'transparent'
      }
    ]
  }
}

const chartConfig = {
  backgroundGradientFrom: "transparent",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "transparent",
  backgroundGradientToOpacity: 0,
  fillShadowGradient: Colors.foreground,
  fillShadowGradientOpacity: 0.6,
  decimalPlaces: 1,
  color: (opacity = 1) => Colors.foreground,
  strokeWidth: 2, // optional, default 3
  propsForBackgroundLines: {
    strokeDasharray: null
  },
  propsForDots: {
    fill: 'transparent'
  }
  // barPercentage: 0.5,
}


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
      stroke={Colors.foreground}
      strokeWidth={2}
      fill={'none'}
  />
)

export default function RecordsChart({ records }) {
  const [values, dates, bound] = useMemo(() => {
    records = records.reverse()
    let latest = records[records.length - 1].createdOn
    let recent = records
    .filter((r => +latest - +r.createdOn < 8 * 60 * 60 * 1000))

    let values = recent.map(r => r.value)
    let dates = recent.map(r => r.createdOn)
    
    let bound = {
      max: Math.max(...values) + 0.5,
      min: Math.min(...values) - 2
    }

    return [values, dates, bound]
  }, [records])


  return (
    <View style={{ paddingLeft: 30, marginTop: 40,/* height: 200, */ width: '100%' }}>
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <AreaChart
        style={{ height: 110, width: SCREEN.width - 2 * Dimensions.padding }}
          data={ values }
          curve={ shape.curveNatural }
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
        let h = date.getHours();
        let m = date.getMinutes();

        return `${h}h${m.toString().padStart(2, '0')}`
      }}
        style={{ marginTop: 8}}
        contentInset={{ left: 12, right: 42}}
        svg={{ fontSize: 10, fill: Colors.foreground }}
      />
    </View>
  )
}