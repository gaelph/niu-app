/**
 * @category Data Model
 * @module data/hold/model
 * @packageDocumentation
 */
import dayjs from 'dayjs'
import uuid from 'uuid/v4'

/**
 * Data structure to manipultate Holds.\
 * Holds are used to override Rules' schdules target temperature, or lack thereof.
 */
export class Hold {
  id?: string
  /** The temperature the device should target */
  value: number
  /** When does the "override" stop */
  untilTime: dayjs.Dayjs

  constructor(id: string, value: number, untilTime: dayjs.Dayjs) {
    this.id = id
    this.value = value
    this.untilTime = untilTime
  }

  /**
   * Instanciate a new `Hold` with an id
   */
  static new(value: number, untilTime: dayjs.Dayjs): Hold {
    const id = uuid()
    return new Hold(id, value, untilTime)
  }

  /**
   * Instanciate a `Hold` from an object
   * @throws if the object is missing properties or their type is invalid
   */
  static fromObject(object: { id: string, value: any; untilTime: string}): Hold {
    if (
      ! Object.prototype.hasOwnProperty.call(object, 'id')
      || !Object.prototype.hasOwnProperty.call(object, 'value')
      || ! Object.prototype.hasOwnProperty.call(object, 'untilTime')
    ) throw new Error('Invalid object passed to Hold.fromObject')

    return new Hold(object.id, parseInt(object.value, 10), dayjs(object.untilTime))
  }

  /**
   * Instanciate a `Hold` from a string
   * @throws if the object is missing properties or their type is invalid
   */
  static fromString(string: string): Hold {
    let object = JSON.parse(string)

    return Hold.fromObject(object)
  }

  /**
   * Instanciate a `Hold` from anything
   * @throws if the parameter is not a string or an object, or is null or undefined
   * @throws if the object is missing properties or their type is invalid
   */
  static from(any: any): Hold {
    if (typeof any === 'string') {
      return Hold.fromString(any)
    }

    if (any !== null && typeof any === 'object' && !Array.isArray(any)) {
      return Hold.fromObject(any)
    }

    throw new Error('Cannot create Hold from type ' + typeof any)
  }

  /**
   * Returns true is the hold is active.\
   * i.e.: `untilTime` is not past
   */
  isActive(): boolean {
    return !this.untilTime.isBefore(dayjs())
  }
}