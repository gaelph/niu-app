/**
 * @category Containers
 * @module containers/temperature-records
 * @packageDocumentation
 */

import React, { useState, useEffect, useCallback } from 'react'
import TemperatureModal from 'components/shared/TemperatureModal'

interface TemperatureModalProps {
  visible: boolean
  value: number | string
  onValueChange: (value: number | string) => void
  onClose: () => void
  /** @hidden */
  children: React.ReactText | React.ReactText[]
}

/**
 * Modal to pick a temperature
 */
export default function TemperatureSetModal(props: TemperatureModalProps): React.ReactElement{
  const { visible, onValueChange, onClose, value, children } = props
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