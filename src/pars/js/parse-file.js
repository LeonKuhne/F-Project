
/**
 * Parse a file into functions.
 *
 * Any parse function can return true to stop parsing.
**/

class ParseFileJS extends LineParser {

  constructor(code) {
    super(code)
    this.functions = []
    // set state
    this.resetClass()
    this.resetFunction()
  }

  parseLine(line) {
    console.warn(line)
    if (!line || !line.trim()) return // ignore whitespace
    if (this.parseFunction(line)) return
    if (this.parseClass(line)) return
  }

  getOptions() {
    return this.functions
  }

  // HELPERS
  //

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
      console.debug(`Reached start of class`)
      this.classIndent = InspectJS.getIndent(line)
      return true
    }
  }

  parseClassEnd(line) {
    if (InspectJS.isEndCurly(line, this.classIndent)) {
      console.debug(`Reached end of class`)
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
      this.functions.push({
        code: this.f.code,
        inClass: !!this.c,
      })
      this.functionIndent = InspectJS.getIndent(line)
      console.debug(`Parsed function start`)
      return true
    }
  }

  parseFunctionLine(line) {
    // remove the indent
    line = BuildJS.withoutIndent(line, this.functionIndent)

    // add line to function
    this.functions[this.functions.length-1].code += `${line}\n`
  }

  parseFunctionEnd(line) {
    if (InspectJS.isEndCurly(line, this.functionIndent)) {
      this.functions[this.functions.length-1].code += `}`
      this.resetFunction()
      console.debug(`Parsed function end`)
      return true
    }
  }
}
