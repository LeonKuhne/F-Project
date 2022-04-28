class ParseJSBlocksWithReferencesToModules extends ItemParser {

  constructor(baseName, blocksWithRefs, add=()=>{}) {
    super(blocksWithRefs)
    this.baseName = baseName
    this.moduleNames = []
    this.add = add
    this.blockIdx = 0
  }

  parseItem(blockOrRef) {
    let moduleName = null
    console.warn('parsing blockOrRef', blockOrRef)

    // parse items seperately
    if (this.isCodeBlock(blockOrRef)) {
      moduleName = this.parseBlock(blockOrRef)
    } else {
      moduleName = this.parseRef(blockOrRef)
    }

    this.moduleNames.push(moduleName)
  }

  getResult() {
    return this.moduleNames
  }

  // HELPERS
  //

  isCodeBlock(item) {
    return typeof item === 'string'
  }

  // PARSERS
  //

  parseBlock(block) {
    // create a module from the block
    this.blockIdx += 1
    return this.add({
      name: `${this.baseName} #${this.blockIdx}`,
      code: block,
    })
  }

  parseRef(ref) {
    return ref.name
  }
  
}
