class ParseUtil {
  static upgradeChunksToBlocks(node, chunksWithRefs) {
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
}

