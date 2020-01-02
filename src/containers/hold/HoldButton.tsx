import React, { useMemo, useState, useCallback, } from 'react'
import { View } from 'react-native'
import dayjs from 'dayjs'

import { h, m } from '../../theme/styles'
import Toast from '../../support/toast'

import { useHold } from '../../data/hold/hooks'
import { useRules } from '../../data/rules/hooks'
import { currentDeviceState } from '../../data/rules/device-state'
import { useSettings, AWAY_TEMPERATURE, TIMEZONE_OFFSET } from '../../data/settings/hooks'

import { HoldModal } from './HoldModal'
import { HoldButton as HoldButtonComponent } from '../../components/hold/HoldButton'

export default function HoldButton() {
  const [showModal, setShowModal] = useState<boolean>(false)
  const { hold, updateHold } = useHold({
    onMutationSuccess: () => {
      Toast.showChangesOK()
      setShowModal(false)
    },
    onMutationError: (error: Error) => {
      console.error(error)
      Toast.showError()
    }
  })

  const { rules } = useRules()
  const Settings = useSettings()
  const awayTemperature = Settings.get(AWAY_TEMPERATURE)
  const timezone = Settings.get(TIMEZONE_OFFSET)

  const currentSchedule = useMemo(() => {
    if (timezone === null) return {}
    
    return currentDeviceState(rules, timezone)
  }, [rules, timezone])

  const onValueChange = useCallback((hold) => {
    updateHold(hold)
    setShowModal(false)
  }, [hold, updateHold, setShowModal])

  return (
  <View style={[h.justifyCenter, h.alignMiddle, m.t24]}>
    <HoldButtonComponent
      currentSchedule={currentSchedule}
      hold={hold}
      awayTemperature={awayTemperature}
      timezone={timezone}
      onPress={() => setShowModal(true)} />
    <HoldModal visible={showModal} onClose={() => setShowModal(false)} value={hold} currentSchedule={currentSchedule} onValueChange={onValueChange} />
  </View>
  )
}