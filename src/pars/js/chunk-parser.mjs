import { TextParser } from '../text-parser.mjs'
import { BuildJS } from './build.mjs'
import { InspectJS } from './inspect.mjs'

export class ParseJSChunkToCode extends TextParser {

  constructor(code, allParams, isFirst=false, returns=null) {
    super(code)
    this.code = ''
    this.allParams = allParams
    this.isFirst = isFirst
    this.returns = returns
  }

  parseText(code) {
    if (!code || !code.trim()) return
    code = this.parseAddHeader(code)
    code = this.parseCloseFunction(code)
    // assumes function is closed
    code = this.parseAddReturn(code)

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

  parseAddReturn(code) {
    if (this.returns && !InspectJS.getReturn(code)) {
      code = BuildJS.addReturn(code, this.returns)
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
