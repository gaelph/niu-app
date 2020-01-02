// External imports
import React, { useCallback, useRef } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl
} from 'react-native'

// Styles and dimensions
import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { StatusBar, useDimensions } from '../support/dimensions'

// Data layer
import { useTemperatureRecords } from '../data/temperature-records/hooks'
import { useBoilerStatus, useBoilerStatusHistory } from '../data/boiler-status/hooks'
import { useSettings } from '../data/settings/hooks'
import { useRules } from '../data/rules/hooks'

// Container views
import AppBar from '../containers/AppBar'
import HoldButton from '../containers/hold/HoldButton'
import RuleList from '../containers/rules/RulesList'
import AddRuleButton from '../containers/rules/AddRuleButton'
import Temperature from '../containers/temperature-records/Temperature'
import TemperatureChart from '../containers/temperature-records/TemperatureChart'


export function Home() {
  let Screen = useDimensions('window')
  let scrollview = useRef<ScrollView>()

  const Records = useTemperatureRecords()
  const BoilerStatus = useBoilerStatus()
  const BoilerStatusHistory = useBoilerStatusHistory()
  const Settings = useSettings()

  const Rules = useRules()

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


  const scrollToRef = useCallback(inputRef => {
    inputRef.current.measure((x: number, _y: number, _w: number, _h: number, _px: number, py: number) => {
      scrollview.current.scrollTo({ x, y: py - StatusBar.height, animated: true })
    })
  }, [scrollview])

  return (
    <KeyboardAvoidingView style={{ width: Screen.width, height: Screen.height }}>
      <ScrollView
        ref={scrollview}
        style={[styles.container, { width: Screen.width, height: Screen.height }]}
        contentContainerStyle={[styles.contentContainer, { width: Screen.width }]}
        refreshControl={<RefreshControl colors={[Colors.text.primary]} refreshing={appLoading} onRefresh={refresh} progressViewOffset={Dimensions.appBar.height + StatusBar.height} />}>
        <View style={styles.view}>
          <AppBar />
          <Temperature />
          <HoldButton />
          <TemperatureChart />
          <RuleList onStartEditing={scrollToRef} />
        </View>
      </ScrollView>
      <AddRuleButton />
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flex: null,
    width: '100%',
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
