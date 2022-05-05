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
      // TODO make this elem a template
      downloadFile: document.getElementById('download-file'),
    }
    const elems = this.state.elem

    // setup ui actions

    // import file
    elems.selectFile.addEventListener('change', e => {
      const file = e.target.files[0]
      this.importFromFile(file)
    })

    // export file
    elems.exportProject.addEventListener('click', e => {
      this.exportToFile()
    })
  }

  exportToFile() {
    const nm = this.state.nodel.manager

    // verify project exists
    if (nm.isEmpty()) {
      alert("Nothing to export, the project is empty.")
      return
    }

    // capture project state as text
    const projectData = JSON.stringify(nm.nodes)
    
    // name file
    let projectName = 'project'
    const heads = this.state.nodel.manager.getHeads()
    if (heads.length) {
      const head = heads[0]
      projectName = head.group.name ?? head.data.name ?? head.id
    }

    // prompt download
    const elem = this.state.elem.downloadFile
    const metadata = 'data:text/plain;charset=utf-8'
    elem.setAttribute('href', `${metadata},${encodeURIComponent(projectData)}`);
    elem.setAttribute('download', `${projectName}.f`)
    elem.click()
  }

  importFromFile(file) {
    ParseUtil.readFile(file, (projectData) => {
      const nodes = JSON.parse(projectData)
      this.state.nodel.manager.load(Object.values(nodes))
    })
  }

  // NOTE: progress temporarilly halted on this feature
  /* TODO
  loadModulesFromFile(file) {
    ParseJS.loadFunctions(file, options => {
      // determine which base template to use
      options.base = this.state.manager.module.getDefault().base
      // create the module
      const module = new Module(options)
      // load the modules
      this.state.manager.module.loadStatic(module)
    })
  }
  */
}
