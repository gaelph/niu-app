import { 
  GetLatestResponse,
  ListResponse,
  CursoredList,
  ListCursor,
  Rule,
  Day
} from './types';

import Routes from './routes'

import { TemperatureRecord } from './models/temperature-record'


async function handleResponse<T>(response: Response): Promise<T> {
  switch (response.status) {
    case 404:
      console.error('404')
      throw new Error("None found")

    case 200:
      return await response.json()

    default:
      let text = await response.text()
      console.error(text)
      throw new Error(`Error ${response.status}: ${text}`)
  }
}

export async function getLatest(): Promise<TemperatureRecord> {
  let response = await fetch(Routes.Latest(), {
    headers: {
      //@ts-ignore
      Authorization: "Bearer " + process.env.API_KEY
    }
  })

  const result: GetLatestResponse = await handleResponse(response)

  if (result.success) {
    return new TemperatureRecord(result.data)
  } else {
    console.error(result.error)
    throw new Error(result.error)
  }
}


const DEFAULT_CURSOR: ListCursor = {
  page: 1,
  pageSize: 50
}

export async function getList(cursor: ListCursor = DEFAULT_CURSOR): Promise<CursoredList<TemperatureRecord>> {
  let response = await fetch(Routes.List(cursor),
  {
    headers: {
      //@ts-ignore
      Authorization: "Bearer " + process.env.API_KEY
    }
  })

  const result: ListResponse = await handleResponse(response)

  if (result.success) {
    return {
      items: result.data.map(d => new TemperatureRecord(d)),
      cursor : {
        ...cursor,
        page: cursor.page + 1
      }
    }
  } else {
    console.error(result.error)
    throw new Error(result.error)
  }
}

export async function getRules(cursor: ListCursor = DEFAULT_CURSOR): Promise<CursoredList<Rule>> {
  return {
    items: [
      {
        id: '0',
        name: 'Weekdays',
        active: true,
        days: {
          [Day.Mon]: true,
          [Day.Tue]: true,
          [Day.Wed]: true,
          [Day.Thu]: true,
          [Day.Fri]: true,
          [Day.Sat]: false,
          [Day.Sun]: false,
        },
        schedules: [
          { from: '6:15', to: '8:00' },
          { from: '18:15', to: '22:30' },
        ],
      },
      {
        id: '1',
        name: 'Weekends',
        active: true,
        days: {
          [Day.Mon]: false,
          [Day.Tue]: false,
          [Day.Wed]: false,
          [Day.Thu]: false,
          [Day.Fri]: false,
          [Day.Sat]: true,
          [Day.Sun]: true,
        },
        schedules: [
          { from: '8:05', to: '22:00' },
        ],
      },
      {
        id: '2',
        name: 'All day',
        active: false,
        days: {
          [Day.Mon]: false,
          [Day.Tue]: false,
          [Day.Wed]: false,
          [Day.Thu]: false,
          [Day.Fri]: false,
          [Day.Sat]: true,
          [Day.Sun]: true,
        },
        schedules: [
          { from: '0:00', to: '23:59' },
        ],
      }
      ,
      {
        id: '3',
        name: 'Saturday Night Fever',
        active: false,
        days: {
          [Day.Mon]: false,
          [Day.Tue]: false,
          [Day.Wed]: false,
          [Day.Thu]: false,
          [Day.Fri]: false,
          [Day.Sat]: true,
          [Day.Sun]: true,
        },
        schedules: [
          { from: '0:10', to: '1:33' },
          { from: '22:30', to: '23:59' },
        ],
      }
    ],
    cursor
  }
}