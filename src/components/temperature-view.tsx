import React from 'react';
import { View, Text, StyleSheet } from'react-native';

import { TemperatureRecord } from '../api/models/temperature-record'

import ModeSelector from './mode-selector'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { Dimensions as Dim } from 'react-native'


const Screen = Dim.get('window')

const temp = {
  integer(t: number): number {
    return Math.floor(t)
  },
  decimals(t: number): number {
    return Math.round((t - this.integer(t)) * 10)
  }
}

function formatTime(datetime: Date): string {
  let hours = datetime.getHours();
  let minutes = datetime.getMinutes();

  return hours.toString() + 'h ' + minutes.toString().padStart(2, '0')
}

type TemperatureViewProps = {
  record: TemperatureRecord
}


export default function TemperatureView({ record }: TemperatureViewProps): React.ReactElement {
  return (
    <View style={styles.content}>
      <View style={styles.tempView}>
        <Text style={[styles.text, styles.temp]}>{temp.integer(record.value)}</Text>
        <Text style={[styles.text, styles.tempUnit]}>˚</Text>
        <Text style={[styles.text, styles.tempDecimals]}>.{temp.decimals(record.value)}</Text>
      </View>
      <Text style={[styles.text, styles.timeText]}>at {formatTime(record.createdOn)}</Text>
      <ModeSelector />
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
    lineHeight: 16
  }
});
