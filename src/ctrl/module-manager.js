'use strict';

/* TODO: remove or use
function incrementVersion(val) {
  const versionArr = val.match(/ v[0-9]$/) // ex: null or [' v2']
  if (!versionArr) {
    // first duplicate
    val += ' v2'
  } else {
    // consecutive duplicates
    const versionStr = versionArr[0] // ex: ' v2'
    const version = versionStr.split('v')[1]
    val = val.replace(versionArr[0], ` v${Number(version)+1}`)
  }
  return val
}
*/

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
    this.loadStatic()
    this.loadSaved() 
  }

  /* TODO remove or use
  uniqueName(name) {
    const duplicate = this.getTemplateByName(name)
    return duplicate ? this.uniqueName(incrementVersion(name)) : name
  }
  */

  getDefault() {
    return this.staticModules.first()
  }

  get(id) {
    return this.savedModules.find(id) || this.staticModules.find(id)
  }

  loadStatic() {
    // get sorted static template names
    const templateNames = this.state.nodel.render.templates.sort()

    // loop through HTML templates
    for (const name of templateNames) {
      const module = new Module({
        name: name,
        base: name,
        code: 'x => x',
        params: ['x'],
      })

      // load module
      this.staticModules.add(module)

      // update UI component
      this.on.addStaticModule(module)
    }
  }
  loadSaved() {
    // load templates
    let templates = Object.values(localStorage)
    // uncompress templates
    templates = templates.map(dataStr => JSON.parse(dataStr))
    // parse into Modules 
    let modules = templates.map(json => new Module(json))
    // sort by name
    modules = modules.sort((a, b) => a.name > b.name)
    // update state
    modules.map(module => {
      const oldModule = this.savedModules.find(module.name)
      // track modules
      this.savedModules.add(module)
      // update UI component
      if (oldModule) {
        this.on.updateSavedModule(oldModule, module)
      } else {
        this.on.addSavedModule(module)
      }
    })
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
