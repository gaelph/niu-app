import React from 'react';
import { View, Text, StyleSheet } from'react-native';

import dayjs from 'dayjs'
import weekdays from 'dayjs/plugin/weekday'

import { TemperatureRecord } from '../../data/temperature-records/model'

import Colors from '../../theme/colors'

dayjs.extend(weekdays)

const temp = {
  integer(t: number): string {
    return t !== null
      ? Math.floor(t).toString()
      : "--"
  },
  decimals(t: number): string {
    return t !== null
      ? Math.floor((t - this.integer(t)) * 10).toString()
      : "-"
  }
}

type TemperatureViewProps = {
  record: TemperatureRecord
  boilerStatus: boolean
}

export default function TemperatureView({ record, boilerStatus }: TemperatureViewProps): React.ReactElement {
  const value = record ? record.value : null

  const indicatorStyle = boilerStatus
      ? styles.statusIndicatorOn
      : styles.statusIndicatorOff

  return (
    <View style={styles.content}>
      <View style={styles.tempView}>
        <View style={styles.indicatorContainer} >
          <View style={[styles.statusIndicator, indicatorStyle]} collapsable={false}></View>
        </View>
        <Text style={[styles.text, styles.temp]}>{temp.integer(value)}</Text>
        <Text style={[styles.text, styles.tempUnit]}>˚</Text>
        <Text style={[styles.text, styles.tempDecimals]}>.{temp.decimals(value)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
  },
  text: {
    color: Colors.text.primary,
    fontFamily: 'Raleway-SemiBold'
  },
  tempView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: -4
  },
  indicatorContainer: {
    paddingBottom: 12,
    paddingRight: 4
  },
  statusIndicator: {
    width: 12,
    height: 12,
    marginBottom: 8, 
    overflow: 'hidden',
    borderRadius: 6
  },
  statusIndicatorOn: {
    backgroundColor: Colors.accent,
    opacity: 1
  },
  statusIndicatorOff: {
    backgroundColor: Colors.foreground,
    opacity: 0.3
  },
  temp: {
    fontSize: 96,
    fontFamily: 'Raleway-SemiBold'
  },
  tempUnit: {
    fontSize: 60,
    marginBottom: 20,
  },
  tempDecimals: {
    fontSize: 40,
    marginLeft: -16,
    paddingBottom: 13
  },
  timeText: {
    fontSize: 16,
    lineHeight: 16,
  },
  schedule: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 2,
  }
});
