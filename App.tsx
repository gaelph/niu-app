import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native'
import { NativeRouter, Route } from 'react-router-native'
import * as screens from './src/screens'

import Colors from './src/theme/colors'
import { useFonts } from './src/theme/fonts'



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
        </>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:1, 
    backgroundColor: Colors.background,
  },
});
