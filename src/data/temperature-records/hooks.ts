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
  latest: () => TemperatureRecord | null
  error: ApolloError
  fetchMore: () => void
}

/**
 * Hook to provide temperature records to a view
 */
export function useTemperatureRecords(): TemperatureRecordResult {
  const client = useApolloClient()
  client.addResolvers(queries.resolvers)
  const interval = useRef<number>()
  
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
      console.warn(error)
    }
  }, [since, data, fetchMore])

  // Poll every now and then for new temperature records
  useEffect(() => {
    if (interval.current) clearInterval(interval.current)
    interval.current = setInterval(fetchLatest, 60000) as unknown as number

    () => {
      clearInterval(interval.current)
    }
  }, [since, fetchLatest])

  const recordInstances = useMemo(() => {
    return data
      ? data.temperatureRecordsSince.map(record => new TemperatureRecord(record))
      : []
  }, [data])

  const latest = useCallback((): TemperatureRecord | null => {
    if (recordInstances.length > 0) {
      return recordInstances[0]
    }

    return null
  }, [recordInstances])

  return { loading, records: recordInstances, latest, error, fetchMore: fetchLatest }
}
