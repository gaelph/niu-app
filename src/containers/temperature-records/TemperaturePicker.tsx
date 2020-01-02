import React, { useCallback } from 'react'

import TemperaturePickerComponent from '../../components/shared/TemperaturePicker'

interface TemperaturePickerProps {
  value: string,
  onValueChange: (value: number) => void
}

export default function TemperaturePicker({ value, onValueChange }: TemperaturePickerProps) {
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