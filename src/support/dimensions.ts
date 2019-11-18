import { useState, useEffect } from 'react'
import { Platform, StatusBar as SB, Dimensions as Dim } from 'react-native'


export function useDimensions(type: 'window' | 'screen') {
  const [screen, setScreen] = useState(Dim.get(type))

  useEffect(() => {
    let handler = ({ window }) => {
      setScreen(window)
    }

    Dim.addEventListener("change", handler)

    return () => Dim.removeEventListener("change", handler)
  })

  return screen
}

export const StatusBar = {
  ...SB,
  height: Platform.OS === 'android' ? SB.currentHeight : 20
}
