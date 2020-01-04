/**
 * @category Data Model
 * @module data/boiler-status/model
 * @packageDocumentation
 */
import dayjs from 'dayjs'

/**
 * Data strucure representing a BoilerStatus.\
 * A BoilerStatus correspond to an event emitted by the device, either:
 *  - `"on"`: the boiler is on and warming the room
 *  - `"off"`: the boiler is off
 */
export class BoilerStatus {
  id: string
  /** `true` if the boiler is on, `false` otherwise */
  value: boolean
  createdOn: dayjs.Dayjs

  /**
   * @param value must be one of `"on"`, `"off"`, `"true"`, or `"false"`
   * @param createdOn must be a valid ISO 8601 date
   */
  constructor(id: string, value: string, createdOn: string) {
    this.id = id
    this.value = value === 'on' || value === 'true'
    this.createdOn = dayjs(createdOn)
  }

  /**
   * Instanciate a BoilerStatus from a plain object
   * @throws if the object doesn't have all properties'
   */
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

  /**
   * Instanciate a BoilerStatus from a value
   * @throws if the value is not an object, is null or undefined
   */
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