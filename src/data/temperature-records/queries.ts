/**
 * @category Queries
 * @module data/temperature-records/queries
 * @packageDocumentation
 */
import { gql } from 'apollo-boost';

export const fetchTemperatureRecords = gql`
query FetchTemperatureRecords($after: Date) {
  temperatureRecordsSince(after: $after) {
    id
    value
    createdOn
  }
}`

export const setSince = gql`
mutation SetSince($since: String) {
  setSince(since: $since) @client
}
`

export const getSince = gql`
query GetSince {
  since @client
}
`

export const resolvers = {
  Mutation: {
    setSince: (_root, { since }: { since: String }, { client, cache }) => {
      cache.writeData({ data: { since }})
    }
  }
}

export const initialState = {
  since: (new Date(0)).toISOString()
}