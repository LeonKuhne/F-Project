'use strict';

var nr, nm, nl
var state

function main() {
  // create hideables
  setupHideables()

  nr = new NodelRender()
  nm = new NodelManager(nr)
  nl = new NodelListener(nm, nr)

  // aggregate state
  state = {
    selected: {
      template: {name: 'basic', code: '() => null', template: 'basic'},
      node: null,
    },
    nodel: {
      render: nr,
      manager: nm,
      listener: nl,
    },

    // html elements by custom key
    elem: {
      nodel: document.getElementById('nodel'),
    },

    // views and controllers by custom key
    view: {},
    editor: {},
    manager: {},
    util: {},
  }

  // load ui elements
  state.editor.project = new ProjectEditor(state)
  state.editor.module = new ModuleEditor(state)
  state.editor.node = new NodeEditor(state)
  state.view.node = new NodeView(state)
}

window.onload = main
