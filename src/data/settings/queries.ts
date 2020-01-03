import { gql } from 'apollo-boost'

export const fetchSettings = gql`
query FetchSettings {
  listSettings{
    id
    title
    description
    value
  }
}`

export const updateSetting = gql`
mutation UpdateSetting($setting: UpdateSettingInput) {
  updateSetting(setting: $setting) {
    id
    value
  }
}
`

export const resetApp = gql`
mutation ResetApp {
  resetApp @client
}
`
