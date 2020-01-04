/**
 * @category Containers
 * @module containers/temperature-records
 * @packageDocumentation
 */
import React, { useMemo } from 'react'

import { TemperatureRecord } from 'data/temperature-records/model'
import { BoilerStatus } from 'data/boiler-status/model'

import { useTemperatureRecords } from 'data/temperature-records/hooks'
import { useBoilerStatus } from 'data/boiler-status/hooks'

import { useDimensions } from 'support'

import RecordsChart from 'components/temperature-records/RecordsChart'

/**
 * Keeps only peek records
 */
function minMax(records: TemperatureRecord[]): TemperatureRecord[] {
  let minAndMax: TemperatureRecord[] = []
  let previousAscent = 0;

  for (let i in records) {
    let index: number = parseInt(i, 10)
    let record = records[index]

    if (index === 0 || index === records.length - 1) {
      minAndMax.push(record)
      continue
    }

    let previousRecord = records[index - 1]
    let diff = record.value - previousRecord.value
    let ascent = diff > 0
      ? 1
      : diff < 0
        ? -1
        : 0

    if (ascent != previousAscent ) {
      previousAscent = ascent

      minAndMax.push(previousRecord)
    }
  }

  return minAndMax
}

interface StatusRange {
  records: TemperatureRecord[]
  value: boolean
  from: Date
  to: Date
}

/**
 * Builds a list of ranges in time where the boiler was on or off
 * base on a list of BoilerStatus events
 */
function makeStatusRanges(statuses: BoilerStatus[]): StatusRange[] {
  let result = []
  const statusStack = [...statuses]

  let status = statusStack.pop()
  let nextStatus = statusStack.pop()

  if (status) {
    do {
      while (nextStatus && status.value === nextStatus.value) {
        nextStatus = statusStack.pop()
      }

      let range = {
        value: status.value,
        records: [],
        from: status.createdOn.toDate(),
        to: nextStatus
          ? nextStatus.createdOn.toDate()
          : new Date()
      }

      result.push(range)

      status = nextStatus
      nextStatus = statusStack.pop()
    }
    while (status && statusStack.length >= 0)
}

  return result
}

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR   = 60 * MINUTE

const DEFAULT_RECORDS = []

/**
 * Displays and updates a Chart of the room temperature evolution for the last 8 hours,
 * along with boiler status information
 */
export default function TemperatureChart(): React.ReactElement {
  const Records = useTemperatureRecords()
  const { statuses } = useBoilerStatus()

  const { width } = useDimensions('window')

  // Sort and reduce the number of records before rendering
  const records = useMemo(() => {
    if (Records.records.length === 0) return DEFAULT_RECORDS
    let records = Records.records.sort((a: TemperatureRecord, b: TemperatureRecord) => +a.createdOn - +b.createdOn)
    let latest = records[records.length - 1].createdOn
    let recent = records
    .filter(((r: TemperatureRecord) => +latest - +r.createdOn < 8 * HOUR))

    return minMax(recent)
  }, [Records.records])

  // Time and temperature frame
  const [xBounds, yBounds] = useMemo(() => {
    let values = records.map(r => r.value)
    let dates = records.map(r => r.createdOn)

    let yBounds = {
      max: Math.max(...values) + 0.5,
      min: 5 // Math.min(...values) - 2
    }

    let xBounds = {
      min: +dates[0],
      max: +dates[dates.length - 1]
    }

    return [xBounds, yBounds]
  }, [records])

  const ranges = useMemo(() => {
    return  makeStatusRanges(statuses)
    .filter(r => r.value)
  }, [statuses])

  return <RecordsChart records={records} boilerStatusRanges={ranges} xBounds={xBounds} yBounds={yBounds} width={width} />
}