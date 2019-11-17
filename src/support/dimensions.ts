import { Platform, StatusBar, Dimensions } from 'react-native'

export const statusBarHeight = () => Platform.OS === 'android' ? StatusBar.currentHeight : 20
export const screenWidth = () => Dimensions.get('window').width