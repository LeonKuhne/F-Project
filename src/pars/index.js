/*
 * Not sure why I called it index.js.
 *
 * Here you shall find methods that
 * may be useful for parsing any language.
 *
 * Good luck!
**/


class ParserUtil {

  // parse an uploaded file to a text string
  static readFile(file, callback) {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.addEventListener('load', () => {
      callback(reader.result)
    }, false)
  }
}
