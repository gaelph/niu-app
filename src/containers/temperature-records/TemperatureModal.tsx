import React, { useState, useEffect, useCallback } from 'react'
import TemperatureModal from '../../components/shared/TemperatureModal'


export default function TemperatureSetModal({ visible, onValueChange, onClose, value, children }) {
  let [high, setHigh] = useState(value.toString())

  useEffect(() => {
    setHigh(value.toString())
  }, [value])

  const onConfirm = useCallback(() => {
    if (high.toString() != value.toString()) {
      onValueChange(high)
    }

    onClose()
  }, [high, onClose])

  return <TemperatureModal 
      visible={visible}
      value={high}
      onClose={onClose}
      onConfirm={onConfirm}
      onValueChange={(value) => setHigh(value.toString())}
    >
    { children }
    </TemperatureModal>
}