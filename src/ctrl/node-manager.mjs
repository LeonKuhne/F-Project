export class NodeManager {
  constructor(
    state,
    callbacks = {
      selectNode: ()=>{},
      deselectNode: ()=>{},
      selectNothing: ()=>{},
      selectAnything: ()=>{},
    }
  ) {
    this.state = state
    this.on = callbacks
    this.lastSelected = null
  }

  createNode(module, x, y) {
    if (module.isGroup()) {
      return this.createGroup(module, x, y)
    } else {
      // create regular node
      return this.state.nodel.manager.addNode(module.base, x, y, module.data())
    }
  }
  createGroup(module, x, y, head=null) {
    const nm = this.state.nodel.manager
    nm.pauseDraw()
    const groupNodeId = nm.createFromMap(
      module.nodes, x, y, head, 
      (map, x, y) => this.headNodeFromMap(map, x, y)
    )
    nm.createGroup(groupNodeId, module.name)
    nm.toggleGroup(groupNodeId, true)
    nm.unpauseDraw()
    return groupNodeId
  }
  removeNode(node) {
    this.state.nodel.manager.deleteNode(node.id)
  }
  updateNode(module, node) {
    if (module.isGroup()) {
      const nm = this.state.nodel.manager
      nm.pauseDraw()

      // delete the previous groups children if collapsed
      if (node.isGroup(true)) {
        nm.eachChild(node, child => {
          nm.deleteNode(child.id)
        }, node.group.ends)
        node.children = []
      }

      // upgrade node to group 
      this.createGroup(module, 0, 0, node)
      nm.unpauseDraw()
    } else {
      // update the node
      node.data = module.data()
      nm.redraw()
    }
  }

  engage(node) {
    // update the selected node in state
    this.state.selected.node = node
    const lastNode = this.lastSelected

    // a binary logic tree for indication callbacks
    if (lastNode) {
      if (node) {
        if (node === lastNode) {
          // same node engaged
          this.on.deselectNode(node)
          this.on.selectNothing()
          node = null
        } else {
          // different node engaged
          this.on.selectNode(node)
        }
      } else {
        this.on.selectNothing()
      }

      // deselect last node on any engagement
      this.on.deselectNode(lastNode)
    } else {
      if (node) {
        // select the node
        this.on.selectAnything()
        this.on.selectNode(node)
      } else {
        // ignore background engagements
      }
    }

    // keep track of the last selected node
    this.lastSelected = node
  }

  headNodeFromMap(map, x, y) {
    const manager = this.state.manager.module
    const module = manager.get(map.moduleId) || manager.getDefault()
    x += map.offsetX
    y += map.offsetY
    // create the node
    return { id: this.createNode(module, x, y), x, y, conn: [] }
  }
}
