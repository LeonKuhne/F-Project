/*
 * Not sure why I called it index.js.
 *
 * Here you shall find methods that
 * may be useful for parsing any language.
 *
 * Good luck!
**/


class ParseUtil {

  // parse an uploaded file to a text string
  static readFile(file, callback) {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.addEventListener('load', () => {
      callback(reader.result)
    }, false)
  }

  static upgradeChunksToBlocks(chunksWithRefs, returns=null) {
    // swap chunks with code blocks
    const blocksWithRefs = []
    const firstChunk = chunksWithRefs[0]
    const params = InspectJS.parseParams(firstChunk)
    // if func returns, add returned value as param for the next func 
    if (returns) {
      params.required.push(returns)
    }
    const allParams = params.required.concat(params.optional)

    for (let [idx, item] of Object.entries(chunksWithRefs)) {
      if (typeof item === 'string') {
        // convert to code block
        item = (new ParseJSChunkToCode(
          item, allParams, Number(idx) === 0, returns
        )).run()
      }
      blocksWithRefs.push(item)
    }
    return blocksWithRefs
  }

  static modulesToMap(groupName, modules, connections = {}) {
    const [triggerIdx, paramIdx] = [0, 1]

    const headModule = modules.shift()
    const head = {
      id: headModule.id,
      moduleId: headModule.id,
      parents: [],
      children: {},
      offsetX: 0,
      offsetY: 0,
    }

    // create maps for each module
    let maps = {
      [headModule.id]: head
    }
    for (const module of modules) {
      maps[module.id] = {
        id: module.id,
        moduleId: module.id,
        parents: [],
        children: {},
        offsetX: 0,
        offsetY: 100,
      }
    }

    // link trigger connections
    let last = head
    for (const map of Object.values(maps)) {
      map.parents = [last.id]
      last.children[triggerIdx] = [map]
      last = map
    }

    // link additional parameter connections
    for (const [source, targets] of Object.entries(connections)) {
      const sourceMap = maps[source]

      // initialize the children if not already
      if (!sourceMap.children[paramIdx]) {
        sourceMap.children[paramIdx] = []
      }

      for (const target of targets) {
        const targetMap = maps[target]

        // link the sources child to the target on parameter
        sourceMap.children[paramIdx].push(targetMap)
        
        // link the target parent to the child id
        targetMap.parents.push(source)
      }
    }

    return head
  }

  static mapParamsCode(params) {
    let allParams = params.required.concat(params.optional)
    let code = ``

    // params to map, ignoring first 'x' param
    for (let i=1; i<allParams.length; i++) {
      const param = allParams[i]
      code += `    ${param}: ${param},\n`
    }

    // complete the return
    code = `  return {\n${code}  }\n`

    // add a header and close the function
    return BuildJS.finalizeCode(code, allParams)
  }
}

