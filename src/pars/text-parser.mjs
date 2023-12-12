import { Parser } from './parser.mjs'

/**
 * Base class for text parsers.
**/

export class TextParser extends Parser {

  constructor(text) {
    super()
    this.text = text
  }

  parse() {
    this.parseText(this.text)
  }

  // Methods to implement
  //

  parseText(text) {
    throw new Error("Unimplemented")
  }
}
