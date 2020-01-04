/**
 * # Boiler Status Containers
 * ```ts
 * import BoilerStatus from 'containers/boiler-status/BoilerStatus'
 * ```
 * @category Containers
 * @module containers/boiler-status
 * @packageDocumentation
 */
import React from 'react'

import { useBoilerStatus, useAccurateBoilerStatus } from 'data/boiler-status/hooks'

import BoilerStatusComponent from 'components/BoilerStatus'

/**
 * Displays a boiler status indicator
 * that updates whenever it changes
 */
export default function BoilerStatus(): React.ReactElement {
  const { latest } = useBoilerStatus()
  useAccurateBoilerStatus()

  return <BoilerStatusComponent status={latest ? latest.value : false} />
}