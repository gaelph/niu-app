



export default class Time {
  hours: number;
  minutes: number;

  constructor(hours: number | string, minutes: number | string) {

    this.hours = parseInt(hours.toString(), 10)
    this.minutes = parseInt(minutes.toString(), 10)
  }

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


  toString() {
    return `${this.hours}:${this.minutes.toString().padStart(2, '0')}`
  }

  toMinutes() {
    return this.hours * 60 + this.minutes
  }

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