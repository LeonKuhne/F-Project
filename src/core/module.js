'use strict';

class Module {
  constructor(options = {id: null, name: null, base: null, code: null, nodes: null}) {
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
      this[key] = val
    }

    // use the name as ID or generate one
    if (!this.id) {
      this.id = this.name || uniqueId()
    }

    // ensure parameters are configured properly
    this.validate()
  }
  apply(node) {
    // apply group template
    if (this.isGroup()) {
      // TODO
      // apply node group as template
      // create all of the child nodes
      
    // apply node template
    } else {
      node.data = this.data()
    }
  }

  data() {
    return {...this, id: null}
  }

  save() {
    localStorage.setItem(this.id, JSON.stringify(this))
  }
  unsave() {
    localStorage.removeItem(this.id)
  }

  validate() {
    let missingType = null
    // validate common
    if (!this.id || !this.name) {
      missingType = 'Default'
    }
    // validate node/group
    if (!this.nodes && (!this.code || !this.base)) {
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

