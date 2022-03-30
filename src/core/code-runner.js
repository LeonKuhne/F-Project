'use strict';

class CodeRunner {
  constructor(state) {
    this.nodes = state.nodel.manager.nodes
  }

  // recursively run through children
  run(node, x=null, id=null) {
    // add a run id
    if (id == null) {
      id = uniqueId()
    }

    // evaluate
    // NOTE: this is a XSS vulnerability
    const func = eval(node.data.code)

    // check if this is part of the previous run
    // and add the result to the node
    if (id === node.data.runId) {
      node.data.result = func(x, node.data.result)
    } else {
      node.data.runId = id
      node.data.result = func(x)
    }
    node.data.param = x

    // base case
    if (node.isLeaf()) {
      return [node.data.result]
    }

    let responses = []
    for (const [connectionType, children] of Object.entries(node.children)) {
      for (const childId of children) {
        const child = this.nodes[childId]
        const resList = this.run(child, node.data.result, id)
        responses = responses.concat(resList)
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
    }

    // display results
    console.log(finalStates)
  }
}
