'use strict';

class ModuleEditor {
  constructor(state) {
    this.state = state

    // load ui elements
    this.state.elem = {
      ...this.state.elem,
      staticModule: document.getElementById('static-module'),
      savedModule: document.getElementById('saved-module'),
      staticModules: document.getElementById('static-modules'),
      savedModules: document.getElementById('saved-modules'),
    }

    // create dependencies
    this.state.manager.module = new ModuleManager(this.state, {
      // support callbacks
      addStaticModule: (module) => {
        this.addModuleElement(this.state.elem.staticModules, module, false)
      },
      addSavedModule: (module) => {
        this.addModuleElement(this.state.elem.savedModules, module)
      },
      updateSavedModule: (oldModule, newModule) => {
        this.updateModuleElement(this.state.elem.savedModules, oldModule, newModule)
      },
    })

    // hide the clone bases
    Template.hideTemplates()

    // select the default module to start
    this.selectModule(this.state.manager.module.getDefault())
  }

  elemId(module) {
    if (!module) {
      return null
    }
    // TODO properly sanitize this to prevent XSS
    let id = module.id
    id = id.replaceAll(' ', '_')
    id = id.toLowerCase()
    id = `t-${id}`
    return id
  }

  getElem(module) {
    return document.getElementById(this.elemId(module))
  }

  selectModule(module) {
    let nodeEditor = this.state.editor.node
    let prevSelected = this.state.selected.module
    let selectedNode = this.state.selected.node

    // deselect previous
    if (prevSelected) {
      this.getElem(prevSelected).classList.remove('selected')
      console.info(`Deselecting module ${prevSelected}`)
    }
    // highlight new selection
    this.getElem(module).classList.add('selected')
    console.info(`Selecting module ${module}`)

    // select the module
    this.state.selected.module = module

    // apply module to node
    if (selectedNode) {
      // update the editor
      module.apply(selectedNode)
      nodeEditor.selectNode(selectedNode)
    }
  }

  deleteModule(module) {
    const moduleManager = this.state.manager.module
    moduleManager.deleteSaved(module)
    this.deleteModuleElement(module)

    // select the default module 
    if (module === this.state.selected.module) {
      this.state.selected.module = moduleManager.getDefault()
    }
  }

  addModuleElement(parentElem, module, deletable=true) {
    console.info('Adding module to UI', module)

    // clone the module 
    const elems = this.state.elem
    const baseClone = deletable ? elems.savedModule: elems.staticModule
    const elem = baseClone.cloneNode(true)
    
    // apply the module as a template and configure callbacks
    const callbacks = Template.apply(this.elemId(module), elem, module)
    callbacks.selectModule = () => this.selectModule(module)
    if (deletable) {
      callbacks.deleteModule = () => this.deleteModule(module)
    }

    // add the element
    // TODO insert alphabetically
    parentElem.appendChild(elem)
  }

  updateModuleElement(parentElem, oldModule, newModule) {
    console.info('Updating module in UI', newModule)

    // get the elem and generate new callbacks
    const elem = this.getElem(oldModule)

    if (elem) {
      // re-apply the template and configure callbacks
      const callbacks = Template.apply(this.elemId(newModule), elem, newModule)
      callbacks.selectModule = () => this.selectModule(newModule)
      callbacks.deleteModule = () => this.deleteModule(newModule)

      // TODO re-insert alphabetically
    } else {
      console.warn(`Elem doesn't exist for previous module: ${oldModule}`)
    }
  }

  deleteModuleElement(module) {
    this.getElem(module).remove()
  }
}
