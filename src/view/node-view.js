'use strict';

class NodeView {
  constructor(state) {
    this.state = state
    const nodelElem = this.state.elem.nodel

    // class state
    let dragging = false
    this.listeners = []

    //
    // ACTIONS

    // collapse the node group
    const nl = this.state.nodel.listener
    const nm = this.state.nodel.manager
    // create node/group from selected module
    nl.on('dblclick', e => {
      const module = this.state.selected.module
      if (!module) {
        console.error(`No module is selected`)
        return
      } 

      this.state.manager.node.createNode(module, e.x, e.y)
    })

    // start dragging
    nl.on('mousedown', e => {
      if (e.node) {
        dragging = e
      }

      // update name field when clicked off input
      // TODO awk; pls fix
      this.state.editor.node.resetEditName()
    })

    // support dragging
    const isDraggedOnDifferent = node => {
      return dragging && node && dragging.node.id !== node?.id
    }

    // indicate dragging using cursor
    nl.on('mousemove', e => {
      if (dragging) {
        if (isDraggedOnDifferent(e.node)) {
          nodelElem.style.cursor = 'copy'
        } else {
          nodelElem.style.cursor = 'move'
        }
      }
    })

    // drag release
    nl.on('mouseup', e => {
      // support connecting nodes
      if (isDraggedOnDifferent(e.node)) {
        nm.toggleConnect(dragging.node.id, e.node.id)

      // move node
      } else if (dragging && !e.node) {
        console.info('moving node', e.x, e.y)
        nm.moveNode(dragging.node.id, e.x, e.y)

      // select/deselect node
      } else {
        this.state.manager.node.engage(e.node)
      }

      // reset
      nodelElem.style.cursor = 'default'
      dragging = null
    })
  }
}
