import { ToastAndroid } from 'react-native'

function show(message) {
  ToastAndroid.show(message, ToastAndroid.SHORT)
}

const CHANGES_OK = 'Saved changes'
const ERROR = 'An error occurred'

export default {
  showChangesOK() {
    show(CHANGES_OK)
  },

  showError() {
    show(ERROR)
  }
}