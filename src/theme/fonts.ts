/**
 * # Fonts
 * 
 * Custom fonts loader
 * @category Theme
 * @module theme/fonts
 * @packageDocumentation
 */
import * as Font from 'expo-font'
import { useReducer, useEffect } from 'react'
import { reducer, AsyncActions} from 'support/async-reducer'

const fonts = {
  'Raleway-Black': require('../../assets/fonts/Raleway-Black.ttf'),
  'Raleway-BlackItalic': require('../../assets/fonts/Raleway-BlackItalic.ttf'),
  'Raleway-Bold': require('../../assets/fonts/Raleway-Bold.ttf'),
  'Raleway-BoldItalic': require('../../assets/fonts/Raleway-BoldItalic.ttf'),
  'Raleway-ExtraBold': require('../../assets/fonts/Raleway-ExtraBold.ttf'),
  'Raleway-ExtraBoldItalic': require('../../assets/fonts/Raleway-ExtraBoldItalic.ttf'),
  'Raleway-ExtraLight': require('../../assets/fonts/Raleway-ExtraLight.ttf'),
  'Raleway-ExtraLightItalic': require('../../assets/fonts/Raleway-ExtraLightItalic.ttf'),
  'Raleway-Italic': require('../../assets/fonts/Raleway-Italic.ttf'),
  'Raleway-Light': require('../../assets/fonts/Raleway-Light.ttf'),
  'Raleway-LightItalic': require('../../assets/fonts/Raleway-LightItalic.ttf'),
  'Raleway-Medium': require('../../assets/fonts/Raleway-Medium.ttf'),
  'Raleway-MediumItalic': require('../../assets/fonts/Raleway-MediumItalic.ttf'),
  'Raleway-Regular': require('../../assets/fonts/Raleway-Regular.ttf'),
  'Raleway-SemiBold': require('../../assets/fonts/Raleway-SemiBold.ttf'),
  'Raleway-SemiBoldItalic': require('../../assets/fonts/Raleway-SemiBoldItalic.ttf'),
  'Raleway-Thin': require('../../assets/fonts/Raleway-Thin.ttf'),
  'Raleway-ThinItalic': require('../../assets/fonts/Raleway-ThinItalic.ttf'),
}

/**
 * Tuple representing the fonts loading state.
 * - first element is a boolean that is `true` if fonts are **loaded**
 * - second element is a boolean that is `true` if fonts are **loading**
 * - third element is an `Error`, undefined if none occurred
 */
export type FontsHookResult = [boolean, boolean, Error]

/**
 * React Hook to load fonts
 */
export function useFonts(): FontsHookResult {
  let [state, dispatch] = useReducer(...reducer<boolean>())

  useEffect(() => {
    dispatch({ type: AsyncActions.Fetching })
    
    Font.loadAsync(fonts)
    .then(() => {
      dispatch({ type: AsyncActions.Fetched, payload: true })
    })
  }, [])

  return [state.data, state.loading, state.error]
}