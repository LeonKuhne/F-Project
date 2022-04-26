/**
 * Base class for item parsers.
**/

class ItemParser extends Parser {

  constructor(items) {
    super()
    this.items = items
    this.idx = null

    // TODO add a setter so it can be toggled during runtime
    this.debugging = false 
  }

  parse() {
    for (const [idx, item] of Object.entries(this.items)) {
      this.idx = Number(idx)
      // parse the line
      this.parseItem(item)

      // display info
      this.debug(item, true)
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

  parseItem(item) {
    throw new Error("Unimplemented")
  }
}
