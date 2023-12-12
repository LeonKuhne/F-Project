/**
 * Base class for parsers.
**/

export class Parser {

  constructor() {}

  run() {
    this.parse()
    return this.getResult()
  }

  // Methods to implement
  //

  parse() {
    throw new Error("Unimplemented")
  }

  getResult() {
    throw new Error("Unimplemented")
  }
}
