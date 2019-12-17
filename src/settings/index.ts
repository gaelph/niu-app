import { Setting } from '../api/models/setting'
import { updateSetting } from '../api/queries'

interface SettingParam {
  id: string,
  title: string,
  description: string,
  type: Function,
  defaultValue: any
}

export const DEFAULT_TARGET: SettingParam = {
  id: "default_target",
  title: "Default target temperature",
  description: "Default temperature when creating new schedules",
  type: Number,
  defaultValue: 20
}

export const AWAY_TEMPERATURE: SettingParam = {
  id: "away_temperature",
  title: "Away temperature",
  description: "Temperature when you are away from home",
  type: Number,
  defaultValue: 15
}

export const TIMEZONE_OFFET: SettingParam = {
  id: "timezone",
  title: null,
  description: null,
  type: Number,
  defaultValue: 0
}

async function getSetting({ id, type, defaultValue }: SettingParam): Promise<any> {
  let setting = await Setting.loadLocal(id, type)

  if (setting) return setting.value
  else         return defaultValue
}

async function setSetting({ id, title, description }: SettingParam, value: any): Promise<void> {
  let setting = new Setting(id, title, description, value.toString())
  
  try {
    await updateSetting(setting)
    await setting.saveLocal()
  } catch (error) {
    console.error(error)
  }
}

async function getAllSettings(): Promise<Setting[]> {
  return Setting.loadAll()
}

export default {
  get: getSetting,
  set: setSetting,
  all: getAllSettings
}