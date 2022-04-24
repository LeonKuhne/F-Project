
/**
 * The entry file for the JS parser.
 * This should only contain the methods f needs to interact with and no more.
 *
 * Thank you, have a nice day.
**/


class ParseJS {

  /*
   * Construct 'options' which are a parameter of the Module class
   * TODO rename this to findFunctions and make it yield (generator)
   *
   * onLoad: callback to this with module options as functions are loaded
   */
  static loadFunctions(file, onLoad=()=>{}) {
    // find the functions
    Parser.readFile(file, text => {
      // parse file into functions
      const fileParser = new ParseFileJS(text)
      fileParser.parseAll()
      const functions = fileParser.getOptions()

      // parse functions into module options
      for (const options of functions) {
        const parser = new ParseFunctionJS(options.code, options.inClass)
        parser.parseAll()

        // callback with module options
        onLoad(parser.moduleOptions())
      }
    })
  }

  /*
   * Split a method by its calls to other methods, into multiple methods with no
   * calls to other methods.
   *
   * code: a string optionally containing newline characters which to split from
   * getParams: takes in a method name and returns its parameters if it exists, 
   *    otherwise null
   */
  static splitByCalls(code, getParams) {
    const parts = []
    const lines = code.split('\n')
    const returnParam = ParseJS.getReturn(code)

    // leave if nothing to parse
    if (lines.length === 0) {
      return null
    } else if (lines.length === 1) {
      return [{ code: code }]
    }

    // remove header line
    let headerParams = []
    const params = ParseJS.parseParams(lines.shift())
    headerParams = params.required.concat(params.optional)


    // loop through the lines, adding code into part buckets
    let idx = 0
    for (const line of lines) {
      // start a new code part bucket
      if (idx === parts.length) {
        parts.push({ code: '' })
      }
      let part = parts[idx]

      // check if line is a call to reference
      const ref = ParseJS.getFunctionCall(line)
      if (ref && getParams(ref.name)) {

        // finalize the code
        let inputParams = headerParams
        if (idx !== 0 && !returnParam) {
          inputParams = inputParams.concat(returnParam)
        }
        part.code = ParseJS.finalizeCode(part.code, inputParams)

        // update the reference params
        if (returnParam) {
          part.code = ParseJS.addReturn(part.code, returnParam)
        }

        // move to next code part bucket
        part.name = ref.name
        idx++
      } else if (line.trim()) {
        // add to code part bucket
        part.code += `${line}\n`
      }
    }

    // finalize the remaining code
    const lastPart = parts[parts.length - 1]
    const inputParams = idx === 0 || !returnParam ? headerParams : headerParams.concat(returnParam)
    lastPart.code = ParseJS.addHeader(lastPart.code, inputParams)

    return parts
  }
}
