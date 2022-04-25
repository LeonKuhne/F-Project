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
    this.parseConstructor(code)
    this.parseClassFunction(code)
  }

  getResult() {
    return this.f
  }

  // PARSERS
  //
  
  parseClassFunction(code) {
    if (this.className) {
      // prepend the class name
      this.f.name = BuildJS.toNormalCase(`${this.className} ${this.f.name}`)
      // replace 'this' references with a class instance variable
      BuildJS.swapVar('this', this.className)
    }
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
      
      // add return
      code = BuildJS.addReturn(code, this.className)
    }
  }
}
