/**
 * @category Containers
 * @module containers/hold
 * @packageDocumentation
 */
import React, { useState, useCallback, } from 'react'
import { View } from 'react-native'

import { h, m } from 'theme/styles'
import Toast from 'support/toast'

import { useHold } from 'data/hold/hooks'
import { useCurrentTargetTemperature } from 'data/target-temperature/hooks'

import { HoldModal } from './HoldModal'
import { HoldButton as HoldButtonComponent } from 'components/hold/HoldButton'

/**
 * Button displaying the current target temperature and time of next change.\
 * Pressed, it opens [[HoldModal]] to allow the user to create, update or delete a [[Hold]]
 */
export default function HoldButton(): React.ReactElement {
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

  const currentTargetTemperature = useCurrentTargetTemperature()

  const onValueChange = useCallback((hold) => {
    updateHold(hold)
    setShowModal(false)
  }, [hold, updateHold, setShowModal])

  return (
  <View style={[h.justifyCenter, h.alignMiddle, m.t24]}>
    <HoldButtonComponent
      targetTemperature={currentTargetTemperature}
      onPress={() => setShowModal(true)} />
    <HoldModal 
      visible={showModal} 
      onClose={() => setShowModal(false)} 
      targetTemperature={currentTargetTemperature}
      onValueChange={onValueChange} />
  </View>
  )
}