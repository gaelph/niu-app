/**
 * @category Containers
 * @module containers/temperature-records
 * @packageDocumentation
 */
import React, { useMemo } from 'react'

import { useTemperatureRecords } from 'data/temperature-records/hooks'
import TemperatureView from 'components/temperature-records/TempertureView'

/**
 * Displays and updates the main, big temperature view
 */
export default function Temperature(): React.ReactElement {
  const { latest } = useTemperatureRecords()

  return <TemperatureView record={latest} />
}