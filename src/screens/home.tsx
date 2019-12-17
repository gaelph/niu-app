import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl,
  ToastAndroid,
} from 'react-native';
import { getRules, getList, createRule, updateRule, deleteRule, useApiPolling, createOverride, getOverride, updateOverride, deleteOverride, useMutation, } from '../api'
import { ListCursor } from '../api/types'
import { Dimensions as Dim } from 'react-native'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { StatusBar, useDimensions } from '../support/dimensions'

import Settings, { DEFAULT_TARGET, AWAY_TEMPERATURE, TIMEZONE_OFFET } from '../settings'

import AppBar from '../components/app-bar'
import TemperatureView from '../components/temperature-view'
import RecordsChart from '../components/records-chart'
import PlusButton from '../components/plus-button'
import Rules from '../components/rule/list'

import { TemperatureRecord } from '../api/models/temperature-record'
import { Rule, Schedule } from '../api/models/rule'
import { Override } from '../api/models/override'

import { CurrentState, currentDeviceState } from '../rules'

const Screen = Dim.get('window')


export function Home() {
  let Screen = useDimensions('window')
  let scrollview = useRef<ScrollView>()

  const { data: records, loading, error, refresh } = useApiPolling(getList, 60 * 1000, new ListCursor(1, 300))
  const latestRecord = (records ? records.items[0]: null) as TemperatureRecord

  let [rules, setRules] = useState<Rule[]>([])
  let [override, setOverride] = useState<Override>(null)

  let [awayTemperature, setAwayTemperature] = useState<string | number>('')
  let [defaultTarget, setDefaultTarget] = useState<string | number>('')
  let [timezoneOffset, setTimezoneOffset] = useState<number>(new Date().getTimezoneOffset() * 60)
  let [deviceState, setDeviceState] = useState<CurrentState>()

  useEffect(() => {
    Settings.get(AWAY_TEMPERATURE)
    .then(setAwayTemperature)

    Settings.get(DEFAULT_TARGET)
    .then(setDefaultTarget)

    Settings.get(TIMEZONE_OFFET)
    .then(setTimezoneOffset)
  }, [])

  let refreshTimeout = undefined
  useEffect(() => {
    clearTimeout(refreshTimeout)

    let fn = () => {
      let state = currentDeviceState(rules, timezoneOffset)
      setDeviceState(state)
    }

    fn()
    refreshTimeout = setTimeout(fn, 60000)

    return () => {
      clearTimeout(refreshTimeout)
    }
  }, [rules, awayTemperature, timezoneOffset])
  
  useEffect(() => {
    getRules()
    .then(({ items: data }) => {
      setRules(data)
    })
  }, [])

  useEffect(() => {
    getOverride()
    .then(override => {
      setOverride(override)
    })
  }, [])

  let addRuleMutation = useMutation<Rule, Rule>(createRule)
  let updateRuleMutation = useMutation<Partial<Rule>, Rule>(updateRule)
  let deleteRuleMutation = useMutation<Rule, void>(deleteRule)

  let addOverrideMutation = useMutation<Override, Override>(createOverride)
  let updateOverrideMutation = useMutation<Override, Override>(updateOverride)
  let deleteOverrideMutation = useMutation<Override, void>(deleteOverride)

  let showErrorMessage = useCallback(() => {
    ToastAndroid.show('An error occurred', ToastAndroid.SHORT)
  }, [])

  let showSuccessMessage = useCallback(() => {
    ToastAndroid.show('Saved changes', ToastAndroid.SHORT)
  }, [])

  let showMessage = useCallback((error) => {
    if (error) {
      showErrorMessage()
      console.error(error)
    } else {
      showSuccessMessage()
    }
  }, [])

  let addRule = useCallback(() => {
    let rule = Rule.default()
    setRules([...rules, rule])
    let { error } = addRuleMutation(rule)

    showMessage(error)
  }, [rules])

  let changeRule = useCallback((partialRule) => {
    let { id } = partialRule

    setRules(rules.map(rule => {
      if (rule.id === id) {
        return {
          ...rule,
          ...partialRule
        }
      }

      return rule
    }))

    let { error } = updateRuleMutation(partialRule)

    showMessage(error)
  }, [rules])

  let removeRule = useCallback((rule) => {
    setRules(rules.filter(({ id }) => id !== rule.id))

    let { error } = deleteRuleMutation(rule)

    showMessage(error)
  }, [rules])

  let addOrUpdateOverride = useCallback((override, update) => {
    let error
    if (override === null && update !== null) {
      let { value, untilTime } = update
      let override: Override = Override.new(value, untilTime)
      let result = addOverrideMutation(override)
      setOverride(override)
      error = result.error
    }
    else if (update === null) {
      let result = deleteOverrideMutation(override)
      setOverride(null)
      error = result.error
    }
    else if (override !== null) {
      let { value, untilTime } = update
      override.value = parseInt(value, 10)
      override.untilTime = untilTime.utc()
      let result = updateOverrideMutation(override)
      setOverride(override)
      error = result.error
    }

    showMessage(error)
  }, [rules, override])

  const scrollToRef = useCallback(inputRef => {
    inputRef.current.measure((x, _y, _w, _h, _px, py) => {
      setTimeout(() => {
        scrollview.current.scrollTo({ x, y: py - StatusBar.height, animated: true })
      }, 10)
    })
  }, [scrollview])

  return (
    <KeyboardAvoidingView behavior={'padding'} style={{ width: Screen.width, height: Screen.height }}>
      <ScrollView
        ref={scrollview}
        style={[styles.container, { width: Screen.width, height: Screen.height }]}
        contentContainerStyle={[styles.contentContainer, { width: Screen.width }]}
        refreshControl={<RefreshControl colors={[Colors.text.primary]} refreshing={loading} onRefresh={refresh} progressViewOffset={Dimensions.appBar.height + StatusBar.height} />}>
        <View style={{ flex: null, width: '100%', }}>
          <AppBar />
          { error &&
            <Text style={styles.text}>An error occurred</Text>
          }
          { latestRecord &&
            <TemperatureView record={latestRecord} defaultTemperature={awayTemperature as number} deviceState={deviceState} override={override} onOverride={addOrUpdateOverride} />
          }
          { records &&
            <RecordsChart records={records.items as TemperatureRecord[]} />
          }
          <Rules rules={rules} onStartEditing={scrollToRef} onChange={changeRule} onRemove={removeRule} defaultTemperature={defaultTarget} />
        </View>
      </ScrollView>
      <PlusButton onPress={addRule}/>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // position: 'absolute',
    // top: 0,
    // bottom: 0,
    // left: 0,
    // right: 0,
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
