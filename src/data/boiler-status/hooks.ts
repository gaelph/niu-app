import { useMemo, useCallback, useEffect, useRef } from 'react'
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks'

import * as queries from "./queries"

import { BoilerStatus } from './model'

function dedup<T extends { id: number }>(array: T[]): T[] {
  const uniq: T[] = []
  const keys: number[] = []

  array.forEach(item => {
    if (!keys.includes(item.id)) {
      uniq.push(item)
      keys.push(item.id)
    }
  })

  return uniq
}

/**
 * Hook to locally keep the date of the most recent temperature record
 * This is to avoid refetching all 300 latest temperature records every minute
 */
const useSince = () => {
  const defaultSince = (new Date(0)).toISOString()
  const { data } = useQuery(queries.getSince)

  const [setSince, _] = useMutation(queries.setSince)

  const updateSince = useCallback((v) => {
    setSince({ variables: { since: v }})
  }, [])

  return [data ? data.boilerStatusSince: defaultSince, updateSince]
}


interface BoilerStatusHook {
  loading: boolean
  statuses: BoilerStatus[]
  latest: BoilerStatus
  fetchMore: () => void
}

const DEFAULT_HISTORY = []

export function useBoilerStatus(): BoilerStatusHook {
  const client = useApolloClient()
  client.addResolvers(queries.resolvers)

  const { loading, data, fetchMore } = useQuery(queries.fetchBoilerStatusHistory)

  const interval = useRef<number>()
  const [since, setSince] = useSince()

  // When statuses change, update the since value
  useEffect(() => {
    if (data) {
      try {
        let newSince = data.getAllEventsType[0].createdOn
        setSince(newSince)
      } catch {
        // ignore
      }
    }
  }, [data])

  const fetchLatest = useCallback(() => {
    try {
      fetchMore({
        variables: { after: since },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previous

          const allEvents = dedup([
            ...fetchMoreResult.getAllEventsType,
            ...previous.getAllEventsType
          ])

          const update = {
            ...previous,
            getAllEventsType: allEvents
          }

          return update
        }
      })
    } catch (error) {
      // ignore console.warn(error)
    }
  }, [since, data, fetchMore])

  // Poll every now and then for boiler status update
  useEffect(() => {
    if (interval.current) clearInterval(interval.current)
    interval.current = setInterval(fetchLatest, 60000) as unknown as number

    () => {
      clearInterval(interval.current)
    }
  }, [since, fetchLatest])

  const history = useMemo(() => {
    if (data) {
      return data.getAllEventsType.map(BoilerStatus.from)
    }
     
    return DEFAULT_HISTORY
  }, [data])

  const latest = useMemo(() => {
    if (history.length > 0) {
      return history[0]
    }

    return null
  }, [history])

  return {
    loading,
    statuses: history,
    fetchMore: fetchLatest,
    latest: latest
  }
}