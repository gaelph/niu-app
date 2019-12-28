import { useQuery } from '@apollo/react-hooks';

import * as queries from "./queries"

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
