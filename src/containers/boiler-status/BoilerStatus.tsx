import React from 'react';

import { useBoilerStatus, useAccurateBoilerStatus } from '../../data/boiler-status/hooks'

import BoilerStatus from '../../components/BoilerStatus'

export default () => {
  const { latest } = useBoilerStatus()
  useAccurateBoilerStatus()

  return <BoilerStatus status={latest ? latest.value : false} />
}