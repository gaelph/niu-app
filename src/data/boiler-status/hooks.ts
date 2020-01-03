import { useMemo, useCallback, useEffect, useRef, useReducer } from 'react'
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks'

import * as queries from "./queries"

import { BoilerStatus } from './model'

import { useCurrentTargetTemperature } from '../target-temperature/hooks'
import { useTemperatureRecords } from '../temperature-records/hooks'

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
const REFRESH_INTERVAL = 60000
const MIN_INTERVAL = 10000

export function useBoilerStatus(): BoilerStatusHook {
  const client = useApolloClient()
  client.addResolvers(queries.resolvers)

  const { loading, data, fetchMore } = useQuery(queries.fetchBoilerStatusHistory)

  const interval = useRef<number>()
  const timeout = useRef<number>()
  const fetchRecently = useRef<boolean>(false)

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
    if (fetchRecently.current == false) {
      fetchRecently.current = true

      timeout.current = setTimeout(() => {
        fetchRecently.current = false
      }, MIN_INTERVAL) as unknown as number

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
    }
    else {
      console.log('prevented excessive refresh of boiler status')
    }
  }, [since, data, fetchMore])

  // Poll every now and then for boiler status update
  useEffect(() => {
    if (interval.current) clearInterval(interval.current)
    interval.current = setInterval(fetchLatest, REFRESH_INTERVAL) as unknown as number

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

const POLL_INTERVAL = 1000
const POLL_TIMEOUT = 30 * 1000
/**
 * Polls for boiler status changes every second for 30 second after either:
 *  - current target temperature changed
 *  - current room temperature changed
 * @return {void}
 */
export function useAccurateBoilerStatus() {
  // Data source that can stop the polling
  const BoilerStatus = useBoilerStatus()
  // Data sources that can trigger the polling
  const targetTemperature = useCurrentTargetTemperature()
  const Records = useTemperatureRecords()

  // interval for polling every second
  const interval = useRef<number>()
  // timeout to stop the polling after 30 seconds
  const timeout = useRef<number>()

  // Stops the polling if the boiler status changes
  useEffect(() => {
    // null check
    if (interval.current && BoilerStatus.latest) {
      clearInterval(interval.current)
    }
  }, [BoilerStatus.latest])

  // Polls every second with a 30 second timeout
  const startCheck = useCallback(() => {
    if (interval.current) clearInterval(interval.current)
    if (timeout.current) clearTimeout(timeout.current)

    interval.current = setInterval(() => {
      BoilerStatus.fetchMore()
    }, POLL_INTERVAL) as unknown as number

    timeout.current = setTimeout(() => {
      clearInterval(interval.current)
    }, POLL_TIMEOUT) as unknown as number
  }, [interval, timeout])

  // Starts the polling if:
  // - boiler is on and room temperature equals target temperature
  // - boiler is off and room temperature is 0.6˚ below target temperature
  useEffect(() => {
    if (BoilerStatus.latest && Records.latest) {
      if (BoilerStatus.latest.value) {
        let trigger = targetTemperature.value

        if (Records.latest.value >= trigger) {
          startCheck()
        }
      }
      else {
        let trigger = targetTemperature.value - 0.6

        if (Records.latest.value <= trigger) {
          startCheck()
        }

      }
    }

    // Clean up intervals on ummount
    return () => {
      clearInterval(interval.current)
      clearInterval(timeout.current)
    }
  }, [BoilerStatus.latest, targetTemperature.value, Records.latest])
}