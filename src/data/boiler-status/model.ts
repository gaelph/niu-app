import dayjs from 'dayjs'

export class BoilerStatus {
  id: string
  value: boolean
  createdOn: dayjs.Dayjs

  constructor(id: string, value: string, createdOn: string) {
    this.id = id
    this.value = value === 'on' || value === 'true'
    this.createdOn = dayjs(createdOn)
  }

  static fromObject(obj: { id: string; value: string; createdOn: string }): BoilerStatus {
    if (!obj.id || typeof obj.id !== 'string') {
      throw new Error(`Invalid type for BoilerStatus id: "${obj.id}"`)
    }

    if (!obj.value || !['on', 'true', 'off', 'false'].includes(obj.value)) {
      throw new Error(`Invalid type for BoilerStatus value: "${obj.value}"`)
    }

    if (!obj.createdOn || typeof obj.createdOn !== 'string') {
      throw new Error(`Invalid type for BoilerStatus createdOn: "${obj.createdOn}"`)
    }

    const { id, value, createdOn } = obj

    return new BoilerStatus(id, value, createdOn)
  }

  static from(any: any): BoilerStatus {
    if (typeof any !== 'object') {
      throw new Error(`Can't create BoilerStatus from non object ${JSON.stringify(any)}`)
    }

    if (!any) {
      throw new Error(`Can't create BoilerStatus from null or undefined ${JSON.stringify(any)}`)
    }

    return BoilerStatus.fromObject(any)
  }
}