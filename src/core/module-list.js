'use strict';

class ModuleList {
  constructor() {
    this.modules = {}
  }
  add(module) {
    console.info(`Loading module ${module}`)
   
    // update/replace
    this.modules[module.id] = module
  }
  remove(module) {
    delete this.modules[module.id]
    module.unsave()
  }
  find(id) {
    return this.modules[id]
  }
  first() {
    const sortedModules = Object.values(this.modules).sort((a, b) => a.name > b.name)
    return sortedModules.length ? sortedModules[0] : null
  }
  ids() {
    return Object.keys(this.modules)
  }
}
