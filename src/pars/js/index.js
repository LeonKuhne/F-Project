
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
    ParserUtil.readFile(file, text => {
      // parse file into functions
      const functions = (new ParseJSFileToFunctions(text)).run()

      console.debug(`Found functions in ${file.name}`, functions)

      // parse functions into module options
      for (const options of functions) {
        const moduleOptions = (new ParseJSFunctionToModule(options.f, options.className)).run()

        // callback with module options
        onLoad(moduleOptions)
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
  static splitByCalls(code, modules) {
    // TODO remove this function completely

    const parts = []
    const lines = code.split('\n')
    const returnParam = InspectJS.getReturn(code)

    // leave if nothing to parse
    if (lines.length === 0) {
      return null
    } else if (lines.length === 1) {
      return [{ code: code }]
    }

    // remove header line
    let headerParams = []
    const params = InspectJS.parseParams(lines.shift())
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
      const ref = InspectJS.getFunctionCall(line)
      if (ref && getParams(ref.name)) {

        // finalize the code
        let inputParams = headerParams
        if (idx !== 0 && !returnParam) {
          inputParams = inputParams.concat(returnParam)
        }
        part.code = BuildJS.finalizeCode(part.code, inputParams)

        // update the reference params
        if (returnParam) {
          part.code = BuildJS.addReturn(part.code, returnParam)
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
    lastPart.code = BuildJS.addHeader(lastPart.code, inputParams)

    return parts
  }
}
