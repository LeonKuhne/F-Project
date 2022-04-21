'use strict';

class ModuleManager {
  constructor(state, callbacks = {
    addStaticModule: (template, setSelected) => {},
    addSavedModule: (template, setSelected) => {},
    updateSavedModule: (template, setSelected) => {},
  }) {
    this.state = state
    this.on = callbacks

    this.staticModules = new ModuleList()
    this.savedModules = new ModuleList()

    // load all
    this.defaultModule = null
    this.loadHTMLModules()
    this.loadSavedModules() 
  }

  // GETTERS
  // 

  getDefault() {
    return this.staticModules.find(this.defaultModule) || this.staticModules.first()
  }
  get(id) {
    return this.savedModules.find(id) || this.staticModules.find(id)
  }
  getAllNames() {
    return this.staticModules.ids().concat(this.savedModules.ids())
  }

  // LOAD MODULES
  //

  loadStatic(module) {
    // track modules
    this.staticModules.add(module)
    // update UI component
    this.on.addStaticModule(module)
    console.debug('Loaded static module', module)
  }
  loadSaved(module) {
    const oldModule = this.savedModules.find(module.name)
    // track modules
    this.savedModules.add(module)

    // update UI component
    if (oldModule) {
      this.on.updateSavedModule(oldModule, module)
    } else {
      this.on.addSavedModule(module)
    }
    console.debug('Loaded saved module', module)
  }
  loadHTMLModules() {
    // get sorted static template names
    const templateNames = this.state.nodel.render.templates.sort()

    // loop through HTML templates
    for (const name of templateNames) {
      const elem = document.getElementById(name)
      const code = elem.getAttribute('code') || ''

      // save default
      if (elem.getAttribute('select') !== null) {
        this.defaultModule = name
        console.log('setting default attribute to', name)
      }

      // create module
      const module = new Module({
        name: name,
        base: name,
        code: code,
        params: ParseJS.parseParams(code),
      })

      // add module
      this.loadStatic(module)
    }
  }
  loadSavedModules() {
    // load templates
    let templates = Object.values(localStorage)
    // uncompress templates
    templates = templates.map(dataStr => JSON.parse(dataStr))
    // parse into Modules 
    let modules = templates.map(json => new Module(json))
    // sort by name
    modules = modules.sort((a, b) => a.name > b.name)
    // update state
    modules.map(module => this.loadSaved(module))
  }
  save(node) {
    if (node.group.collapsed) {
      this.saveGroup(node)
    } else {
      this.saveNode(node)
    }
  }
  saveGroup(node) {
    // save node and its children
    this.saveNode(node)
    this.state.nodel.manager.eachChild(node, (child, connectionType) => {
      this.saveNode(child)
    })

    // update/insert module options
    this.upsertModule({
      name: node.group.name,
      // construct a traversal map
      nodes: this.state.nodel.manager.createGroupMap(node, null, node.x, node.y),
    })
  }
  saveNode(node) {
    this.upsertModule(node.data)
  }

  deleteSaved(module) {
    this.savedModules.remove(module)
  }

  upsertModule(options) {
    // find module
    let module = this.savedModules.find(options.id || options.name)

    if (module) {
      // update
      console.warn(`Removing existing module to replace: ${module}`)
      module.update(options)
      this.on.updateSavedModule(null, module)
    } else {
      // create and track
      console.info(`Creating a new module from node: ${module}`)
      module = new Module(options)
      this.savedModules.add(module)
      this.on.addSavedModule(module)
    }

    // save the module
    module.save()
  }
}
