import React from 'react';
import { View, StyleSheet, StatusBar, KeyboardAvoidingView } from 'react-native'
import { NativeRouter, Route } from 'react-router-native'
import * as screens from './src/screens'
import AppBar from './src/components/app-bar'

import Colors from './src/theme/colors'
import Dimensions from './src/theme/dimensions'
import { useFonts } from './src/theme/fonts'

import { Dimensions as Dim } from 'react-native'

let Screen = Dim.get('window')

export default function App() {
  let [loaded, loading, error] = useFonts()

  return (
    <View style={styles.container}>
      {loaded &&
        <>
          <StatusBar translucent={true} backgroundColor={'transparent'}/>
          <NativeRouter>
            <Route path="/" component={screens.Home} />
          </NativeRouter>
          <AppBar />
        </>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:1, 

    backgroundColor: Colors.background,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
