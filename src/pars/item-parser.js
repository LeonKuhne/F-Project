/**
 * Base class for item parsers.
**/

class ItemParser extends Parser {
  debugging = false

  constructor(items) {
    super()
    this.items = items
    this.idx = null
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

  static toggleDebugging(state = null) {
    ItemParser.debugging = state !== null ? state : !ItemParser.debugging
    return ItemParser.debugging
  }


  // Methods to implement
  //

  parseItem(item) {
    throw new Error("Unimplemented")
  }
}
