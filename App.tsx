import React from 'react';
import { ErrorRecovery } from 'expo';

import { Alert, StyleSheet, StatusBar, SafeAreaView } from 'react-native'
import { NativeRouter, Route, BackButton, Switch } from 'react-router-native'

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import { Home, Settings } from './src/screens'

import Colors from './src/theme/colors'
import { useFonts } from './src/theme/fonts'

import useApolloClient from './graphql-client'
import { ApolloProvider } from '@apollo/react-hooks';


// Error handling
ErrorUtils.setGlobalHandler((error) => {
  ErrorRecovery.setRecoveryProps({ error })

  console.error(error)

  Alert.alert(
    error.message,
    error.stack,
    [
      { text: 'OK'}
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
  headerMode: 'none'
});

const AppContainer = createAppContainer(AppNavigator);


export default function App({ error: previousError }) {
  let [loaded, error] = useFonts()
  const client = useApolloClient()

  if (previousError) {
    console.error(error)
    Alert.alert(
        'Error',
        previousError.message,
        [
          { text: 'OK'}
        ]
      )
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {loaded && client &&
        <>
          <ApolloProvider client={client}>
            <StatusBar translucent={true} backgroundColor={'transparent'}/>
            <AppContainer />
          </ApolloProvider>
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
