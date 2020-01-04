/**
 * @category Containers
 * @module containers/temperature-records
 * @packageDocumentation
 */
import React, { useCallback } from 'react'

import TemperaturePickerComponent from 'components/shared/TemperaturePicker'

interface TemperaturePickerProps {
  value: string,
  onValueChange: (value: number) => void
}

/**
 * Temperature picker (not a modal)
 */
export default function TemperaturePicker(props: TemperaturePickerProps): React.ReactElement{
  const { value, onValueChange } = props

  const increment = useCallback(() => {
    let v = parseInt(value, 10) + 1

    if (v <= 30) {
      onValueChange(v)
    }
  }, [onValueChange])

  const decrement = useCallback(() => {
    let v = parseInt(value, 10) - 1

    if (v >= 5) {
      onValueChange(v)
    }
  }, [onValueChange])

  return (
    <TemperaturePickerComponent
      value={value}
      onIncrement={increment}
      onDecrement={decrement}
    />
  )
}