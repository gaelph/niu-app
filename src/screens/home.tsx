import React, { useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl
} from 'react-native';
import { Dimensions as Dim } from 'react-native'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { StatusBar, useDimensions } from '../support/dimensions'
import Toast from '../support/toast'

import AppBar from '../components/AppBar'
import TemperatureView from '../components/temperature-records/TempertureView'
import RecordsChart from '../components/temperature-records/RecordsChart'
import PlusButton from '../components/rule/PlusButton'
import RuleList from '../components/rule/List'

import { useTemperatureRecords } from '../data/temperature-records/hooks'
import { useBoilerStatus, useBoilerStatusHistory } from '../data/boiler-status/hooks'
import { useSettings, DEFAULT_TARGET } from '../data/settings/hooks'
import { useRules } from '../data/rules/hooks'

import { HoldButton } from '../components/hold/HoldButton'

const Screen = Dim.get('window')

export function Home() {
  let Screen = useDimensions('window')
  let scrollview = useRef<ScrollView>()

  const Records = useTemperatureRecords()
  const BoilerStatus = useBoilerStatus()
  const BoilerStatusHistory = useBoilerStatusHistory()
  const Settings = useSettings()

  const Rules = useRules({
    onMutationSuccess: Toast.showChangesOK,
    onMutationError: (error) => {
      console.error(error)
      console.log(error.graphQLErrors)

      Toast.showError()
    }
  })

  const refresh = useCallback(() => {
    Records.fetchMore()
    BoilerStatus.refresh()
    BoilerStatusHistory.refresh()
  }, [Records, BoilerStatus, BoilerStatusHistory])

  const appLoading = Records.loading 
    || Rules.loading
    || Settings.loading 
    || BoilerStatus.loading
    || BoilerStatusHistory.loading

  let defaultTarget = Settings.get(DEFAULT_TARGET)

  const scrollToRef = useCallback(inputRef => {
    inputRef.current.measure((x, y, _w, _h, _px, py) => {
      scrollview.current.scrollTo({ x, y: py - StatusBar.height, animated: true })
    })
  }, [scrollview])

  return (!Settings.loading && 
    <KeyboardAvoidingView behavior="height" style={{ width: Screen.width, height: Screen.height }}>
      <ScrollView
        ref={scrollview}
        style={[styles.container, { width: Screen.width, height: Screen.height }]}
        contentContainerStyle={[styles.contentContainer, { width: Screen.width }]}
        refreshControl={<RefreshControl colors={[Colors.text.primary]} refreshing={appLoading} onRefresh={refresh} progressViewOffset={Dimensions.appBar.height + StatusBar.height} />}>
        <View style={styles.view}>
          <AppBar />
          <TemperatureView record={Records.latest()} boilerStatus={BoilerStatus.status} />
          <HoldButton />
          <RecordsChart records={Records.records} boilerStatusHistory={BoilerStatusHistory.statuses} />
          <RuleList rules={Rules.rules} onStartEditing={scrollToRef} onChange={Rules.update} onRemove={Rules.remove} defaultTemperature={defaultTarget} />
        </View>
      </ScrollView>
      <PlusButton onPress={Rules.create}/>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flex: null,
    width: Screen.width,
    alignItems: 'center',
    paddingTop: StatusBar.height,
    paddingBottom: Dimensions.appBar.height + StatusBar.height,
    justifyContent: 'flex-start',
  },
  view: {
    flex: null, width: '100%'
  },
  text: {
    color: Colors.foreground,
    fontSize: 16,
    fontFamily: 'Raleway-SemiBold'
  },
});
