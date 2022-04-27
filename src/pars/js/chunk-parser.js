class ParseJSChunkToCode extends TextParser {

  constructor(code, allParams, isFirst=false) {
    super(code)
    this.code = ''
    this.allParams = allParams
    this.isFirst = isFirst
  }

  parseText(code) {
    if (!code || !code.trim()) return
    code = this.parseAddHeader(code)
    code = this.parseCloseFunction(code)

    this.code = code
  }

  getResult() {
    return this.code
  }

  // PARSERS
  //
  
  parseAddHeader(code) {
    if (!this.isFirst) {
      code = BuildJS.addHeader(code, this.allParams)
    }
    return code
  }

  parseCloseFunction(code) {
    if (this.isFirst) {
      code = BuildJS.closeFunction(code)
    }
    return code
  }
}
