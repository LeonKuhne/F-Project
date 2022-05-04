/**
 * Essentially Getters
 *
 * Here you shall find regular expressions, string
 * matching, and other simple read operations.
**/

class InspectJS {

  static getClass(line) {
    // get the class name
    const match = line.match(new RegExp('^ *class *([a-zA-Z]+) *{', 'i'))
    if (!match) return null

    // get the class name and change cassing to lower camelCase
    let name = match[1]
    name = name.charAt(0).toLowerCase() + name.slice(1)

    return {
      name: name
    }
  }

  static getClassFunction(line) {
    let regex = '(.* +([a-zA-Z]+) *\\(([a-zA-Z]*[, *[a-zA-Z]*(\=.*)?]*)\\) *{)'
    let match = line.match(new RegExp(regex, 'i'))
    return match ?? null
  }

  // TODO test
  static getFunction(line) {
    let match = line.match(new RegExp('^.function *[a-zA-Z]* *([a-zA-Z]+) *\\(([a-zA-Z]*[, *[a-zA-Z]*]*)\\) *{', 'i'))
    return match ?? null
  }

  // TODO test
  static getAnonFunction(line) {
    match = line.match(new RegExp('^.*[a-zA-Z]* *([a-zA-Z]+) *= *\\(([a-zA-Z]*[, *[a-zA-Z]*]*)\\) *=> *{', 'gi'))
    return match ?? null
  }

  // code: string representing an anonymous function compatible with f-modules
  static parseParams(code) {
    // only parse the first line
    let paramStr = code.split('\n')[0]
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

    // parheaderParamsse params into categories
    const required = params.filter(param => !param.includes('='))
    let optional = params.filter(param => param.includes('='))

    // parse out default values
    optional = optional.map(param => param.split('=')[0])


    return {required, optional}
  }

  static getIndent(line) {
    // count the number of spaces from the start
    return line.match(/^ */gi)[0].length
  }

  static getFunctionCall(line) {
    const match = line.match(/([a-zA-Z.]+)\((.*)\)/i)
    if (!match) return null

    // add dot parameters
    const params = match[2].split(',')
    const methodParts = match[1].split('.')
    params.push(methodParts.splice(0, methodParts.length-1))

    return {
      name: BuildJS.toNormalCase(match[1]),
      params: params.join(', '),
    }
  }


  static getReturn(code) {
    const match = code.match(/return (.*)/)
    return match ? match[1] : null
  }

  // get everything in the line before the closing curly 
  static beforeFunctionClose(line) {
    const match = line.match(/^(.*)}/i)
    return match ? match[1] : null
  }

  // check if a curly exists with the same indent as the start declaration
  static isEndCurly(line, indent) {
    return !!line.match(new RegExp('^ {'+indent+'}}', 'gi'))
  }
}
