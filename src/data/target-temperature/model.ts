import dayjs from 'dayjs'

import { Schedule } from '../rules/model'
import { Hold } from '../hold/model'

import { DayFromNumber, weekday } from '../../support/days'

export interface CurrentSchedule {
  current?: Schedule | null
  nextChange?: dayjs.Dayjs
}

export class TargetTemperature {
  value: number
  timezone: number
  hold: string | boolean
  schedule: boolean
  nextChange: dayjs.Dayjs | null

  constructor(value: number, timezone: number, hold: string | boolean, schedule: boolean, nextChange?: dayjs.Dayjs) {
    this.value = value
    this.timezone = timezone
    this.hold = hold
    this.schedule = schedule
    this.nextChange = nextChange || null
  }

  static fromHold(hold: Hold, timezone: number) {
    return new TargetTemperature(hold.value, timezone, hold.id, false, hold.untilTime)
  }

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
}