import { useMemo, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks'
import { ApolloError } from 'apollo-client'

import { TemperatureRecord } from './model'
import * as queries from "./queries"

/**
 * Hook to locally keep the date of the most recent temperature record
 * This is to avoid refetching all 300 latest temperature records every minute
 */
const useSince = () => {
  const defaultSince = (new Date(0)).toISOString()
  const { data } = useQuery(queries.getSince)

  const [setSince, _] = useMutation(queries.setSince)

  const updateSince = useCallback((v) => setSince({ variables: { since: v }}), [])

  return [data ? data.since: defaultSince, updateSince]
}

interface TemperatureRecordResult {
  loading: boolean
  records: TemperatureRecord[]
  latest: TemperatureRecord | null
  error: ApolloError
  fetchMore: () => void
}

const DEFAULT_RECORDS = []
const REFRESH_INTERVAL = 60000
const MIN_INTERVAL = 10000

/**
 * Hook to provide temperature records to a view
 */
export function useTemperatureRecords(): TemperatureRecordResult {
  const client = useApolloClient()
  client.addResolvers(queries.resolvers)

  const interval = useRef<number>()
  const timeout = useRef<number>()
  const fetchRecently = useRef<boolean>(false)

  
  const [since, setSince] = useSince()

  const { loading, data, error, fetchMore } = useQuery(queries.fetchTemperatureRecords, { partialRefetch: true })

  // When records change, update the since value
  useEffect(() => {
    if (data) {
      try {
        let newSince = data.temperatureRecordsSince[0].createdOn
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

            const update = {
              ...previous,
              temperatureRecordsSince: [
                ...fetchMoreResult.temperatureRecordsSince,
                ...previous.temperatureRecordsSince
              ]
            }

            return update
          }
        })
      } catch (error) {
        // ignore console.warn(error)
      }
    }
    else {
      console.log('prevented excessive refresh of temperature records')
    }
  }, [since, data, fetchMore])

  // Poll every now and then for new temperature records
  useEffect(() => {
    if (interval.current) clearInterval(interval.current)
    interval.current = setInterval(fetchLatest, REFRESH_INTERVAL) as unknown as number

    () => {
      clearInterval(interval.current)
    }
  }, [since, fetchLatest])

  const recordInstances = useMemo(() => {
    return data
      ? data.temperatureRecordsSince.map(record => new TemperatureRecord(record))
      : DEFAULT_RECORDS
  }, [data])

  const latest = useMemo((): TemperatureRecord | null => {
    if (recordInstances.length > 0) {
      return recordInstances[0]
    }

    return null
  }, [recordInstances])

  return { loading, records: recordInstances, latest, error, fetchMore: fetchLatest }
}
