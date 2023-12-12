import { ItemParser } from '../item-parser.mjs'

/**
 * Parse a file into functions.
 *
 * Any parse function can return true to stop parsing.
**/

export class ParseJSFileToFunctions extends ItemParser {

  constructor(code) {
    super(code.split('\n'))

    this.functions = []
    this.resetClass()
    this.resetFunction()
  }

  parseItem(line) {
    if (!line || !line.trim()) return // TODO remove this line
    if (this.parseFunction(line)) return
    if (this.parseClass(line)) return
  }

  getResult() {
    return this.functions
  }

  // HELPERS
  //

  addCode(code) {
    this.functions[this.functions.length-1].f.code += code 
  }

  startFunction() {
    this.functions.push({
      f: this.f,
      className: this.c?.name,
    })
  }

  resetFunction() {
    this.f = null
    this.functionIndent = 0
  }

  resetClass() {
    this.c = null
    this.classIndent = 0
  }

  // CLASS PARSERS
  //
    
  parseClass(line) {
    // end of class
    if (this.c) {
      if (this.parseClassEnd(line)) return true
    }

    // start of class
    else {
      if (this.parseClassStart(line)) return true
    }
  }

  parseClassStart(line) {
    this.c = InspectJS.getClass(line)
    if (this.c) {
      this.debug(`Reached start of class: ${this.c.name}`)
      this.classIndent = InspectJS.getIndent(line)
      return true
    }
  }

  parseClassEnd(line) {
    if (InspectJS.isEndCurly(line, this.classIndent)) {
      this.debug(`Reached end of class`)
      this.resetClass()
      return true
    }
  }

  // FUNCTION PARSERS
  //
    
  parseFunction(line) {
    if (this.f) {

      // end of function 
      if (this.parseFunctionEnd(line)) return true

      // function line
      this.parseFunctionLine(line)
      return true
    }

    // start of function
    else {
      if (this.parseFunctionStart(line)) return true
    }
  }

  parseFunctionStart(line) {
    this.f = UtilJS.getAnyFunction(line, this.c?.name)
    if (this.f) {
      this.startFunction()
      this.functionIndent = InspectJS.getIndent(line)
      this.debug(`Parsed function start`)
      return true
    }
  }

  parseFunctionLine(line) {
    line = BuildJS.withoutIndent(line, this.functionIndent)
    // NOTE: the line still contains its newline character
    this.addCode(line)
  }

  parseFunctionEnd(line) {
    if (InspectJS.isEndCurly(line, this.functionIndent)) {
      let code = InspectJS.beforeFunctionClose(line)
      code = BuildJS.withoutIndent(code)
      this.addCode(`${code}}`)
      this.resetFunction()
      this.debug(`Parsed function end`)
      return true
    }
  }
}
