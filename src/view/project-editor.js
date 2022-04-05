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
    // trigger file importing
    // trigger file exporting
    // select a file
    elems.selectFile.addEventListener('change', e => {
      const [file] = e.target.files
      const modules = ParseJS.loadModules(file, module => {
        console.info(`Found module: ${module}`)
      })
    })
  }
}
