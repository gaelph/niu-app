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

  static async loadLocal(id: string, type: Function): Promise<Setting> {
    const raw = await AsyncStorage.getItem(id)
    if (raw) {
      let { title, description, value } = JSON.parse(raw)

      return new Setting(id, title, description, type(value))
    }
  }

  saveLocal(): Promise<void> {
    return AsyncStorage.setItem(this.id, JSON.stringify(this))
  }

}