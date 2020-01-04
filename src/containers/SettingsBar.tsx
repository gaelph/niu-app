/**
 * # Settings Bar Container
 * AppBar displayed on the Settings screen
 * @category Containers
 * @module containers/SettingsBar
 * @packageDocumentation
 */
import React from 'react'

import AppBarComponent, { AppBarTitle} from 'components/AppBar'


export default function SettingsBar(): React.ReactElement {

  return (
    <AppBarComponent backButton={true}>
      <AppBarTitle>Settings</AppBarTitle>
    </AppBarComponent>
  )
}
