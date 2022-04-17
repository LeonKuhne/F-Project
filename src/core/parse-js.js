// software engineering is the philosophy of code

class ParseJS {

  static loadModules(file, addModule=()=>{}) {
    ParseJS.readFile(file, text => {
      let f = null
      for (const line of text.split('\n')) {
        if (f) {
          if (ParseJS.isFunctionEnd(line, f.indent)) {
            // done parsing
            f.code += ParseJS.beforeFunctionClose(f.name, line)
            addModule(new Module(f))
            f  = null
          } else {
            // parse line
            f.code += line
          }
        } else {
          f = ParseJS.getFunction(line)
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

  static parseFunctionMatch(line, match) {
    const startIndex = match[0].length
    return {
      indent: ParseJS.getIndent(line),
      name: match[1],
      params: match[2] ? match[2].split(',').map(param => param.trim()) : null,
      // add the remainder of the line as code
      code: line.substring(startIndex, line.length),
    }
  }

  // ReGeX Ops (Top Secret)
  //
  
  static getFunction(line) {
    // anonymous
    let match = line.match(new RegExp('[a-zA-Z]* *([a-zA-Z]+) *= *\\(([a-zA-Z]*[, *[a-zA-Z]*]*)\\) *=> *{', 'gi'))
    if (match) {
      return ParseJS.parseFunctionMatch(line, match)
    }
    // regular and class
    match = line.match(new RegExp('[a-zA-Z]* *([a-zA-Z]+) *\\(([a-zA-Z]*[, *[a-zA-Z]*]*)\\) *{', 'i'))
    if (match) {
      return ParseJS.parseFunctionMatch(line, match)
    }
    return null
  }
  static isFunctionEnd(line, indent) {
    // check if a curly exists with the same indent as the function declaration
    return !!line.match(new RegExp('^ {'+indent+'}}', 'gi'))
  }
  static getIndent(line) {
    // count the number of spaces from the start
    return line.match(/^ */gi)[0].length
  }

  // get everything in the line before the closing curly brace '}'
  static beforeFunctionClose(fName, line) {
    return line.match(/^( *)}/i)
  }

  // fCode: string representing an anonymous function compatible with f-modules
  static parseParams(fCode) {
    const matches = fCode.match(/^.*\((.*)\) *=>/i)
    if (!matches) {
      return {required: {}, optional: []}
    }

    let params = matches[1].split(',')
    params = params.map(param => param.trim())
    const required = params.filter(param => !param.includes('='))
    const optional = params.filter(param => param.includes('='))
    return {required, optional}
  }
}
