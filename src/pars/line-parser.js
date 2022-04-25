/**
 * Base class for line parsers.
**/

class LineParser extends Parser {

  constructor(code) {
    super()
    this.lines = code.split('\n')

    // TODO set this to false by default
    // TODO add a setter so it can be toggled during runtime
    this.debugging = true
  }

  parse() {
    for (const [idx, line] of Object.entries(this.lines)) {
      // parse the line
      this.parseLine(line)

      // display info
      this.debug(line, true)
    }
  }


  // Helpers
  //

  debug(text, isCode=false) {
    if (this.debugging) {
      if (isCode) {
        console.warn(text)
      } else {
        console.debug(text)
      }
    }
  }



  // Methods to implement
  //

  parseLine(line) {
    throw new Error("Unimplemented")
  }
}
