class UtilJS {

  static getAnyFunction(line, className=null) {
    // multiple ordered header functions to try
    const getters = [
      className ? InspectJS.getClassFunction : null,
      // TODO
      //InspectJS.getFunction,
      //InspectJS.getAnonFunction,
    ]

    // find and return the first header found
    for (const getFunction of getters) {
      if (getFunction) {
        const match = getFunction(line, className)
        if (match) {
          return UtilJS.parseFunctionMatch(line, match)
        }
      }
    }
  }

  // match 1 is everything before the function start curly
  // match 2 is the function name
  // match 3 is a list of function parameters
  static parseFunctionMatch(line, match) {
    // parse and setup code 
    const startIndex = match[1].length
    let code = line.substring(startIndex, line.length)

    // get the function name
    let name = match[2]

    // construct parameters
    let params = ['x']

    // add existing parameters
    params.push(match[3] ?? null)

    // construct parameter string
    code = BuildJS.addHeader(code, params)

    // format the match as module options 
    return {
      name: BuildJS.toNormalCase(name),
      params: InspectJS.parseParams(code),
      code: code,
    }
  }
}
