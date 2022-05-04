/** 
 * Construct 'options' which are a parameter of the Module class
**/

class ParseJSFunctionToModule extends TextParser {

  constructor(f, className) {
    super(f.code)
    this.f = f
    this.className = className
  }

  parseText(code) {
    code = this.parseConstructor(code)
    code = this.parseClassFunction(code)
    this.setCode(code)
  }

  getResult() {
    return this.f
  }


  // HELPERS
  //

  setCode(code) {
    this.f.code = code
  }

  // PARSERS
  //
 
  parseClassFunction(code) {
    if (this.className) {
      // prepend the class name
      this.f.name = BuildJS.toNormalCase(`${this.className} ${this.f.name}`)

      // replace 'this' references with a class instance variable
      code = BuildJS.swapVar(code, 'this', this.className)
    }
    return code
  }

  /*
   * Parse a constructor into a regular function.
   */
  parseConstructor(code) {
    if (this.f.name === 'constructor') {
      // prepend class parameters
      this.f.params.required.unshift('_', this.className)

      // create class object
      code = BuildJS.initObject(code, this.className)
      
      // have the constructor return instance of self
      code = BuildJS.addReturn(code, this.className)
    }
    return code
  }

}
