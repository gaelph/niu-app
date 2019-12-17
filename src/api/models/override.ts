import dayjs from 'dayjs'
import uuid from 'uuid/v4'

export class Override {
  id?: string
  value: number
  untilTime: dayjs.Dayjs

  constructor(id: string, value: number, untilTime: dayjs.Dayjs) {
    this.id = id
    this.value = value
    this.untilTime = untilTime
  }

  static new(value: number, untilTime: dayjs.Dayjs): Override {
    const id = uuid()
    return new Override(id, value, untilTime)
  }

  static fromObject(object: { id: string, value: any; untilTime: string}): Override {
    if (
      ! Object.prototype.hasOwnProperty.call(object, 'id')
      || !Object.prototype.hasOwnProperty.call(object, 'value')
      || ! Object.prototype.hasOwnProperty.call(object, 'untilTime')
    ) throw new Error('Invalid object passed to Override.fromObject')

    return new Override(object.id, parseInt(object.value, 10), dayjs(object.untilTime).utc())
  }

  static fromString(string: string): Override {
    let object = JSON.parse(string)

    return Override.fromObject(object)
  }

  static from(any: any): Override {
    if (typeof any === 'string') {
      return Override.fromString(any)
    }

    if (typeof any === 'object' && !Array.isArray(any)) {
      return Override.fromObject(any)
    }

    throw new Error('Cannot create Override from type ' + typeof any)
  }

  isActive(): boolean {
    return !this.untilTime.isBefore(dayjs())
  }
}