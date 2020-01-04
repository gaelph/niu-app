/**
 * @category Data Model
 * @module data/settings/model
 * @packageDocumentation
 */

/**
 * A Data strucuture to manipulate `Setting`s
 */
export class Setting {
  id: string
  title: string
  description: string
  value: any

  constructor(id: string, title: string, description: string, value: any) {
    this.id = id
    this.title = title
    this.description = description
    this.value = value
  }

  /**
   * Instanciate a new `Setting` from an object
   */
  static fromObject({id, title, description, value }: { id: string, title: string, description: string, value: any }) {
    return new Setting(id, title, description, value)
  }
}