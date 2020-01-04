/**
 * # Colors
 * Color palette used throuhout the application
 * 
 * Usage:
 * ```ts
 * import { Stylesheet } from 'react-native'
 * import Colors from './src/theme/colors'
 * 
 * const styles = Stylesheet.create({
 *   container: {
 *     backgroundColor: Colors.background
 *   }
 * })
 * ```
 * @category Theme
 * @module theme/colors
 * @packageDocumentation
 */

export interface Colors {
  /** Background color */
  readonly background: '#fcf9ea'
  /** Foreground color */
  readonly foreground: '#9bcfca'
  /** Border color */
  readonly border: 'rgba(166, 211, 206, 0.5)'
  /** Color for fine borders */
  readonly fineBorder: 'rgba(166, 211, 206, 0.2)'
  /** Accent color */
  readonly accent: '#f8a978'
  /** Grey color (used as tertiary text color) */
  readonly grey: '#777'
  /** Colors for text */
  readonly text: {
    readonly primary: 'rgba(114, 188, 174, 1)'
  }
}

export default {
  background: '#fcf9ea',
  foreground: '#9bcfca',
  border: 'rgba(166, 211, 206, 0.5)',
  fineBorder: 'rgba(166, 211, 206, 0.2)',
  accent: '#f8a978',
  grey: '#777',
  text: {
    primary: 'rgba(114, 188, 174, 1)'
  }
} as Colors