'use strict';

class ModuleList {
  constructor() {
    this.modules = {}
  }
  add(module) {
    console.info(`Loading module ${module}`)
   
    /*
    // callback to UI component
    if (module.isStatic()) {
      // create static
      if (!this.exists(module)) {
        this.on.addStaticTemplate(template, () => this.select(template.id))
      }
    } else {
      // create or update dynamic
      const callback = this.exists(module) 
        ? this.on.updateSavedTemplate
        : this.on.addSavedTemplate
      callback(template, () => this.select(template.id))
    }
    */

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
}
