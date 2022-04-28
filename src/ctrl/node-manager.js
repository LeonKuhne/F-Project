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
    const groupNodeId = this.createFromMap(module.nodes, x, y, head)
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
  // TODO include this as part of nodel instead
  createFromMap(groupMap, x, y, head=null, group=null, connection=null) {
    const nm = this.state.nodel.manager
    const moduleManager = this.state.manager.module
    const module = moduleManager.get(groupMap.id) || moduleManager.getDefault()
    
    let nodeId = null
    let nodeX = null
    let nodeY = null
    if (head) {
      nodeX = head.x
      nodeY = head.y
      nodeId = head.id
    } else {
      nodeX = x + groupMap.offsetX
      nodeY = y + groupMap.offsetY
      // create the node
      // TODO don't create the node if it already exists (ie. support diamond connections)
      nodeId = this.createNode(module, nodeX, nodeY)
    }

    // recursively create nodes in group
    for (const [connectionType, children] of Object.entries(groupMap.children)) {
      for (const childGroupMap of children) {
        this.createFromMap(childGroupMap, nodeX, nodeY, null, null, {
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

  parseRefactor(node) {
    const existingModules = this.state.manager.module.getAllNames()
    const chunksWithRefs = (new ParseJSModuleToChunks(node.data.code, existingModules)).run()

    // no references
    if (chunksWithRefs.length <= 1) return

    const nm = this.state.nodel.manager
    const moduleManager = this.state.manager.module
    const name = node.data.name

    // pause drawing
    nm.pauseDraw()

    // convert code chunks to runnable code blocks
    const blocksWithRefs = ParseUtil.upgradeChunksToBlocks(node, chunksWithRefs)

    // create/find module names for blocks and refs
    const moduleNames = (new ParseJSBlocksWithReferencesToModules(
      name, blocksWithRefs, (moduleOptions) => {
        const module = new Module({
          base: node.template,
          params: node.data.params,
          ...moduleOptions,
        })
        moduleManager.loadStatic(module)
        return module.id
      }
    )).run()

    // find modules
    const modules = moduleNames.map(name => moduleManager.get(name))

    // stitch modules together to form group
    const groupModule = new Module({
      name: name,
      nodes: ParseUtil.modulesToMap(name, modules)
    })
    moduleManager.loadStatic(groupModule)

    // update the nodes code
    node.data.code = ''

    // select and apply the new group module
    this.state.selected.module = groupModule
    this.state.manager.node.updateNode(groupModule, node)

    // unpause drawing
    nm.unpauseDraw()

    return node
  }
}
