/**
 * @category Containers
 * @module containers/temperature-records
 * @packageDocumentation
 */
import React, { useState } from 'react'

import TemperatureModal from './TemperatureModal'
import TemperatureSetButtonComponent from 'components/shared/TemperatureSetButton'


type TemperatureSetterProps = {
  value: number,
  defaultValue: number | '',
  message: string,
  onChange: (value: string | number) => void
}

/**
 * A button that shows a temperature, and opens a modal to change the value on press
 */
export default function TemperatureSetter(props: TemperatureSetterProps): React.ReactElement{
  const { value, defaultValue, onChange, message } = props

  let [modalVisible, setModalVisible] = useState(false)

  return (
    <>
      <TemperatureModal visible={modalVisible} value={value || defaultValue} onClose={() => setModalVisible(false)} onValueChange={(value) => { onChange(value); setModalVisible(false) }}>
        {message}
      </TemperatureModal>             
      <TemperatureSetButtonComponent value={value || defaultValue as number} onPress={() => setModalVisible(true)} />
    </>
  )
}