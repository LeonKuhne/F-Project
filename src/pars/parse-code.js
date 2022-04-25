/**
 * Base class for line parsers.
**/

class LineParser {

  constructor(code) {
    this.lines = code.split('\n')
    this.idx = -1
  }

  parseAll() {
    while (this.hasLine()) {
      this.nextLine()
    }
  }

  hasLine() {
    return this.idx < this.lines.length
  }

  nextLine() {
    this.idx += 1
    const line = this.lines[this.idx]
  
    // parse the line
    this.parseLine(line, state)
  }
      
  // methods to be implemented

  parseLine(line, state) {
    throw new Error("Unimplemented")
  }

  getOptions() {
    throw new Error("Unimplemented")
  }
}
