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
import { getRules, getList, createRule, updateRule, deleteRule, useApiPolling, useApi, useMutation, } from '../api'
import { Dimensions as Dim } from 'react-native'

import Colors from '../theme/colors'
import Dimensions from '../theme/dimensions'
import { StatusBar, useDimensions } from '../support/dimensions'

import Settings, { DEFAULT_TARGET } from '../settings'

import AppBar from '../components/app-bar'
import TemperatureView from '../components/temperature-view'
import RecordsChart from '../components/records-chart'
import PlusButton from '../components/plus-button'
import Rules from '../components/rule/list'

import { TemperatureRecord } from '../api/models/temperature-record'
import { Rule } from '../api/models/rule'

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
  let scrollview = useRef<ScrollView>()

  const { data: records, loading, error, refresh } = useApiPolling(getList, 60 * 1000)
  const latestRecord = (records ? records.items[0]: null) as TemperatureRecord

  let [rules, setRules] = useState([])

  let [defaultTemperature, setDefaultTemperature] = useState('')

  useEffect(() => {
    Settings.get(DEFAULT_TARGET)
    .then(setDefaultTemperature)
  }, [])
  
  useEffect(() => {
    getRules()
    .then(({ items: data }) => {
      setRules(data)
    })
  }, [])

  let addRuleMutation = useMutation<Rule, Rule>(createRule)
  let updateRuleMutation = useMutation<Partial<Rule>, Rule>(updateRule)
  let deleteRuleMutation = useMutation<Rule, void>(deleteRule)

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
            <TemperatureView record={latestRecord} />
          }
          { records &&
            <RecordsChart records={records.items} />
          }
          <Rules rules={rules} onStartEditing={scrollToRef} onChange={changeRule} onRemove={removeRule} defaultTemperature={defaultTemperature} />
          {/* <RuleList rules={rules} onReady={add => addRule = add} onEdit={onEdit} /> */}
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
