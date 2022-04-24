class UtilJS {

  // match 1 is everything before the function start curly
  // match 2 is the function name
  // match 3 is a list of function parameters
  static parseFunctionMatch(line, state, match) {
    // parse and setup code 
    const startIndex = match[1].length
    let code = line.substring(startIndex, line.length)

    // get the function name
    const functionName = match[2]
    const isConstructor = functionName === "constructor"

    // construct parameters
    let params = ['x']

    if (state.c) {

      // add a special case for constructors
      if (isConstructor) {
        // create an object with the instance name in the code
        code = `${code}  const ${state.c.name} = {}\n`

      } else {
        // add class parameters
        params.push('_')
        params.push(state.c.name)
      }
    }

    // add existing parameters
    params.push(match[3] ?? null)

    // construct parameter string
    code = ParseJS.addHeader(code, params)

    // format the match as module options 
    return {
      name: ParseJS.toNormalCase(`${state.c.name} ${functionName}`),
      params: ParseJS.parseParams(code),
      code: code,
      constructor: isConstructor ? true : undefined,
    }
  }


  // More stuff from index.js will be added here
}
