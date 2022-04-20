// software engineering is the philosophy of code

class ParseJS {

  // TODO rename this to findFunctions and make it yield (generator)
  static loadFunctions(file, onLoad=()=>{}) {
    // search for function in a file
    ParseJS.readFile(file, text => {
      let state = {
        c: null, // the current class
        f: null, // the function being built
        indent: 0, // the current functions indent
      }
      for (const line of text.split('\n')) {
        if (state.f) {
          if (ParseJS.isEndCurly(line, state.indent)) {
            // found function end

            // remove the extra indent
            const codePart = ParseJS.beforeFunctionClose(state.f.name, line)
            state.f.code += this.withoutIndent(codePart, state.indent)
            
            // close the function
            state.f.code += '}'

            // callback
            onLoad(state.f)

            // reset and continue
            state.f  = null

          } else {
            // continue adding to function

            // remove the extra indent
            state.f.code += this.withoutIndent(line, state.indent)
          }
        } else {

          // look for function start
          state.f = ParseJS.getFunction(line, state)

          if (state.f) {
            // track the indent
            state.indent = ParseJS.getIndent(line)

          } else if (!state.c) {
            // check if this is the start of a class
            state.c = ParseJS.getClass(line)
            console.log('class:', state.c)
          }

          // check for end of class
          if (state.c && ParseJS.isEndCurly(line, 0)) {
            state.c = null
          }
        }
      }
    })
  }

  // parse an uploaded file to a text string
  static readFile(file, callback) {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.addEventListener('load', () => {
      callback(reader.result)
    }, false)
  }

  // match 1 is everything before the function start curly
  // match 2 is the function name
  // match 3 is a list of function parameters
  static parseFunctionMatch(line, state, match) {
    // parse and setup code from match
    const startIndex = match[1].length
    let code = line.substring(startIndex, line.length)
    code = `(x, ${match[3]}) => {${code}\n`

    // parse function name to regular text and add class name
    let name = ParseJS.toNormalCase(match[2])
    name = `${state.c.name} ${name}`

    // format the match as module options 
    return {
      name,
      params: ParseJS.parseParams(code),
      code: code,
    }
  }

  // ReGeX Ops (Top Secret)
  //
  
  static getFunction(line, state) {
    // class function
    if (state.c && !state.f) {
      let regex = '(.* +([a-zA-Z]+) *\\(([a-zA-Z]*[, *[a-zA-Z]*(\=.*)?]*)\\) *{)'
      let match = line.match(new RegExp(regex, 'i'))
      if (match) {
        return ParseJS.parseFunctionMatch(line, state, match)
      }
    }

    // regular TODO test
    let match = line.match(new RegExp('^.function *[a-zA-Z]* *([a-zA-Z]+) *\\(([a-zA-Z]*[, *[a-zA-Z]*]*)\\) *{', 'i'))
    if (match) {
      return ParseJS.parseFunctionMatch(line, state, match)
    }

    /* 
    // anonymous
    match = line.match(new RegExp('^.*[a-zA-Z]* *([a-zA-Z]+) *= *\\(([a-zA-Z]*[, *[a-zA-Z]*]*)\\) *=> *{', 'gi'))
    if (match) {
      return ParseJS.parseFunctionMatch(line, match)
    }
    */

    return null
  }
  static getClass(line) {
    // check if class is delcared
    const match = line.match(new RegExp('^ *class *([a-zA-Z]+) *{', 'i'))

    return match ? {
      // parse the class name to normal case
      name: ParseJS.toNormalCase(match[1])
    } : null
  }

  static isEndCurly(line, indent) {
    // check if a curly exists with the same indent as the start declaration
    return !!line.match(new RegExp('^ {'+indent+'}}', 'gi'))
  }
  static getIndent(line) {
    // count the number of spaces from the start
    return line.match(/^ */gi)[0].length
  }
  static withoutIndent(line, indent) {
    let codePart = this.removeIndent(line, indent)

    // remove empty lines from the function
    if (!codePart.trim()) {
      return ''
    }

    // append to the function
    return codePart + '\n'

  }
  static removeIndent(line, indent) {
    return line.replace(' '.repeat(indent), '')
  }

  // get everything in the line before the closing curly brace '}'
  static beforeFunctionClose(fName, line) {
    const before = line.match(/^(.*)}/i)[1]
    return before
  }

  static toNormalCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  }

  // fCode: string representing an anonymous function compatible with f-modules
  static parseParams(fCode) {
    let paramStr = fCode
    let parts = null

    // remove everything before the opening parethesis
    parts = paramStr.split('(')
    parts = parts.splice(1, parts.length)
    paramStr = parts.join('(')

    // remove everything after the closing parethesis
    parts = paramStr.split(')')
    parts = parts.splice(0, parts.length-1)
    paramStr = parts.join(')')

    // find params
    let params = paramStr.split(',')
    params = params.map(param => param.trim())
    params = params.filter(param => param)

    // parse params into categories
    const required = params.filter(param => !param.includes('='))
    let optional = params.filter(param => param.includes('='))

    // parse out default values
    optional = optional.map(param => param.split('=')[0])


    return {required, optional}
  }
}
