/**
 * @category Data Model
 * @module data/target-temperature/model
 * @packageDocumentation
 */
import dayjs from 'dayjs'

import { Schedule } from '../rules/model'
import { Hold } from '../hold/model'

import { DayFromNumber, weekday } from 'support/days'

/**
 * Currently active schedule (`current`)
 * and time at which it stops being active (`nextChnage`).
 * 
 * If no schedule is active, then `current`
 * is null or undefined
 * and `nextChange` is the time the next
 * schedule will be active
 */
export interface CurrentSchedule {
  current?: Schedule | null
  nextChange?: dayjs.Dayjs
}

/**
 * Information about the current target temperature
 */
export class TargetTemperature {
  /** The current temperature*/
  value: number
  /** The device timezone */
  timezone: number
  /** Id of the currently active hold, or `false` if no hold is active */
  hold: string | boolean
  /** `true` if a schedule is currently active */
  schedule: boolean
  /** Time of next target temperature change */
  nextChange: dayjs.Dayjs | null

  constructor(value: number, timezone: number, hold: string | boolean, schedule: boolean, nextChange?: dayjs.Dayjs) {
    this.value = value
    this.timezone = timezone
    this.hold = hold
    this.schedule = schedule
    this.nextChange = nextChange || null
  }

  /**
   * Instanciate a new `TargetTemperature` from a [[Hold]]
   */
  static fromHold(hold: Hold, timezone: number) {
    return new TargetTemperature(hold.value, timezone, hold.id, false, hold.untilTime)
  }

  /**
   * Instanciate a new `TargetTemperature` from a [[Schedule]]
   */
  static fromCurrentSchedule(state: CurrentSchedule, timezone: number, awayTemperature: number) {
    if (state.current) {
      const { current: schedule } = state
      return new TargetTemperature(schedule.high, timezone, false, true, state.nextChange)
    }

    if (state.nextChange) {
      return new TargetTemperature(awayTemperature, timezone, false, false, state.nextChange)
    }

    return new TargetTemperature(awayTemperature, timezone, false, false, null)
  }

  private displayValue() {
    if (this.value) {
      return `${this.value}˚`
    }

    return '...'
  }

  private displayNextChange() {
    return `until ${this.displayDatetime(this.nextChange, this.timezone)}`
  }

  private displayDatetime(datetime: dayjs.Dayjs, timezone: number): string {

    const datetimeWithZone = datetime.utc().add(timezone / 60, 'minute')
    const hours = datetimeWithZone.hour().toString()
    const minutes = datetimeWithZone.minute().toString().padStart(2, '0')
  
    const time = `${hours}h${minutes}`
  
    let now = dayjs();
    if (datetime.isSame(now, 'day')) {
      return time
    }
  
    let tomorrow = now.add(1, 'day')
    let dayName = ''
  
    if (datetime.isSame(tomorrow, 'day')) {
      dayName = 'tomorrow'
    } else {
      dayName = DayFromNumber[weekday(datetime)]
  
      if (datetime.diff(now, 'day') > 7) {
        dayName += ' ' + datetime.date()
      }
    }
    return `${dayName} at ${time}`
  }

  /**
   * Returns a string to be displayed to the user
   */
  display() {
    let output = ''

    if (this.hold) {
      output += 'Holding '
    }

    output += this.displayValue()

    if (this.nextChange) {
      output += ' ' + this.displayNextChange()
    }

    return output
  }

  /**
   * Avoid the use of `display()` in template strings
   */
  toString() {
    return this.display()
  }
}