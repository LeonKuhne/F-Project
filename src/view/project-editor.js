'use strict';

class ProjectEditor {
  constructor(state) {
    this.state = state

    // load ui elements
    this.state.elem = {
      ...this.state.elem,
      importProject: document.getElementById('import-project'),
      exportProject: document.getElementById('export-project'),
      selectFile: document.getElementById('select-file'),
    }

    // setup ui actions
    const elems = this.state.elem
    elems.importProject.innerText = 'import'

    // import file
    elems.selectFile.addEventListener('change', e => {
      const [file] = e.target.files
      ParseJS.loadFunctions(file, options => {
        // determine which base template to use
        options.base = this.state.manager.module.getDefault().base

        // create the module
        const module = new Module(options)

        // load the modules
        this.state.manager.module.loadStatic(module)
      })
    })

    // export file
    // TODO
  }
}
