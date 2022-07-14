'use strict';

class CodeRunner {
  constructor(state) {
    this.manager = state.nodel.manager
    this.reset()
    this.delay = 0 
    this.paused = false 
  }

  reset() {
    this.params = {}
  }

  hasRequiredParams(params, requiredParamCount) {
    // find any missing params
    for (let idx=0; idx<=requiredParamCount; idx++) {
      if (!(idx in params) || params[idx] === undefined) {
        return false
      }
    }
    return true
  }

  // remove guards grom input params and return them
  parseOutGuards(expectedParams) {
    // check each guard
    const guards = InspectJS.getGuards(expectedParams, 1)

    // remove guards from params
    guards.forEach((guard) => {
      expectedParams[guard.idx] = guard.param
    })

    return guards
  }

  async waitForUnpause() {
    await new Promise(resolve => setInterval(() => {
      if (!this.paused) {
        resolve()
      }
    }, 100))
  }

  isReady(provided, required) {
    // remove guards and fix required params
    const guards = this.parseOutGuards(required)

    // check if any guards don't pass
    const blocked = guards.filter(guard => {
      return !((provided[guard.idx+1] == guard.expected) == !guard.negated)
    })
    if (blocked.length > 0) {
      console.log("guard blocked", blocked)
      return false
    }

    // check that required parameters exist
    if (!this.hasRequiredParams(provided, required.length)) {
      return false
    }

    return true
  }

  async run(node, paramIdx=null, param=undefined, runId=null) {
    // on first visit
    if (!(node.id in this.params)) {
      // add the node data as the first param
      this.params[node.id] = {
        0: node.data,
      }
    }

    // add the provided parameter
    this.params[node.id][paramIdx] = param

    const providedParams = this.params[node.id]
    const inputParams = node.data.params
    const requiredParams = [...inputParams.required]

    // ensure ready
    if (!this.isReady(providedParams, requiredParams)) {
      console.debug(`Skipping node '${node.data.name}', missing params`)
      return []
    }

    // indicate running
    const elem = document.getElementById(node.id)
    elem.classList.add("running")

    // break down and reassemble node params to support 'this' reference and default values
    // add 'x' as a parameter for referencing 'this'
    let params = ['x']

    // always have a trigger param
    params = params.concat(requiredParams.length ? requiredParams : ['_'])

    // assemble optional params with default values
    let optionalParams = [...inputParams.optional]
    let defaultParams = inputParams.defaults
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

    // handle pause 
    if (this.paused) {
      await waitForUnpause()
    }

    // add delay
    if (this.delay) {
      await new Promise(resolve => setTimeout(resolve, this.delay))
    }

    // evaluate
    // NOTE: eval is a XSS vulnerability
    const func = eval(code)
    node.data.result = await func(...args)

    // remove running indicator
    elem.classList.remove("running")

    // check for end
    /*
    if (node.isLeaf()) {
      return node.data.result === undefined ? [] : [node.data.result]
    }*/

    // update and save the run id
    if (!runId) {
      runId = uniqueId()
    }
    node.data.runId = runId

    // recursively run through children
    let responses = []
    for (const [connectionType, children] of Object.entries(node.children)) {
      console.log(`running children ${children}`)
      for (const childId of children) {
        console.log(`running child ${childId}`)
        const response = this.runNode(childId, connectionType, node.data.result, runId)
        responses.push(response)
      }
    }

    // await results
    return await Promise.all(responses)
  }

  async runNode(nodeId, connectionType, value, runId) {
    const node = this.manager.nodes[nodeId]
    // use the result as a parameter
    let paramIdx = Number(connectionType)
    paramIdx = isNaN(paramIdx) ? 1 : paramIdx + 1

    // run the child
    return this.run(node, paramIdx, value, runId)
  }

  async runAll() {
    const runId = uniqueId()
    const heads = this.manager.getHeads()

    // TODO: it gets slow after running looping networks due to stack trace
    // SOL: use a while loop instead 'visiting' the next available nodes that are ready
    // start with all of the nodes in the list, then pick those that are ready

    // loop through the heads and execute on the state
    const responses = []
    for (const head of heads) {
      const response = this.run(head, 1, null, runId)
      responses.push(response)
      this.reset()
    }

    // await responses
    return await Promise.all(responses)
  }
}
