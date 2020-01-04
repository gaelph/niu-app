/**
 * # Time
 * @category Support
 * @module time
 * @packageDocumentation
 */
import dayjs from 'dayjs'

/**
 * A Data structure to help manipulate Naive times.
 * 
 * `Time` objects can be used directly in template strings.\
 * **Example**\
 * ```ts
 * const time = new Time(4, 48)
 * 
 * console.log(time)
 * // 4:48
 * ```
 * 
 * They can also be used as is for algebra (addition, substraction, comparison, ...),
 * as they convert automatically to minutes since midnight.\
 * **Example**
 * ```ts
 * const a = new Time(0, 30)
 * const b = new Time(1, 0)
 * 
 * console.log(+a + +b)
 * // 90
 */
export default class Time {
  hours: number;
  minutes: number;

  constructor(hours: number | string, minutes: number | string) {
    this.hours = parseInt(hours.toString(), 10)
    this.minutes = parseInt(minutes.toString(), 10)
  }

  /**
   * Attempts to create a Time instance from anything
   * @throws if it fails
   */
  static from(something: string | { hours: number | string; minutes: number | string } | Date): Time {
    if (typeof something === 'string') {
      return Time.fromString(something as string)
    }

    if (something instanceof Date) {
      return Time.fromDate(something as Date)
    }

    if (
      typeof something === 'object' 
      && Object.prototype.hasOwnProperty.call(something, 'hours')
      && Object.prototype.hasOwnProperty.call(something, 'minutes')
    ) {
      return Time.fromObject(something as { hours: number; minutes: number })
    }

    throw new Error('Invalid input type for Time')
  }

  static fromObject({ hours, minutes }): Time {
    return new Time(hours, minutes)
  }

  static fromString(time: string): Time {
    let [hours, minutes] = time.split(":")
    return new Time(hours, minutes)
  }

  static fromDate(date: Date): Time {
    let h = date.getHours();
    let mm = date.getMinutes();

    return new Time(h, mm)
  }

  static fromDayjs(datetime: dayjs.Dayjs): Time {
    let h = datetime.hour();
    let m = datetime.minute();

    return new Time(h, m)
  }

  /**
   * Returns a displayable string like `4:56`
   */
  toString(): string {
    return `${this.hours}:${this.minutes.toString().padStart(2, '0')}`
  }

  /**
   * Converts `Time` to minutes (elapsed minutes from midnight)
   */
  toMinutes() {
    return this.hours * 60 + this.minutes
  }

  /**
   * Converts `Time` to minutes or to a displayable string
   * depending on context.\
   * So `Time` objects can be used in template string,
   * or used for mathematical operations.
   */
  [Symbol.toPrimitive](hint: "string" | "number" | "default") {
    switch (hint) {
      case "string":
        return this.toString()

      case "number":
      case "default":
        return this.toMinutes()
    }
  }
}