import { useQuery } from '@apollo/react-hooks'

import * as queries from "./queries"

import { BoilerStatus } from './model'

interface BoilerStatusHook {
  loading: boolean
  status: boolean
  refresh: () => void
}

export function useBoilerStatus(): BoilerStatusHook {
  const { loading, data, refetch } = useQuery(queries.fetchBoilerStatus, {
    pollInterval: 30000
  })

  return {
    loading,
    status: data
      ? data.getLatestEventType.value === 'true'
      : false,
    refresh: refetch
  }
}

interface BoilerStatusHookHistory {
  loading: boolean
  statuses: BoilerStatus[]
  refresh: () => void
}

export function useBoilerStatusHistory(): BoilerStatusHookHistory {
  const { loading, data, refetch } = useQuery(queries.fetchBoilerStatusHistory, {
    pollInterval: 60000
  })

  return {
    loading,
    statuses: data
      ? data.getAllEventsType.map(BoilerStatus.from)
      : [],
    refresh: refetch
  }
}