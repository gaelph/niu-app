import React from 'react';

import { useBoilerStatus } from '../../data/boiler-status/hooks'

import BoilerStatus from '../../components/BoilerStatus'

export default () => {
  const { status } = useBoilerStatus()

  return <BoilerStatus status={status} />
}