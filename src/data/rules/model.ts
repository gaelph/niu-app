import Time from '../../support/time'
import { Day } from '../../support/days'
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

    return new Schedule(Time.from(from), Time.from(to), high)
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
  next_dates: Date[]
  repeat: boolean
  schedules: Schedule[]

  constructor(o) {
    this.id = o.id
    this.name = o.name
    this.active = o.active
    this.days = o.days
    this.next_dates = o.next_dates || []
    this.repeat = o.repeat
    this.schedules = o.schedules
  }

  static default(): Rule {
    return new Rule({
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
      next_dates: [],
      repeat: false,
      schedules: []
    })
  }

  static fromObject(object: Object): Rule {
    let rule = Rule.default()

    for (let prop in object) {
      if (object[prop]) {
        if (["id", "name", "active", "days", "repeat"].includes(prop)) { 
          rule[prop] = object[prop]
        }
        
        if (prop == 'next_dates') {
          rule[prop] = object[prop].map(isoString => new Date(isoString))
        }

        if (prop == "schedules") {
          rule[prop] = object[prop].map(Schedule.fromObject)
        }
      }
    }

    return rule
  }
}
