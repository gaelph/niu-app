import React, { useCallback } from 'react'

import { withNavigation } from 'react-navigation'

import AppBarComponent, { AppBarRight, AppBarButton } from '../components/AppBar'


export default withNavigation(function AppBar({ navigation }) {
  let toSettings = useCallback(() => {
    navigation.navigate('Settings')
  }, [navigation])


  return (
    <AppBarComponent backButton={false}>
      <AppBarRight>
        <AppBarButton icon="settings" onPress={toSettings} />
      </AppBarRight>
    </AppBarComponent>
  )
})
