import {useState, useRef, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'

import { Rule, Schedule } from '../rules/model'
import Time from '../../support/time'
import { weekday } from '../../support/days'

import { CurrentSchedule, TargetTemperature } from './model'

import { useSettings, TIMEZONE_OFFSET, AWAY_TEMPERATURE } from '../settings/hooks'
import { useRules } from '../rules/hooks'
import { useHold } from '../hold/hooks'

function sepearateRepeatAndNonRepeat(rules: Rule[], datetime: dayjs.Dayjs): [Rule[], Rule[]] {
  let repeat: Rule[] = []
  let nonRepeat: Rule[] = []

  let day = weekday(datetime)

  rules
  .filter(rule => rule.active)
  .forEach(rule => {
    if (rule.repeat) {
      if (rule.days[day])
        repeat.push(rule)
    }
    else {
      if (rule.next_dates.some(date => datetime.isSame(dayjs(date), 'day'))) {
        nonRepeat.push(rule)
      }
    }
  })

  return [repeat, nonRepeat]
}

function isCurrentSchedule(schedule: Schedule, datetime: dayjs.Dayjs): boolean {
  let fromInMinutes = schedule.from.toMinutes()
  let toInMinutes = schedule.to.toMinutes()
  let currentTimeInMinutes = Time.fromDayjs(datetime).toMinutes()

  return fromInMinutes <= currentTimeInMinutes && currentTimeInMinutes <= toInMinutes
}

function getNextSevenDays(datetime: dayjs.Dayjs): dayjs.Dayjs[] {
  return Object.keys([...new Array(7)]).map(i => datetime.add(parseInt(i, 10), 'day'))
}

function findSchedule(rules: Rule[], datetime: dayjs.Dayjs): CurrentSchedule {
  let schedules = flatMap<Schedule>(rules.map(rule => {
    let schedules = rule.schedules.filter(schedule => {
      let fromInMinutes = schedule.from.toMinutes()
      let toInMinutes = schedule.to.toMinutes()
      let currentTimeInMinutes = Time.fromDayjs(datetime).toMinutes()

      return fromInMinutes <= currentTimeInMinutes && currentTimeInMinutes <= toInMinutes
      || fromInMinutes >= currentTimeInMinutes
    })
    .sort((a, b) => {
      let aFrom = a.from.toMinutes()
      let bFrom = b.from.toMinutes()

      if (aFrom === bFrom) return 0;
      if (aFrom < bFrom) return -1;
      if (aFrom > bFrom) return 1;
    })

    return schedules
  }))

  if (schedules.length === 0) return null

  if (isCurrentSchedule(schedules[0], datetime)) {
    // A schedule is currently being applied
    let current = schedules[0]
    let nextChange = datetime.set('hour', current.to.hours).set('minute', current.to.minutes)
      
    return {
      current: schedules[0],
      nextChange
    }
  } else {
    let next = schedules[0]
    let nextChange = datetime.set('hour', next.from.hours).set('minute', next.from.minutes)

    return {
      current: null,
      nextChange
    }
  }
  
}

function flatMap<T>(array: Array<any>): Array<T> {
  let out: Array<T> = []

  array.forEach(item => {
    if (!Array.isArray(item)) {
      out.push(item)
    } else {
      out = [
        ...out,
        ...flatMap<T>(item)
      ]
    }
  })

  return out
}

// This function should return
//  - the current target temperature
//  - the next target temperature change
//
// The next temperature change should indicate
//  - the date and time it occurs
export function currentDeviceState(rules: Rule[], timezoneOffset: number): CurrentSchedule {
  const now = dayjs().utcOffset(timezoneOffset / 60);
  const nextSevenDays = getNextSevenDays(now);

  let current: Schedule | null = null;
  let nextChange: dayjs.Dayjs | null = null;

  for (let i in nextSevenDays) {
    let d = parseInt(i, 10);
    let datetime = nextSevenDays[d];

    if (d > 0) {
      datetime = datetime.set('hour', 0).set('minute', 0).set('second', 0).utcOffset(timezoneOffset / 60)
    }
    
    let [repeat, nonRepeat] = sepearateRepeatAndNonRepeat(rules, datetime);
  
    if (nonRepeat.length > 0) {
      let schedule = findSchedule(nonRepeat, datetime)

      if (schedule) return schedule
    }
    else if (repeat.length > 0) {
      let schedule = findSchedule(repeat, datetime)

      if (schedule) return schedule
    }
  }

  return { current, nextChange }
}

