/**
 * # Dimensions
 * Dimensions used throuhout the application
 * 
 * Usage:
 * ```ts
 * import { Stylesheet } from 'react-native'
 * import Dimensions from './src/theme/dimensions'
 * 
 * const styles = Stylesheet.create({
 *   container: {
 *     padding: Dimensions.padding
 *   }
 * })
 * ```
 * @category Theme
 * @module theme/dimensions
 * @packageDocumentation
 */

export interface Dimensions {
  readonly appBar: {
    readonly height: 64
  },
  readonly padding: 30
}


export default {
  appBar: {
    height: 64,
  },
  padding: 30
} as Dimensions