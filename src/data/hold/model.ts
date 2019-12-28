import dayjs from 'dayjs'
import uuid from 'uuid/v4'

export class Hold {
  id?: string
  value: number
  untilTime: dayjs.Dayjs

  constructor(id: string, value: number, untilTime: dayjs.Dayjs) {
    this.id = id
    this.value = value
    this.untilTime = untilTime
  }

  static new(value: number, untilTime: dayjs.Dayjs): Hold {
    const id = uuid()
    return new Hold(id, value, untilTime)
  }

  static fromObject(object: { id: string, value: any; untilTime: string}): Hold {
    if (
      ! Object.prototype.hasOwnProperty.call(object, 'id')
      || !Object.prototype.hasOwnProperty.call(object, 'value')
      || ! Object.prototype.hasOwnProperty.call(object, 'untilTime')
    ) throw new Error('Invalid object passed to Hold.fromObject')

    return new Hold(object.id, parseInt(object.value, 10), dayjs(object.untilTime).utc())
  }

  static fromString(string: string): Hold {
    let object = JSON.parse(string)

    return Hold.fromObject(object)
  }

  static from(any: any): Hold {
    if (typeof any === 'string') {
      return Hold.fromString(any)
    }

    if (any !== null && typeof any === 'object' && !Array.isArray(any)) {
      return Hold.fromObject(any)
    }

    throw new Error('Cannot create Hold from type ' + typeof any)
  }

  isActive(): boolean {
    return !this.untilTime.isBefore(dayjs())
  }
}