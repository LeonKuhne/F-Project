class ParseJSChunksToCode extends ItemParser {

  constructor(chunks) {
    super(chunks)
    this.codeBlocks = []

    // parse params
    const params = InspectJS.parseParams(chunks[0])
    this.allParams = params.required.concat(params.optional)
  }

  parseItem(code) {
    if (!code || !code.trim()) return
    code = this.parseAddHeader(code)
    code = this.parseCloseFunction(code)

    this.codeBlocks.push(code)
  }

  getResult() {
    return this.codeBlocks
  }

  // PARSERS
  //
  
  parseAddHeader(code) {
    if (this.idx) { // not the first chunk
      code = BuildJS.addHeader(code, this.allParams)
    }
    return code
  }

  parseCloseFunction(code) {
    if (!this.idx) { // the first chunk
      code = BuildJS.closeFunction(code)
    }
    return code
  }
}
