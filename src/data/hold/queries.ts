import { gql } from 'apollo-boost';

export const fetchHold = gql`
query FetchHold {
  getHold {
    id
    value
    untilTime
  }
}`

export const createHold = gql`
mutation CreateHold($hold: CreateHoldInput) {
  createHold(hold: $hold) {
    id
    value
    untilTime
  }
}`

export const updateHold = gql`
mutation UpdateHold($hold: UpdateHoldInput) {
  updateHold(hold: $hold) {
    id
    value
    untilTime
  }
}`

export const deleteHold = gql`
mutation DeleteHold($id: ID!) {
  deleteHold(id: $id) {
    id
  }
}
`