import { 
  ApiResponse,
  ListResponse,
  CursoredList,
  ListCursor,
  TemperatureRecordEntity,
  RuleEntity
} from './types';

import { TemperatureRecord } from './models/temperature-record'
import { Rule } from './models/rule'


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

type Queries = {
  [K in keyof typeof REMOTE_FUNCTIONS]: <T>(...args: any[]) => Promise<{success: boolean, error?: string, data?: T}>
}

let REMOTE_FUNCTIONS = {
  "getLatestTemperatureRecord": 1,
  "listTemperatureRecords": 1,
  "createTemperatureRecord": 1,

  "createRule": 1,
  "listRules": 1,
  "updateRule": 1,
  "deleteRule": 1
}

function buildQueries(): Queries {
  return Object.entries(REMOTE_FUNCTIONS).reduce((acc, [func, arity]) => {

    acc[func] = async (...args) => {
      if (args.length !== arity) {
        throw new Error(`Bad Arity: ${func} expects ${arity} arguments, bute ${args.length} were given`)
      }

      const request = {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${process.env.API_KEY}`
        },
        body: JSON.stringify({
          [func]: arity === 0
          ? []
          : arity === 1
            ? args[0]
            : args
        })
      }

      console.log(`${request.method}\t${process.env.API_URL}\t${request.body}`)

      let response = await fetch(process.env.API_URL, request)

      return handleResponse(response)
    }

    return acc
  }, {} as Queries)
}

const queries = buildQueries()

export async function getLatest(): Promise<TemperatureRecord> {
  let result: ApiResponse<TemperatureRecordEntity> = await queries.getLatestTemperatureRecord()


  if (result.success) {
    return new TemperatureRecord(result.data)
  } else {
    console.error(result.error)
    throw new Error(result.error)
  }
}


export async function getList(cursor: ListCursor = ListCursor.DEFAULT): Promise<CursoredList<TemperatureRecord>> {
  const result: ListResponse<TemperatureRecordEntity> = await queries.listTemperatureRecords(cursor)

  if (result.success) {
    return {
      items: result.data.map(d => new TemperatureRecord(d)),
      cursor : cursor.next()
    }
  } else {
    console.error(result.error)
    throw new Error(result.error)
  }
}

export async function getRules(cursor: ListCursor = ListCursor.DEFAULT): Promise<CursoredList<Rule>> {
  const result: ListResponse<RuleEntity> = await queries.listRules(cursor)

  if (result.success) {
    return {
      items: result.data.map(d => Rule.fromObject(d)),
      cursor: cursor.next()
    }
  } else {
    console.error(result.error)
    throw new Error(result.error)
  }
}

export async function createRule(rule: Rule): Promise<Rule> {
  const result: ApiResponse<RuleEntity> = await queries.createRule(rule)

  if (result.success) {
    return Rule.fromObject(result.data)
  } else {
    console.error(result.error)
    throw new Error(result.error)
  }
}

export async function updateRule(rule: Partial<Rule>): Promise<Rule> {
  const result: ApiResponse<RuleEntity> = await queries.updateRule(rule)
    
  if (result.success) {
    return Rule.fromObject(result.data)
  } else {
    console.error(result.error)
    throw new Error(result.error)
  }
}

export async function deleteRule(rule: Rule): Promise<void> {
  const result: ApiResponse<undefined> = await queries.deleteRule({ id: rule.id })

  if (!result.success) {
    console.error(result.error)
    throw new Error(result.error)
  }
}

// import { AsyncStorage } from 'react-native'
// export async function getRules(cursor: ListCursor = DEFAULT_CURSOR): Promise<CursoredList<Rule>> {
//   let AllKeys = await AsyncStorage.getAllKeys()

//   let RulesKeys = AllKeys.filter(key => key.startsWith("Rule_"))
//   console.log('found keys', RulesKeys)

//   let SavedRules = await AsyncStorage.multiGet(RulesKeys)

//   if (SavedRules.length > 0) {
//     console.log('returning saved rules')
//     return {
//       items: SavedRules.map(([_, s]) => Rule.fromObject(s)),
//       cursor
//     }
//   }
//   return {
//     items: [
//       Rule.fromObject({
//         name: 'Weekdays',
//         active: true,
//         days: {
//           [Day.Mon]: true,
//           [Day.Tue]: true,
//           [Day.Wed]: true,
//           [Day.Thu]: true,
//           [Day.Fri]: true,
//           [Day.Sat]: false,
//           [Day.Sun]: false,
//         },
//         repeat: true,
//         schedules: [
//           { from: '6:15', to: '8:00', high: 20 },
//           { from: '18:15', to: '22:30', high: 20 },
//         ],
//       }),
//       Rule.fromObject({
//         name: 'Weekends',
//         active: true,
//         days: {
//           [Day.Mon]: false,
//           [Day.Tue]: false,
//           [Day.Wed]: false,
//           [Day.Thu]: false,
//           [Day.Fri]: false,
//           [Day.Sat]: true,
//           [Day.Sun]: true,
//         },
//         repeat: true,
//         schedules: [
//           { from: '8:05', to: '22:00', high: 20 },
//         ],
//       }),
//       Rule.fromObject({
//         name: 'All day',
//         active: false,
//         days: {
//           [Day.Mon]: false,
//           [Day.Tue]: false,
//           [Day.Wed]: false,
//           [Day.Thu]: false,
//           [Day.Fri]: false,
//           [Day.Sat]: true,
//           [Day.Sun]: true,
//         },
//         repeat: false,
//         schedules: [
//           { from: '0:00', to: '23:59', high: 20 },
//         ],
//       }),
//       Rule.fromObject({
//         name: 'Saturday Night Fever',
//         active: false,
//         days: {
//           [Day.Mon]: false,
//           [Day.Tue]: false,
//           [Day.Wed]: false,
//           [Day.Thu]: false,
//           [Day.Fri]: false,
//           [Day.Sat]: true,
//           [Day.Sun]: true,
//         },
//         repeat: false,
//         schedules: [
//           { from: '0:10', to: '1:33', high: 20 },
//           { from: '22:30', to: '23:59', high: 2 },
//         ],
//       })
//     ],
//     cursor
//   }
// }