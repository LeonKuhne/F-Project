/**
 * Parse a file into functions.
 *
 * Any parse function can return true to stop parsing.
**/

class ParseJSFileToFunctions extends LineParser {

  constructor(code) {
    super(code)
    this.functions = []
    // set state
    this.resetClass()
    this.resetFunction()
  }

  parseLine(line) {
    if (!line || !line.trim()) return // ignore whitespace
    if (this.parseFunction(line)) return
    if (this.parseClass(line)) return
  }

  getResult() {
    return this.functions
  }

  // HELPERS
  //

  addFunction() {
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
    this.f = InspectJS.getAnyFunction(line, this.c?.name)
    if (this.f) {
      this.addFunction()
      this.functionIndent = InspectJS.getIndent(line)
      this.debug(`Parsed function start`)
      return true
    }
  }

  addCode(code) {
    this.functions[this.functions.length-1].f.code += code 
  }

  parseFunctionLine(line) {
    line = BuildJS.withoutIndent(line, this.functionIndent)
    this.addCode(`${line}\n`)
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
