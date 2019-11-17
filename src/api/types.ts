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

export type GetLatestResponse = ApiResponse<TemperatureRecordEntity>;
export type ListResponse = ApiResponse<TemperatureRecordEntity[]>;

export interface CursoredList<T> {
  items: T[];
  cursor: ListCursor
}

export interface ListCursor {
  page: number,
  pageSize: number
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

export interface Rule {
  id: string,
  name: string,
  active: boolean
  days: {
    [Day.Mon]: boolean,
    [Day.Tue]: boolean,
    [Day.Wed]: boolean,
    [Day.Thu]: boolean,
    [Day.Fri]: boolean,
    [Day.Sat]: boolean,
    [Day.Sun]: boolean,
  },
  schedules: { from: string, to: string }[]
}