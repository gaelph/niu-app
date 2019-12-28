import { gql } from 'apollo-boost';

export const fetchBoilerStatus = gql`
query FetchBoilerStatus {
  getLatestEventType(type: BOILER_STATUS) {
    id
    value
  }
}`