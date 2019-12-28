import { AsyncStorage } from 'react-native'

export class Setting {
  id: string
  title: string
  description: string
  value: any

  constructor(id: string, title: string, description: string, value: any) {
    this.id = id
    this.title = title
    this.description = description
    this.value = value
  }

  static fromObject({id, title, description, value }: { id: string, title: string, description: string, value: any }) {
    return new Setting(id, title, description, value)
  }

  static key(id: string): string {
    return `Setting:${id}`
  }

  static async loadLocal(id: string, type: Function): Promise<Setting> {
    const raw = await AsyncStorage.getItem(Setting.key(id))
    if (raw) {
      let { title, description, value } = JSON.parse(raw)

      return new Setting(id, title, description, type(value))
    }
  }

  static async loadAll(): Promise<Setting[]> {
    let allKeys = await AsyncStorage.getAllKeys()

    let promises = allKeys
      .filter(key => key.startsWith("Setting:"))
      .map(key => AsyncStorage.getItem(key))

    return (await Promise.all(promises))
      .map(str => Setting.fromObject(JSON.parse(str)))
  }

  saveLocal(): Promise<void> {
    return AsyncStorage.setItem(Setting.key(this.id), JSON.stringify(this))
  }

}