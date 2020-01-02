import React from 'react'

import AppBarComponent, { AppBarTitle} from '../components/AppBar'


export default function SettingsBar() {

  return (
    <AppBarComponent backButton={true}>
      <AppBarTitle>Settings</AppBarTitle>
    </AppBarComponent>
  )
}
