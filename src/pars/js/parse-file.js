
/**
 * Parse a file into functions.
**/

class ParseFileJS extends LineParser {

  constructor(code) {
    super(code)
    this.functions = []
    this.c = null
    this.f = null
    this.indent = 0
  }

  parseLine(line) {
    // function line
    if (this.f) {
      this.parseFunctionLine()
      return
    }

    // start of function
    this.f = this.parseFunctionHeader(line)
    if (this.f) {
      return
    }

    // start of class
    if (!this.c) {
      this.c = InspectJS.getClass(line)
      return
    }

    // end of class
    if (InspectJS.isEndCurly(line, this.indent)) {
      this.c = null
    }
  }

  parseFunctionHeader(line) {
    // order multiple header function parsers
    const getters = [
      this.c ? InspectJS.getClassFunction : null,
      InspectJS.getFunction,
      // TODO 
      // InspectJS.getAnonFunction,
    ]

    // find and return the first header found
    for (const getFunction of getters) {
      if (getFunction) {
        const header = getFunction(line)
        if (header) {
          return header
        }
      }
    }
  }

  parseFunctionLine() {
    // remove the indent
    line = BuildJS.withoutIndent(line, this.indent)

    // add line to function
    functions[fIdx] += line

    // check if the function ends here
    if (InspectJS.isEndCurly(line)) {
      this.functions.push({
        code: "",
        inClass: this.inClass,
      })
    }
  }
}
