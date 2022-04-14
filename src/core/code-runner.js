'use strict';

class CodeRunner {
  constructor(state) {
    this.nodes = state.nodel.manager.nodes
    this.reset()
  }

  reset() {
    this.params = {}
  }

  // TODO: dispatch each node as its own thread (ie. promise)
  run(node, paramIdx=null, param=null, runId=null) {
    // update and save the run id
    if (!runId) {
      runId = uniqueId()
    }
    node.data.runId = runId

    // setup parameters
    if (!(node.id in this.params)) {
      this.params[node.id] = {}

      // start with node data, fill with nulls
      for (let idx=0; idx<node.data.params.length; idx++) {
        let val = null
        switch(idx) {
          case 0:
            val = node.data
            break
        }
        this.params[node.id][idx] = val
      }
    }

    // add the given parameter
    if (paramIdx && param) {
      this.params[node.id][paramIdx] = param
    }

    // mask the node's body
    node.data.input = Object.values({ ...this.params[node.id], 0: null })

    // ensure there are sufficient parameters
    if (Object.values(this.params[node.id]).includes(null)) {
      return []
    }

    // evaluate
    // NOTE: eval is a XSS vulnerability
    const func = eval(node.data.code)
    node.data.result = func(...Object.values(this.params[node.id]))

    // check for end
    if (node.isLeaf()) {
      return [node.data.result]
    }

    // recursively run through children
    let responses = []
    for (const [connectionType, children] of Object.entries(node.children)) {
      for (const childId of children) {
        const child = this.nodes[childId]
        // use the result as a parameter
        let paramIdx = Number(connectionType)
        paramIdx = isNaN(paramIdx) ? 1 : paramIdx + 1

        // run the child
        const resList = this.run(child, paramIdx, node.data.result, runId)
        responses = [...responses, ...resList]
      }
    }

    return responses
  }

  runAll() {
    // find the heads
    const heads = getHeads(this.nodes)

    // loop through the heads and execute on the state
    const finalStates = []
    for (const head of heads) {
      const responses = this.run(head)
      finalStates.push(responses)
      this.reset()
    }

    // display results
    console.info(finalStates)
  }
}
