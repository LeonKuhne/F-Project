'use strict';

var nr, nm, nl
var state

function main() {
  // create hideables
  setupHideables()

  nr = new NodelRender()
  nm = new NodelManager(nr)
  nl = new NodelListener(nm)

  // aggregate state
  state = {
    selected: {
      template: {name: 'basic', code: 'x => x', template: 'basic'},
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
    editor: {},
    manager: {},
  }

  // load ui elements
  state.editor.module = new ModuleEditor(state)
  state.editor.node = new NodeEditor(state)
}

window.onload = main
