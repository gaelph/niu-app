/**
 * @category Screens
 * @module home
 * @packageDocumentation
 */
// External imports
import React, { useCallback, useRef, useEffect, useState } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl,
  Keyboard,
  Platform,
  UIManager,
  LayoutAnimation
} from 'react-native'

// Styles and dimensions
import Colors from 'theme/colors'
import Dimensions from 'theme/dimensions'
import { StatusBar, useDimensions } from 'support/dimensions'

// Data layer
import { useTemperatureRecords } from 'data/temperature-records/hooks'
import { useBoilerStatus } from 'data/boiler-status/hooks'
import { useSettings } from 'data/settings/hooks'
import { useRules } from 'data/rules/hooks'

// Container views
import AppBar from 'containers/AppBar'
import HoldButton from 'containers/hold/HoldButton'
import RuleList from 'containers/rules/RulesList'
import AddRuleButton from 'containers/rules/AddRuleButton'
import Temperature from 'containers/temperature-records/Temperature'
import TemperatureChart from 'containers/temperature-records/TemperatureChart'

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export function Home() {
  let Screen = useDimensions('window')
  let scrollview = useRef<ScrollView>()

  const Records = useTemperatureRecords()
  const BoilerStatus = useBoilerStatus()
  const Settings = useSettings()

  const Rules = useRules()

  const refresh = useCallback(() => {
    Records.fetchMore()
    BoilerStatus.fetchMore()
  }, [Records, BoilerStatus, BoilerStatus])

  const appLoading = Records.loading 
    || Rules.loading
    || Settings.loading 
    || BoilerStatus.loading
    || BoilerStatus.loading


  const [paddingBottom, setPaddingBottom] = useState<number>(0)
  const refToScrollTo = useRef()

  const scrollToRef = useCallback((height) => {
    if (refToScrollTo.current !== undefined) {
      //@ts-ignore
      refToScrollTo.current.measure((x: number, _y: number, _w: number, _h: number, _px: number, py: number) => {
        scrollview.current.scrollTo({ x, y:  py + 54, animated: true })
      })
    }
  }, [scrollview, Screen.height])

  const onStartEditing = useCallback(inputRef => {
    refToScrollTo.current = inputRef.current
    scrollToRef(paddingBottom)
  }, [paddingBottom])

  useEffect(() => {
    let upListener = Keyboard.addListener("keyboardDidShow", (e) => {
      LayoutAnimation.easeInEaseOut()
      setPaddingBottom(e.endCoordinates.height)
      setTimeout(() => scrollToRef(e.endCoordinates.height), 10)
    })

    let downListener = Keyboard.addListener("keyboardDidHide", () => {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          100, 'easeIn', 'opacity'
          )
      )
      setPaddingBottom(0)
      refToScrollTo.current = undefined
    })

    return () => {
      upListener.remove()
      downListener.remove()
    }
  })

  return (<>
    <View style={{ flex: 1, height: Screen.height - paddingBottom, marginBottom: paddingBottom }}>
      <ScrollView
        ref={scrollview}
        style={[styles.container]}
        contentContainerStyle={[styles.contentContainer]}
        refreshControl={<RefreshControl colors={[Colors.text.primary]} refreshing={appLoading} onRefresh={refresh} progressViewOffset={Dimensions.appBar.height + StatusBar.height} />}>
        <AppBar />
        <Temperature />
        <HoldButton />
        { Records.records && Records.records.length > 0 &&
          <TemperatureChart />
        }
        <RuleList onStartEditing={onStartEditing} />
      </ScrollView>
      <AddRuleButton />
    </View>
  </>);
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    alignItems: 'center',
    paddingTop: StatusBar.height,
    paddingBottom: Dimensions.appBar.height + StatusBar.height,
    justifyContent: 'flex-start',
  },
  view: {
    width: '100%'
  },
  text: {
    color: Colors.foreground,
    fontSize: 16,
    fontFamily: 'Raleway-SemiBold'
  },
});
