import { gql } from 'apollo-boost';

export const fetchRules = gql`
query FetchRules {
  listRules {
    id
    name
    repeat
    active
    next_dates
    days
    schedules {
      from {
        hours
        minutes
      }
      to {
        hours
        minutes
      }
      high
    }
  }
}
`

export const createRule = gql`
mutation CreateRule($rule: CreateRuleInput) {
  createRule(rule: $rule) {
    id
    name
    repeat
    active
    days
    next_dates
    schedules {
      high
      from {
        hours
        minutes
      }
      to {
        hours
        minutes
      }
    }
  }
}`

export const updateRule = gql`
mutation UpdateRule($rule: UpdateRuleInput) {
  updateRule(rule: $rule) {
    id
    name
    repeat
    active
    days
    next_dates
    schedules {
      high
      from {
        hours
        minutes
      }
      to {
        hours
        minutes
      }
    }
  }
}`

export const deleteRule = gql`
mutation Delete($rule: DeleteRuleInput) {
  deleteRule(rule: $rule) {
    id
  }
}`

