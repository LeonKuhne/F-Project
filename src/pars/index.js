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

  static upgradeChunksToBlocks(chunksWithRefs) {
    // swap chunks with code blocks
    const blocksWithRefs = []
    const params = InspectJS.parseParams(chunksWithRefs[0])
    const allParams = params.required.concat(params.optional)
    for (let [idx, item] of Object.entries(chunksWithRefs)) {
      if (typeof item === 'string') {
        // convert to code block
        item = (new ParseJSChunkToCode(item, allParams, Number(idx) === 0)).run()
      }
      blocksWithRefs.push(item)
    }
    return blocksWithRefs
  }

  static modulesToMap(groupName, modules, connections = {}) {
    const head = {
      id: groupName,
      parents: [],
      children: {},
      offsetX: 0,
      offsetY: 0,
    }

    // create maps for each module
    let maps = {}
    for (const module of modules) {
      maps[module.id] = {
        id: module.id,
        parents: [],
        children: {},
        offsetX: 0,
        offsetY: 100,
      }
    }

    // link trigger connections
    let last = head
    const triggerIdx = 0
    for (const map of Object.values(maps)) {
      map.parents = [last.id]
      last.children[triggerIdx] = [map]
      last = map
    }

    // link additional parameter connections
    const paramIdx = 1
    for (const [source, targets] of Object.entries(connections)) {
      // initialize the children
      const sourceChildren = maps[source].children
      sourceChildren[paramIdx] = []

      for (const target of targets) {
        const targetMap = maps[target]

        // link the sources child to the target
        sourceChildren[paramIdx].push(targetMap)
        
        // link the target parent to the child
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

