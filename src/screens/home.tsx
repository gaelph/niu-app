import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl
} from 'react-native';
import { getRules, getList, useApiPolling, useApi } from '../api'
import { Dimensions as Dim } from 'react-native'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { StatusBar, useDimensions } from '../support/dimensions'

import AppBar from '../components/app-bar'
import TemperatureView from '../components/temperature-view'
import RecordsChart from '../components/records-chart'
import RuleList from '../components/rule-list'
import PlusButton from '../components/plus-button'

import { TemperatureRecord } from '../api/models/temperature-record'

const Screen = Dim.get('window')

const temp = {
  integer(t: number): number {
    return Math.floor(t)
  },
  decimals(t: number): number {
    return Math.round((t - this.integer(t)) * 10)
  }
}

let addRule = () => {
}

export function Home() {
  let Screen = useDimensions('window')

  const { data: records, loading, error, refresh } = useApiPolling(getList, 60 * 1000)
  let { data: rules } = useApi(getRules)

  const latestRecord = (records ? records.items[0]: null) as TemperatureRecord

  return (
    <KeyboardAvoidingView behavior={'position'}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { width: Screen.width }]}
        refreshControl={<RefreshControl colors={[Colors.text.primary]} refreshing={loading} onRefresh={refresh} progressViewOffset={Dimensions.appBar.height + StatusBar.height} />}>
        <View style={{ flex: null, width: '100%', }}>
          <AppBar />
          { error &&
            <Text style={styles.text}>An error occurred</Text>
          }
          { latestRecord &&
            <TemperatureView record={latestRecord} />
          }
          { records &&
            <RecordsChart records={records.items} />
          }
          <RuleList rules={rules} onReady={add => addRule = add} />
        </View>
      </ScrollView>
      <PlusButton onPress={addRule}/>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // height: Screen.height,
    // width: Screen.width,
    padding: Dimensions.padding,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flex: null,
    // width: '100%',
    width: Screen.width,
    // padding: Dimensions.padding,
    alignItems: 'center',
    paddingTop: StatusBar.height,
    paddingBottom: Dimensions.appBar.height + StatusBar.height,
    justifyContent: 'flex-start',
  },
  text: {
    color: Colors.foreground,
    fontSize: 16,
    fontFamily: 'Raleway-SemiBold'
  },
});
