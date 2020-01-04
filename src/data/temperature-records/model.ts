/**
 * @category Data Model
 * @module data/temperature-records/model
 * @packageDocumentation
 */

interface TemperatureRecordEntity {
  id: number;
  value: number;
  createdOn: string;
  modifiedOn: string;
}

/**
 * Data structure to manipulate temperature records
 */
export class TemperatureRecord {
  id?: number
  value: number
  createdOn: Date
  modifiedOn: Date

  constructor(entity?: TemperatureRecordEntity) {
    this.id = entity ? entity.id : undefined
    this.value = entity ? entity.value : undefined
    this.createdOn = entity ? new Date(entity.createdOn) : new Date()
    this.modifiedOn = entity ? new Date(entity.modifiedOn) : new Date()

  }
}
