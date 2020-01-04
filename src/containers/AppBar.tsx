/**
 * # AppBar Container
 * AppBar displayed on the home screen
 * @category Containers
 * @module containers/AppBar
 * @packageDocumentation
 */
import React, { useCallback } from 'react'

import { withNavigation } from 'react-navigation'

import AppBarComponent, { AppBarRight, AppBarButton } from 'components/AppBar'

interface AppBarProps {
  /** @hidden */
  navigation: any
}

export function AppBar(props: AppBarProps): React.ReactElement {
  const { navigation } = props

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
}

export default withNavigation(AppBar)
