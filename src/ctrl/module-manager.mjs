import { Module } from '../core/module.mjs'
import { ModuleList } from '../core/module-list.mjs'
import { InspectJS } from '../pars/js/inspect.mjs'

export class ModuleManager {
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
    // remove previous
    const oldModule = this.get(module.id)
    if (oldModule) {
      this.staticModules.remove(oldModule)

    // update UI component
    } else {
      this.on.addStaticModule(module)
    }

    // track module
    this.staticModules.add(module)
    console.debug('Loaded static module', module)
  }
  loadSaved(module) {
    const oldModule = this.savedModules.find(module.name)
    // track module
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
      })

      // add module
      this.loadStatic(module)
    }
  }
  loadSavedModules() {
    // load templates
    Module.updateTemplates(templateIds => {
      templateIds
        .map(id => localStorage.getItem(id))   // fetch objects
        .map(dataStr => JSON.parse(dataStr))   // parse into JSON
        .map(json => new Module(json))         // parse into Modules
        .sort((a, b) => a.name > b.name)       // sort by name
        .forEach(module => this.loadSaved(module)) // update state
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

  checkRefactor(module) {
    if (!module.code) return

    // find references
    const existingModules = this.state.manager.module.getAllNames()
    const chunksWithRefs = (new ParseJSModuleToChunks(module.code, existingModules)).run()

    // parse references
    if (chunksWithRefs.length > 1) {
      // refactor the module by its references
      return this.refactorModule(module, chunksWithRefs)
    }
  }

  refactorModule(module, chunksWithRefs) {
    const nm = this.state.nodel.manager
    const name = module.name

    // convert code chunks to runnable code blocks
    const blocksWithRefs = ParseUtil.upgradeChunksToBlocks(
      chunksWithRefs, InspectJS.getReturn(module.code)
    )

    // create/find module names for blocks and refs
    let moduleNames = (new ParseJSBlocksWithReferencesToModules(
      name, blocksWithRefs, (moduleOptions) => {
        const newModule = new Module({
          base: module.base,
          ...moduleOptions,
        })
        this.loadStatic(newModule)
        return newModule.id
      }
    )).run()

    // find the modules created from the code blocks
    // NOTE: assumes that the new modules start with the old module name
    const newModules = moduleNames.filter(moduleName => moduleName.startsWith(name))

    // create a param module and track it as a reference
    const paramModuleId = this.createParamModule(module)
    const allButParamModule = [...moduleNames]
    moduleNames.unshift(paramModuleId)

    // find modules
    const modules = moduleNames.map(name => this.get(name))

    // connect the param module to all of the other references
    const map = ParseUtil.modulesToMap(name, modules, {
      [paramModuleId]: allButParamModule,
    })

    // stitch modules together to form group
    const groupModule = new Module({
      name: name,
      nodes: map,
    })

    // update the modules
    groupModule.code = null
    this.loadStatic(groupModule)

    return groupModule
  }

  createParamModule(groupModule) {
    const groupParams = groupModule.params

    // create param module
    const code = ParseUtil.mapParamsCode({
      ...groupParams, 
      // remove prepended class parameters; function-parser/parseConstructor
      required: groupParams.required.splice(2),
    })

    // create a head module that collects params
    const module = new Module({
      name: `${groupModule.name} params`,
      base: groupModule.base,
      code: code,
    })  

    this.loadStatic(module)

    return module.id
  }
}
