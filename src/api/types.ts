import Time from '../support/time'
import uuid from 'uuid/v4'

export interface TemperatureRecordEntity {
  id: number;
  value: number;
  createdOn: string;
  modifiedOn: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ListResponse<T> = ApiResponse<T[]>;

export interface CursoredList<T> {
  items: T[];
  cursor: ListCursor
}

export class ListCursor {
  page: number
  pageSize: number

  constructor(page = 1, pageSize = 100) {
    this.page = page,
    this.pageSize = pageSize
  }

  static DEFAULT = new ListCursor(1, 100)

  next(): ListCursor {
    return new ListCursor(this.page + 1, this.pageSize)
  }
}

export enum Day {
  Mon,
  Tue,
  Wed,
  Thu,
  Fri,
  Sat,
  Sun,
}

export const DayShortNames = {
  [Day.Mon]: "Mon",
  [Day.Tue]: "Tue",
  [Day.Wed]: "Wed",
  [Day.Thu]: "Thu",
  [Day.Fri]: "Fri",
  [Day.Sat]: "Sat",
  [Day.Sun]: "Sun",
}

export const DayFromNumber = {
  0: DayShortNames[Day.Mon],
  1: DayShortNames[Day.Tue],
  2: DayShortNames[Day.Wed],
  3: DayShortNames[Day.Thu],
  4: DayShortNames[Day.Fri],
  5: DayShortNames[Day.Sat],
  6: DayShortNames[Day.Sun],
}

export const dayToInt = {
  "mon": 0,
  "tue": 1,
  "wed": 2,
  "thu": 3,
  "fri": 4,
  "sat": 5,
  "sun": 6,
  "Mon": 0,
  "Tue": 1,
  "Wed": 2,
  "Thu": 3,
  "Fri": 4,
  "Sat": 5,
  "Sun": 6,

}

export const sortDays = (a, b) => dayToInt[a] - dayToInt[b]

export type RuleEntity = {
  id?: string,
  name: string,
  active: boolean,
  repeat: boolean,
  days: {
    [Day.Mon]: boolean,
    [Day.Tue]: boolean,
    [Day.Wed]: boolean,
    [Day.Thu]: boolean,
    [Day.Fri]: boolean,
    [Day.Sat]: boolean,
    [Day.Sun]: boolean,
  }
  schedules: { from: string, to: string, high: number }[]
}
