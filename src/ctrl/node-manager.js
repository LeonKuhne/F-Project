'use strict';

class NodeManager {
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
    const nm = this.state.nodel.manager
    if (module.isGroup()) {

      // create group node
      nm.pauseDraw()
      const groupNodeId = this.createFromMap(module.nodes, x, y)
      nm.createGroup(groupNodeId, module.name)
      nm.toggleGroup(groupNodeId)
      nm.unpauseDraw()
      return groupNodeId
    } else {

      // create regular node
      return nm.addNode(module.base, x, y, module.data())
    }
  }
  createFromMap(groupMap, x, y, group=null, connection=null) {
    const nm = this.state.nodel.manager
    const moduleManager = this.state.manager.module
    const node = nm.nodes[groupMap.id]
    // use the node name as the key for modules, otherwise fallback to the base template
    const module = moduleManager.get(node.name) || moduleManager.get(node.base)
    const nodeX = x + groupMap.offsetX
    const nodeY = y + groupMap.offsetY

   
    // create the node
    // TODO don't create the node if it already exists (ie. support diamond connections)
    const nodeId = this.createNode(module, nodeX, nodeY)

    // recursively create nodes in group
    for (const [connectionType, children] of Object.entries(groupMap.children)) {
      for (const childGroupMap of children) {
        this.createFromMap(childGroupMap, nodeX, nodeY, null, {
          type: connectionType,
          parentId: nodeId,
        })
      }
    }

    // create connections 
    if (connection) {
      nm.connectNodes(connection.parentId, nodeId, connection.type)
    }

    return nodeId
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
}
