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

  static modulesToMap(groupName, modules) {
    const head = {
      id: groupName,
      parents: [],
      children: {},
      offsetX: 0,
      offsetY: 0,
    }
    let last = head

    for (const module of modules) {
      const map = {
        id: module.id,
        parents: [last.id],
        children: {},
        offsetX: 0,
        offsetY: 100,
      }

      // TODO you will need to change this
      const paramIdx = 2
      last.children[paramIdx] = [map]
      last = map
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

