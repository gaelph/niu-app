/**
 * @category Components
 * @module components/temperature-records
 * @packageDocumentation
 */
import React from 'react'
import { View } from 'react-native'

import { AreaChart, Grid, YAxis, XAxis } from 'react-native-svg-charts'
import { LinearGradient, Defs, Stop, Path } from 'react-native-svg'
import * as shape from 'd3-shape'

import { TemperatureRecord } from 'data/temperature-records/model'

import Colors from 'theme/colors'
import Dimensions from 'theme/dimensions'

/** @hidden */
const TemperatureGradient = ({ id, color }: { id: string, color: string }) => (
  <Defs>
      <LinearGradient id={id} x1="0%" y1="0%" x2="0%" y2="110">
        <Stop offset={'0%'} stopColor={color} stopOpacity={0.6}/>
        <Stop offset={'1%'} stopColor={color} stopOpacity={0.1}/>
      </LinearGradient>
    </Defs>
)

/** @hidden */
const BoilerGradient = ({ id, color }: { id: string, color: string }) => (
  <Defs>
      <LinearGradient id={id} x1="0%" y1="0%" x2="0%" y2="110">
        <Stop offset={'0%'} stopColor={color} stopOpacity={0}/>
        <Stop offset={'1%'} stopColor={color} stopOpacity={0.8}/>
      </LinearGradient>
    </Defs>
)

/** @hidden */
const TemperatureLine = ({ line, color }: { line?: any, color: string }) => {
  return <>
  {
    line !== null &&
    <Path
      key={'line'}
      d={line}
      stroke={color}
      strokeWidth={2}
      fill={'none'}
    />
  }
  </>
}

/** @hidden */
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    console.warn(error)
    console.warn(info)
  }

  render() {
    return <>
    {this.props.children}
    </>
  }
}

interface RecordsChartProps {
  /** Temperature records */
  records: TemperatureRecord[],
  /** Ranges of boiler statuses.\These ranges represent when the boiler was ON */
  boilerStatusRanges: { from: Date, to: Date }[],
  /** Time frame bounds */
  xBounds: { min: number, max: number },
  /** Temperature bounds */
  yBounds: { min: number, max: number },
  /** Graph width */
  width: number
}

/**
 * Chart displaying the history of temperature records and boiler statuses
 */
export default function RecordsChart(props: RecordsChartProps) {
  const { records, boilerStatusRanges, xBounds, yBounds, width } = props
  const chartWidth = width - 2 * Dimensions.padding

  return (
    <View style={{ paddingLeft: 30, marginTop: 20, width }}>
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <View style={{width: chartWidth, height: 110, position: 'relative'}}>
          <ErrorBoundary>
            <AreaChart
              style={{ height: 110, width: chartWidth, position: 'absolute' }}
              data={ records }
              yAccessor={({ item }) => item.value}
              xAccessor={({ item }) => +item.createdOn}
              curve={ shape.curveMonotoneX }
              svg={{ fill: 'url(#grad1)' }}
              yMin={yBounds.min}
              yMax={yBounds.max}
              xMin={xBounds.min}
              xMax={xBounds.max}
              gridMin={yBounds.min}
              gridMax={yBounds.max}
              start={yBounds.min}
              numberOfTicks={3}
              contentInset={{ top: 20, bottom: 0 }}
            >
              <Grid belowChart={false} svg={{ strokeOpacity: 0.15 }} />
              { records &&  <TemperatureLine color={Colors.text.primary } /> }
              { records && <TemperatureGradient id="grad1" color={Colors.text.primary }/> }
            </AreaChart> 
            { boilerStatusRanges
              .map(range => (
              <AreaChart
                key={`${range.from}-${range.to}`}
                style={{ height: 110, width: chartWidth, position: 'absolute' }}
                data={[
                  +range.from,
                  +range.to
                ]}
                yAccessor={_ => ((yBounds.max - yBounds.min) * 2 / 3) + yBounds.min}
                xAccessor={({ item }) => item}
                curve={ shape.curveLinear }
                svg={{ strokeWidth: 0, fill: 'url(#grad1)' }}
                yMin={yBounds.min}
                yMax={yBounds.max}
                xMin={xBounds.min}
                xMax={xBounds.max}>
                  <BoilerGradient id="grad1" color={Colors.accent }/>
                </AreaChart>
              ))
            }
          </ErrorBoundary>
        </View>
        <ErrorBoundary>
        <YAxis data={records} 
          numberOfTicks={3} 
          formatLabel={(v) => `${Math.round(v * 10) / 10}˚`} 
          style={{ marginLeft: 8 }}
          contentInset={{ top: 20, bottom: 4 }}
          min={yBounds.min}
          max={yBounds.max}
          svg={{ fontSize: 10, fill: Colors.foreground }} />
        </ErrorBoundary>
      </View>
      <ErrorBoundary>
        <XAxis data={records} numberOfTicks={3} formatLabel={(v) => {
          if (records[v]
            && records[v].createdOn) {
            let date = records[v].createdOn;

            if (date) {
              let h = date.getHours();
              let m = date.getMinutes();

              return `${h}h${m.toString().padStart(2, '0')}`
            }
          } else {
            return null
          }
        }}
          style={{ marginTop: 8}}
          contentInset={{ left: 12, right: 42}}
          svg={{ fontSize: 10, fill: Colors.foreground }}
        />
      </ErrorBoundary>
    </View>
  )
}