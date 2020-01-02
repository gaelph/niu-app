import React, { useMemo } from 'react'

import { useTemperatureRecords } from '../../data/temperature-records/hooks'
import TemperatureView from '../../components/temperature-records/TempertureView'

export default () => {
  const { latest } = useTemperatureRecords()

  const record = useMemo(() => latest(), [latest])

  return <TemperatureView record={record} />
}