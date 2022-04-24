/**
 * Essentially Setters
 *
 * Modify code, with code.
 * Software engineering is the philosophy of code.
**/

class BuildJS {

  static toNormalCase(str) {
    // change from 'thisCasing' to 'this casing'
    str = str.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
    // change from 'this.casing' to 'this casing'
    str = str.replace(/\./g, ' ').toLowerCase()
    return str 
  }

  static finalizeCode(code, paramList) {
    code = ParseJS.addHeader(code, paramList)
    code = ParseJS.closeFunction(code)
    return code
  }


  static addHeader(code, params) {
    const paramStr = params.filter(p=>p).join(', ')
    return `(${paramStr}) => {\n${code}`
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

  static addReturn(code, returnParam) {
    const returnCode = `  return ${returnParam}`

    const lines = code.split('\n')
    if (lines.length > 0) {
      lines.splice(lines.length-1, 0, returnCode)
    }
    return lines.join('\n')
  }

  static closeFunction(code) {
    return code + `}`
  }
}
