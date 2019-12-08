import React from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView } from 'react-native'
import { NativeRouter, Route, nativeHistory, BackButton, Switch } from 'react-router-native'
import { AnimatedChild } from './AnimateChild'
import * as screens from './src/screens'

import Colors from './src/theme/colors'
import { useFonts } from './src/theme/fonts'


export default function App() {
  let [loaded, loading, error] = useFonts()


  return (
    <SafeAreaView style={styles.container}>
      {loaded &&
        <>
          <StatusBar translucent={true} backgroundColor={'transparent'}/>
          <NativeRouter history={nativeHistory} addressBar>
            <BackButton>
              {/* <AnimatedChild> */}
                <Switch>
                  <Route path="/" exact component={screens.Home} />
                  <Route path="/settings" component={screens.Settings} />
                </Switch>
              {/* </AnimatedChild> */}
            </BackButton>
          </NativeRouter>
        </>
      }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:1, 
    backgroundColor: Colors.background,
  },
});
