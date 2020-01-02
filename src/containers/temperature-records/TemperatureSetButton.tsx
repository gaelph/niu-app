import React, { useState } from 'react'

import TemperatureModal from './TemperatureModal'
import TemperatureSetButtonComponent from '../../components/shared/TemperatureSetButton'


type TemperatureSetterProps = {
  value: number,
  defaultValue: number | '',
  message: string,
  onChange: (value: string) => void
}

export default function TemperatureSetter({ value, defaultValue, onChange, message }: TemperatureSetterProps) {
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