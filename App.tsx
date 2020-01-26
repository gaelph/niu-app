import React from 'react';

import { Alert, StyleSheet, StatusBar, SafeAreaView, View, ActivityIndicator } from 'react-native'

import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'

import { Home, Settings } from './src/screens'

import Colors from './src/theme/colors'
import { useFonts } from './src/theme/fonts'
import { flex, v } from './src/theme/styles'

import useApolloClient from './src/api'
import { ApolloProvider } from '@apollo/react-hooks'

import * as ErrorRecovery from 'expo-error-recovery';
// Error handling
ErrorUtils.setGlobalHandler((error) => {
  console.error(error)

  ErrorRecovery.setRecoveryProps({ error })

  Alert.alert(
    error.message,
    error.stack,
    [
      { text: 'OK' }
    ]
  )
})


const AppNavigator = createStackNavigator({
  Home: {
    screen: Home,
  },
  Settings: {
    screen: Settings
  }
}, {
  headerMode: 'none',
  cardStyle: {
    backgroundColor: Colors.background
  }
});

const AppContainer = createAppContainer(AppNavigator);


export default function App({ exp }) {
  let [loaded, error] = useFonts()
  const client = useApolloClient()

  if (exp.errorRecovery) {
    let error = exp.errorRecovery.error
    Alert.alert(
      error.message,
      error.stack,
      [
        { text: 'OK' }
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      { loaded && client 
      ?
        <>
          <ApolloProvider client={client}>
            <StatusBar translucent={true} backgroundColor={'transparent'}/>
            <AppContainer />
          </ApolloProvider>
        </>
      :
        <View style={[flex, v.center]}>
          <ActivityIndicator size={90} color={Colors.text.primary} />
        </View>
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
