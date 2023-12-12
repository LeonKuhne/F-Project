export class NodeView {
  constructor(state) {
    this.state = state
    const nodelElem = this.state.elem.nodel

    // class state
    let dragging = false
    let draggedOff = false
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
        draggedOff = false 
      }
    })

    // support dragging
    const isDraggedOn = (e) => {
      // base case
      if (!dragging || !e || !e.node) {
        return false
      }

      // dragged to different node
      if (dragging.node.id !== e.node.id) {
        return true

      // dragged to same node, make sure user dragged off first
      } else if (draggedOff) {
        return true
      }

      return false
    }

    // indicate dragging using cursor
    nl.on('mousemove', e => {
      if (dragging) {
        if (!e.node && !draggedOff) {
          draggedOff = true
        }

        if (isDraggedOn(e)) {
          nodelElem.style.cursor = 'copy'
        } else {
          nodelElem.style.cursor = 'move'
        }
      }
    })

    // drag release
    nl.on('mouseup', e => {
      // support connecting nodes
      if (isDraggedOn(e)) {
        nm.toggleConnect(dragging.node.id, e.node.id, 0)

      // move node
      } else if (dragging && !e.node) {
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
    nr.on('connection-color', (paramIdx) => {
      if (isNaN(Number(paramIdx))) {
        paramIdx = 0
      }
      let color = '#'
      for (let i=0; i<6; i++) {
        color += toHex(paramIdx + COLOR_OFFSET*i)
      }
      console.info(`Drawing with connection color ${color}`)
      return color
    })

    // setup connection labels
    nr.on('connection-label', (source, target, paramIdx) => {
      const params = target.data.params

      // always use trigger as first param
      let requiredParams = params.required.length ? params.required : [' ']

      // cast to number
      paramIdx = isNaN(Number(paramIdx)) ? 0 : Number(paramIdx)

      if (paramIdx < requiredParams.length) {
        return requiredParams[paramIdx]
      } else {
        return params.optional[paramIdx - requiredParams.length]
      }
    })

    // connection clicks
    nl.on('click', (e) => {
      const [source, target] = e.nodes
      const params = target.data.params
      // always use trigger as first param
      let totalParams = Math.max(params.required.length, 1) + params.optional.length
      let maxConnections = Math.max(totalParams, 1)
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
