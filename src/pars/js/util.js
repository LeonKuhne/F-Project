class UtilJS {

  // match 1 is everything before the function start curly
  // match 2 is the function name
  // match 3 is a list of function parameters
  static parseFunctionMatch(line, match, className=null) {
    // parse and setup code 
    const startIndex = match[1].length
    let code = line.substring(startIndex, line.length)

    // get the function name
    let name = match[2]
    const isConstructor = name === "constructor"

    // construct parameters
    let params = ['x']

    if (className) {

      // add a special case for constructors
      if (isConstructor) {
        // create an object with the instance name in the code
        code = `${code}  const ${className} = {}\n`

      } else {
        // add class parameters
        params.push('_')
        params.push(className)
      }

      name = `${className} ${name}`
    }

    // add existing parameters
    params.push(match[3] ?? null)

    // construct parameter string
    code = BuildJS.addHeader(code, params)

    // format the match as module options 
    return {
      name: BuildJS.toNormalCase(name),
      params: InspectJS.parseParams(code),
      code: code,
      constructor: isConstructor ? true : undefined,
    }
  }
}
