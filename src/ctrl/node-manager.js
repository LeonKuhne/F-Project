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

  headNodeFromMap(map, x, y) {
    const manager = this.state.manager.module
    const module = manager.get(map.moduleId) || manager.getDefault()
    x += map.offsetX
    y += map.offsetY
    // create the node
    return { id: this.createNode(module, x, y), x, y, conn: [] }
  }

  // TODO include this as part of nodel instead
  createFromMap(
    map, x, y,
    head=null, group=null, created={}, connection=null,
  ) {
    // find/create the next map head node
    let node = head || created[map.id] || this.headNodeFromMap(map, x, y)

    // create if new
    if (!(map.id in created)) {
      created[map.id] = node

      // recursively create nodes in group
      for (const [connectionType, children] of Object.entries(map.children)) {
        for (const childMap of children) {
          this.createFromMap(
            childMap, node.x, node.y,
            null, null, created, {
            type: connectionType,
            parentId: node.id,
          })
        }
      }
    }

    // create connections 
    const toKey = JSON.stringify
    if (connection) {
      this.state.nodel.manager.connectNodes(connection.parentId, node.id, connection.type)
      node.conn.push(toKey(connection))
    }

    return node.id 
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

  // careful, order maters
  parseRefactor(node) {

    // no code
    if (!node.data.code) return

    // split by references
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
    const blocksWithRefs = ParseUtil.upgradeChunksToBlocks(
      chunksWithRefs, InspectJS.getReturn(node.data.code)
    )

    // create/find module names for blocks and refs
    let moduleNames = (new ParseJSBlocksWithReferencesToModules(
      name, blocksWithRefs, (moduleOptions) => {
        const module = new Module({
          base: node.template,
          params: InspectJS.parseParams(moduleOptions.code),
          ...moduleOptions,
        })
        moduleManager.loadStatic(module)
        return module.id
      }
    )).run()


    // find the modules created from the code blocks
    // NOTE: assumes that the new modules start with the old module name
    // NOTE: must be done before you add the params
    const newModules = moduleNames.filter(moduleName => moduleName .startsWith(name))

    // create a param module and track it as a reference
    const paramModuleId = moduleManager.createParamModule(node)
    const allButParamModule = [...moduleNames]
    moduleNames.unshift(paramModuleId)

    // find modules
    const modules = moduleNames.map(name => moduleManager.get(name))

    // connect the param node to all of the other references
    const map = ParseUtil.modulesToMap(name, modules, {
      [paramModuleId]: allButParamModule,
    })

    console.debug('GENERATED GROUP MAP')
    console.warn(map)

    // stitch modules together to form group
    const groupModule = new Module({
      name: name,
      nodes: map,
    })
    moduleManager.loadStatic(groupModule)

    // update the nodes code
    node.data.code = null

    // select and apply the new group module
    this.state.selected.module = groupModule
    this.updateNode(groupModule, node)

    // unpause drawing
    nm.unpauseDraw()

    return node
  }
}
