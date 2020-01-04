/**
 * # Toast
 * Tiny abstraction over ReactNative's ToastAndroid component'
 * @category Support
 * @module toast
 * @packageDocumentation
 */
import { ToastAndroid } from 'react-native'

function show(message) {
  ToastAndroid.show(message, ToastAndroid.SHORT)
}

const CHANGES_OK = 'Saved changes'
const ERROR = 'An error occurred'

export default {
  /**
   * Shows a success message
   */
  showChangesOK() {
    show(CHANGES_OK)
  },

  /**
   * Shows an error message
   */
  showError() {
    show(ERROR)
  }
}