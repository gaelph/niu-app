import React, { useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl
} from 'react-native';
import { getLatest, getList, useApiPolling, useApi } from '../api'
import { Dimensions as Dim } from 'react-native'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import * as Support from '../support/dimensions'

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

export function Home() {
  const { data: records, loading, error, refresh } = useApiPolling(getList, 60 * 1000)

  const latestRecord = (records ? records.items[0]: null) as TemperatureRecord

  return (<View style={{ flex: 1}}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl colors={[Colors.text.primary]} refreshing={loading} onRefresh={refresh} progressViewOffset={Dimensions.appBar.height + Support.statusBarHeight()} />}>
      { error &&
        <Text style={styles.text}>An error occurred</Text>
      }
      { latestRecord &&
        <TemperatureView record={latestRecord} />
      }
      { records &&
        <RecordsChart records={records.items} />
      }
      <RuleList/>
    </ScrollView>
    <PlusButton onPress={() => {}}/>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Screen.height,
    // width: Screen.width,
    padding: Dimensions.padding,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    width: Screen.width,
    // padding: Dimensions.padding,
    alignItems: 'center',
    paddingVertical: Dimensions.appBar.height + Support.statusBarHeight(),
    justifyContent: 'flex-start',
  },
  text: {
    color: Colors.foreground,
    fontSize: 16,
    fontFamily: 'Raleway-SemiBold'
  },
});
