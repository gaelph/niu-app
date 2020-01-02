import React from 'react';

import { useBoilerStatus } from '../../data/boiler-status/hooks'

import BoilerStatus from '../../components/BoilerStatus'

export default () => {
  const { latest } = useBoilerStatus()

  return <BoilerStatus status={latest ? latest.value : false} />
}