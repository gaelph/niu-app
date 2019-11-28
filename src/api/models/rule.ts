import Time from '../../support/time'
import { Day } from '../types'
import uuid from 'uuid/v4'

export class Schedule {
  from: Time
  to: Time
  high: number

  constructor(from: Time, to: Time, high: number) {
    this.from = from
    this.to = to
    this.high = high
  }

  static default() {
    let schedule = new Schedule(Time.fromDate(new Date()), Time.fromDate(new Date()), 20)

    return schedule
  }

  static fromObject(object: {from: string, to: string, high?: number}): Schedule {
    let { from, to, high } = object
    return {
      from: Time.from(from),
      to: Time.from(to),
      high: high || 20
    }
  }
}


export class Rule {
  id?: string
  name: string
  active: boolean
  days: {
    [Day.Mon]: boolean,
    [Day.Tue]: boolean,
    [Day.Wed]: boolean,
    [Day.Thu]: boolean,
    [Day.Fri]: boolean,
    [Day.Sat]: boolean,
    [Day.Sun]: boolean,
  }
  repeat: boolean
  schedules: Schedule[]

  constructor() {}

  static default() {
    return {
      id: uuid(),
      name: undefined,
      active: false,
      days: {
        [Day.Mon]: false,
        [Day.Tue]: false,
        [Day.Wed]: false,
        [Day.Thu]: false,
        [Day.Fri]: false,
        [Day.Sat]: false,
        [Day.Sun]: false,
      },
      repeat: false,
      schedules: []
    }
  }

  static fromObject(object: Object): Rule{
    let rule = Rule.default()

    for (let prop in object) {
      if (object[prop]) {
        if (["id", "name", "active", "days", "repeat"].includes(prop)) { 
          rule[prop] = object[prop]
        }

        if (prop == "schedules") {
          rule[prop] = object[prop].map(Schedule.fromObject)
        }
      }
    }

    return rule
  }
}
