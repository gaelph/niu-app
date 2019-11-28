import { StyleSheet } from 'react-native'

import Colors from './colors'

export const text = StyleSheet.create({
  default: {
    color: 'gray',
    fontSize: 20,
    fontFamily: 'Raleway-Regular'
  },
  primary: {
    color: Colors.text.primary
  },
  accent: {
    color: Colors.accent
  },
  small: {
    fontSize: 12
  },
  large: {
    fontSize: 34,
  },
  light: {
    fontFamily: 'Raleway-Light'
  },
  bold: {
    fontFamily: 'Raleway-Bold'
  },
  italic: {
    fontFamily: 'Raleway-MediumItalic'
  }
})

export const flex = {
  flex: 1
}

export const row = {
  flexDirection: 'row' as "row"
}

export const column = {
  flexDirection: 'column' as "column"
}

export const h = StyleSheet.create({
  alignStart: {
    ...row,
    alignItems: 'flex-start'
  },
  alignEnd: {
    ...row,
    alignItems: 'flex-end'
  },
  alignMiddle: {
    ...row,
    alignItems: 'center'
  },
  justifyLeft: {
    ...row,
    justifyContent: 'flex-start'
  },
  justifyRight: {
    ...row,
    justifyContent: 'flex-end'
  },
  justifyCenter: {
    ...row,
    justifyContent: 'center'
  },
  center: {
    ...row,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export const v = StyleSheet.create({
  alignStart: {
    ...column,
    justifyContent: 'flex-start'
  },
  alignEnd: {
    ...column,
    justifyContent: 'flex-end'
  },
  alignMiddle: {
    ...column,
    justifyContent: 'center'
  },
  justifyLeft: {
    ...column,
    alignItems: 'flex-start'
  },
  justifyRight: {
    ...column,
    alignItems: 'flex-end'
  },
  justifyCenter: {
    ...column,
    alignItems: 'center'
  },
  center: {
    ...column,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

type Margins = {
  0: { margin: number }
  t0: { marginTop: number }
  b0: { marginBottom: number }
  l0: { marginLeft: number }
  r0: { marginRight: number }
  h0: { marginHorizontal: number }
  v0: { marginVertical: number }
  4: { margin: number }
  t4: { marginTop: number }
  b4: { marginBottom: number }
  l4: { marginLeft: number }
  r4: { marginRight: number }
  h4: { marginHorizontal: number }
  v4: { marginVertical: number }
  8: { margin: number }
  t8: { marginTop: number }
  b8: { marginBottom: number }
  l8: { marginLeft: number }
  r8: { marginRight: number }
  h8: { marginHorizontal: number }
  v8: { marginVertical: number }
  12: { margin: number }
  t12: { marginTop: number }
  b12: { marginBottom: number }
  l12: { marginLeft: number }
  r12: { marginRight: number }
  h12: { marginHorizontal: number }
  v12: { marginVertical: number }
  16: { margin: number }
  t16: { marginTop: number }
  b16: { marginBottom: number }
  l16: { marginLeft: number }
  r16: { marginRight: number }
  h16: { marginHorizontal: number }
  v16: { marginVertical: number }
  20: { margin: number }
  t20: { marginTop: number }
  b20: { marginBottom: number }
  l20: { marginLeft: number }
  r20: { marginRight: number }
  h20: { marginHorizontal: number }
  v20: { marginVertical: number }
  24: { margin: number }
  t24: { marginTop: number }
  b24: { marginBottom: number }
  l24: { marginLeft: number }
  r24: { marginRight: number }
  h24: { marginHorizontal: number }
  v24: { marginVertical: number }
  32: { margin: number }
  t32: { marginTop: number }
  b32: { marginBottom: number }
  l32: { marginLeft: number }
  r32: { marginRight: number }
  h32: { marginHorizontal: number }
  v32: { marginVertical: number }
}

const margins: Margins = (() => {
  return [0, 4, 8, 12, 16, 20, 24, 32]
  .reduce((acc, i) => {
    acc[i] = { margin: i }
    acc[`t${i}`] = { marginTop: i }
    acc[`b${i}`] = { marginBottom: i }
    acc[`l${i}`] = { marginLeft: i }
    acc[`r${i}`] = { marginRight: i }
    acc[`h${i}`] = { marginHorizontal: i }
    acc[`v${i}`] = { marginVertical: i }

    return acc
  }, {} as Margins)
})()

type Paddings = {
  0: { padding: number }
  t0: { paddingTop: number }
  b0: { paddingBottom: number }
  l0: { paddingLeft: number }
  r0: { paddingRight: number }
  h0: { paddingHorizontal: number }
  v0: { paddingVertical: number }
  4: { padding: number }
  t4: { paddingTop: number }
  b4: { paddingBottom: number }
  l4: { paddingLeft: number }
  r4: { paddingRight: number }
  h4: { paddingHorizontal: number }
  v4: { paddingVertical: number }
  8: { padding: number }
  t8: { paddingTop: number }
  b8: { paddingBottom: number }
  l8: { paddingLeft: number }
  r8: { paddingRight: number }
  h8: { paddingHorizontal: number }
  v8: { paddingVertical: number }
  12: { padding: number }
  t12: { paddingTop: number }
  b12: { paddingBottom: number }
  l12: { paddingLeft: number }
  r12: { paddingRight: number }
  h12: { paddingHorizontal: number }
  v12: { paddingVertical: number }
  16: { padding: number }
  t16: { paddingTop: number }
  b16: { paddingBottom: number }
  l16: { paddingLeft: number }
  r16: { paddingRight: number }
  h16: { paddingHorizontal: number }
  v16: { paddingVertical: number }
  20: { padding: number }
  t20: { paddingTop: number }
  b20: { paddingBottom: number }
  l20: { paddingLeft: number }
  r20: { paddingRight: number }
  h20: { paddingHorizontal: number }
  v20: { paddingVertical: number }
  24: { padding: number }
  t24: { paddingTop: number }
  b24: { paddingBottom: number }
  l24: { paddingLeft: number }
  r24: { paddingRight: number }
  h24: { paddingHorizontal: number }
  v24: { paddingVertical: number }
  32: { padding: number }
  t32: { paddingTop: number }
  b32: { paddingBottom: number }
  l32: { paddingLeft: number }
  r32: { paddingRight: number }
  h32: { paddingHorizontal: number }
  v32: { paddingVertical: number }
}

const paddings: Paddings = (() => {
  return [0, 4, 8, 12, 16, 20, 24, 32]
  .reduce((acc, i) => {
    acc[i] = { padding: i }
    acc[`t${i}`] = { paddingTop: i }
    acc[`b${i}`] = { paddingBottom: i }
    acc[`l${i}`] = { paddingLeft: i }
    acc[`r${i}`] = { paddingRight: i }
    acc[`h${i}`] = { paddingHorizontal: i }
    acc[`v${i}`] = { paddingVertical: i }

    return acc
  }, {} as Paddings)
})()

export const m = StyleSheet.create(margins)
export const p = StyleSheet.create(paddings)
