import { uniqueId } from './helper.mjs'
import { InspectJS } from '../pars/js/inspect.mjs'

export class Module {
  constructor(options = {
    id: null, name: null, base: null,
    code: null, nodes: null,
  }) {
    // update parameters
    this.update(options)
  }
  isGroup() {
    return !!this.nodes
  }
  isStatic() {
    return this.name === this.base
  }

  update(options) {
    // load all params
    for (const [key, val] of Object.entries(options)) {
      if (key !== 'params') {
        this[key] = val
      }
    }

    // use the name as ID or generate one
    if (!this.id) {
      this.id = this.name || uniqueId()
    }

    // ensure parameters are configured properly
    this.validate()
  }

  // use the code to generate the parameters
  get params() {
    return this.code ? InspectJS.parseParams(this.code) : undefined
  }

  data() {
    const module = this
    return {
      ...this,
      id: null,
      get params() {
        return this.code ? InspectJS.parseParams(this.code) : undefined
      }
    }
  }

  save() {
    localStorage.setItem(this.id, JSON.stringify(this))
    Module.updateTemplates(templateIds => {
      if (templateIds.includes(this.id)) return
      return [...templateIds, this.id]
    })
  }
  unsave() {
    localStorage.removeItem(this.id)
    Module.updateTemplates(templateIds => {
      const index = templateIds.indexOf(this.id)
      if (index === -1) return
      templateIds.splice(index, 1)
      return templateIds
    })
  }

  static updateTemplates(callback) {
    let templateIds = JSON.parse(localStorage.getItem('templates')) || []
    templateIds = callback(templateIds)
    if (templateIds === undefined) return
    localStorage.setItem('templates', JSON.stringify(templateIds))
  }

  validate() {
    let missingType = null
    // validate common
    if (!this.id || !this.name) {
      missingType = 'Default'
    }
    // validate node/group
    if (!this.nodes && (this.code === null || !this.base || !this.params)) {
      missingType = 'Specific'
    }
    // throw
    if (missingType) {
      throw `${missingType} params are missing from template ${JSON.stringify(this.data())}`
    }
  }

  toString() {
    return `${this.name} (${this.id})`
  }
}

