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
        nm.toggleConnect(dragging.node.id, e.node.id, 0)

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

    // setup connection colors
    const COLOR_OFFSET = 11 // MESS WITH THIS TO CHANGE UP THE CONNECTION COLORS
    const toHex = (num) => (num % 16).toString(16)
    nr.setConnectionColors((paramIdx) => {
      let color = '#'
      for (let i=0; i<6; i++) {
        color += toHex(paramIdx + COLOR_OFFSET*i)
      }
      console.info(`Drawing with connection color ${color}`)
      return color
    })

    // connection clicks
    nl.on('click', (e) => {
      const [source, target] = e.nodes
      let maxConnections = Math.max(target.data.params.length - 1, 1)
      let paramIdx = nm.getConnectionType(source.id, target.id)
  
      // cast to number
      paramIdx = isNaN(Number(paramIdx)) ? 0 : Number(paramIdx) 
      // increment the parameter index
      paramIdx = paramIdx + 1
      // cropped the range
      paramIdx %= maxConnections

      // update the connection
      nm.setConnectionType(source.id, target.id, paramIdx)
      console.info(`${target.id} moved parameter ${source.id} to slot ${paramIdx}`)
    }, true)
  }
}
