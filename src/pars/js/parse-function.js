/*  
 * Construct 'options' which are a parameter of the Module class
**/

class ParseFunctionJS extends LineParser {

  constructor(code, inClass=false) {
    super(code)
    this.lines = code.split('\n')
    this.indent = 0
    this.inClass = inClass
    this.idx = -1
  }

  parseLine(line, state) {
    if (state.f) {
      UtilJS.parseFunctionLine(line, state, onload)
    } else {
      UtilJS.parseRegularLine(line, state, onload)
    }
  }

  parseRegularLine(line, state) {
    // look for function start
    state.f = ParseJS.getFunction(line, state)

    if (state.f) {
      // track the indent
      state.indent = ParseJS.getIndent(line)

    } else if (!state.c) {
      // check if this is the start of a class
      state.c = ParseJS.getClass(line)
    }     

    // check for end of class
    if (state.c && ParseJS.isEndCurly(line, 0)) {
      state.c = null
    }
  }

  parseFunctionLine(line, state) {
    
    if (ParseJS.isEndCurly(line, state.indent)) {
    // found function end
      UtilJS.parseFunctionLastLine(line, state)

    } else {
      // continue adding to function
      // remove the extra indent
      state.f.code += this.withoutIndent(line, state.indent)
    }     
  }

  parseFunctionLastLine(line, state) {
    // remove the extra indent
    const codePart = ParseJS.beforeFunctionClose(state.f.name, line)
    state.f.code += this.withoutIndent(codePart, state.indent)

    // special case for classes
    if (state.c) {
      // swap 'this' with the instance name
      state.f.code = state.f.code.replace(/(?<![a-zA-Z])this(?=.)/gi, state.c.name)

      // special case for constructors
      if (state.f.constructor) {
        delete state.f.constructor 
        // return the instance (name)
        state.f.code = `${state.f.code}  return ${state.c.name}\n`
      }
    }     
        
    // close the function
    state.f.code = ParseJS.closeFunction(state.f.code)
  }
}
