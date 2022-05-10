'use strict';

class CodeRunner {
  constructor(state) {
    this.nodes = state.nodel.manager.nodes
    this.reset()
  }

  reset() {
    this.params = {}
  }

  hasRequiredParams(params, requiredParamCount) {
    // find any missing params
    let missingParamIdx = []
    for (let idx=0; idx<=requiredParamCount; idx++) {
      if (!(idx in params)) {
        return false
      }
    }
    return true
  }

  // TODO: dispatch each node as its own thread (ie. promise)
  async run(node, paramIdx=null, param=null, runId=null) {
    // setup parameters
    const requiredParamCount = node.data.params.required.length
    if (!(node.id in this.params)) {
      // add the node data as the first param
      this.params[node.id] = {
        0: node.data,
      }
    }

    // add the provided parameter
    if (paramIdx && param !== undefined) {
      this.params[node.id][paramIdx] = param
    }

    // ensure required parameters exist
    if (!this.hasRequiredParams(this.params[node.id], requiredParamCount)) {
      console.debug(`Skipping node '${node.data.name}', missing params`)
      return []
    }

    // break down and reassemble node params to support 'this' reference and default values
    // add 'x' as a parameter for referencing 'this'
    let params = ['x']
    // always have a trigger param
    const requiredParams = node.data.params.required
    params = params.concat(requiredParams.length ? requiredParams : ['_'])
    // assemble optional params with default values
    let optionalParams = node.data.params.optional
    let defaultParams = node.data.params.defaults
    optionalParams = Object.entries(optionalParams).map(([idx, key]) => `${key}=${defaultParams[idx]}`)
    params = params.concat(optionalParams)
    // edit the params
    const code = BuildJS.editParams(node.data.code, params)

    // fill with null trigger
    const triggerIdx = 1
    if (!(triggerIdx in this.params[node.id])) {
      this.params[node.id][triggerIdx] = null
    }

    // mask the node's body
    node.data.input = Object.values({ ...this.params[node.id], 0: 'this' })

    // arrange the parameter values to pass in
    const args = [...Object.values(this.params[node.id])]

    // evaluate
    // NOTE: eval is a XSS vulnerability
    const func = eval(code)
    node.data.result = await func(...args)

    // check for end, or undefined returned
    if (node.isLeaf() || node.data.result === undefined) {
      return node.data.result === undefined ? [] : [node.data.result]
    }

    // update and save the run id
    if (!runId) {
      runId = uniqueId()
    }
    node.data.runId = runId


    // recursively run through children
    let responses = []
    for (const [connectionType, children] of Object.entries(node.children)) {
      for (const childId of children) {
        const child = this.nodes[childId]
        // use the result as a parameter
        let paramIdx = Number(connectionType)
        paramIdx = isNaN(paramIdx) ? 1 : paramIdx + 1

        // run the child
        const resList = await this.run(child, paramIdx, node.data.result, runId)
        responses = [...responses, ...resList]
      }
    }
    return responses
  }

  async runAll() {
    // find the heads
    const heads = getHeads(this.nodes)

    // loop through the heads and execute on the state
    const finalStates = []
    for (const head of heads) {
      const responses = await this.run(head)
      finalStates.push(responses)
      this.reset()
    }

    // display results
    console.info(finalStates)
  }
}
