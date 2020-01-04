/**
 * @category Components
 * @module components/temperature-records
 * @packageDocumentation
 */
import React from 'react'
import { View, Text, StyleSheet } from'react-native'

import { TemperatureRecord } from 'data/temperature-records/model'

import Colors from 'theme/colors'

import BoilerStatus from 'containers/boiler-status/BoilerStatus'

/** 
 * @hidden 
 * Utility for displaying the temperature
 */
const temp = {
  // Gets the integer part of a float (or "--")
  integer(t: number): string {
    return t !== null
      ? Math.floor(t).toString()
      : "--"
  },
  // Gets the decimal part of a float, one digit (or "-")
  decimals(t: number): string {
    return t !== null
      ? Math.floor((t - this.integer(t)) * 10).toString()
      : "-"
  }
}

type TemperatureViewProps = {
  record: TemperatureRecord
}

/**
 * The main, big, temperature display on the Home screen
 */
export default function TemperatureView(props: TemperatureViewProps): React.ReactElement {
  const { record } = props
  const value = record ? record.value : null

  return (
    <View style={styles.content}>
      <View style={styles.tempView}>
        <View style={styles.indicatorContainer} >
          <BoilerStatus />
        </View>
        <Text style={[styles.text, styles.temp]}>{temp.integer(value)}</Text>
        <Text style={[styles.text, styles.tempUnit]}>˚</Text>
        <Text style={[styles.text, styles.tempDecimals]}>.{temp.decimals(value)}</Text>
      </View>
    </View>
  )
}

/** @hiddens */
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
