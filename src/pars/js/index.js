
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
}
