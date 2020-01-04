/**
 * @category Data Model
 * @module data/rules/model
 * @packageDocumentation
 */
import Time from 'support/time'
import { Day } from 'support/days'
import uuid from 'uuid/v4'

/**
 * Data structure to manipulate schedules.\
 * Schedules are a time range during which the target temperature
 * is not the default `away_temperature`.
 */
export class Schedule {
  /** Time from which the schedule is active */
  from: Time
  /** Time until which the schedule is active */
  to: Time
  /** Target temperature while the schedule is active */
  high: number

  constructor(from: Time, to: Time, high: number) {
    this.from = from
    this.to = to
    this.high = high
  }

  /**
   * Creates a new `Schedule` with default values
   */
  static default() {
    let schedule = new Schedule(Time.fromDate(new Date()), Time.fromDate(new Date()), 20)

    return schedule
  }

  /**
   * Instanciate a `Schedule` from an Object
   */
  static fromObject(object: {from: string, to: string, high?: number}): Schedule {
    let { from, to, high } = object

    return new Schedule(Time.from(from), Time.from(to), high)
  }
}

/**
 * Datastructure to manipulate Rules
 */
export class Rule {
  /** A UUID string */
  id?: string
  /** rule name, null if it a newly created rule */
  name: string
  /** Not active rules are discarded when deciding the target temperature */
  active: boolean
  /** Days in the week the rule is active for. */
  days: {
    [Day.Mon]: boolean,
    [Day.Tue]: boolean,
    [Day.Wed]: boolean,
    [Day.Thu]: boolean,
    [Day.Fri]: boolean,
    [Day.Sat]: boolean,
    [Day.Sun]: boolean,
  }
  /** For non-repeat rules, the next dates the rule will be active for */
  next_dates: Date[]
  /** Should the rule be repeated every week */
  repeat: boolean
  /** Time of day the target temperature is not the `away_temperature` */
  schedules: Schedule[]

  constructor(o: any) {
    this.id = o.id
    this.name = o.name
    this.active = o.active
    this.days = o.days
    this.next_dates = o.next_dates || []
    this.repeat = o.repeat
    this.schedules = o.schedules
  }

  /**
   * Creates a new Rule with default values
   */
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

  /** Instanciate a new `Rule` from an object */
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
