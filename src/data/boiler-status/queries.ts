/**
 * @category Queries
 * @module data/boiler-status/queries
 * @packageDocumentation
 */
import { gql } from 'apollo-boost';

export const fetchBoilerStatus = gql`
query FetchBoilerStatus {
  getLatestEventType(type: BOILER_STATUS) {
    id
    value
  }
}`

export const fetchBoilerStatusHistory = gql`
query FetchBoilerStatusHistory($after: Date) {
  getAllEventsType(type: BOILER_STATUS, after: $after) {
    id
    value
    createdOn
  }
}
`

export const setSince = gql`
mutation SetBoilerStatusSince($since: String) {
  setBoilerStatusSince(since: $since) @client
}
`

export const getSince = gql`
query GetBoilerStatusSince {
  boilerStatusSince @client
}
`

export const resolvers = {
  Mutation: {
    setSince: (_root, { since }: { since: String }, { cache }) => {
      cache.writeData({ data: { boilerStatusSince: since } });
    }
  }
}

export const initialState = {
  boilerStatusSince: (new Date(0)).toISOString()
}