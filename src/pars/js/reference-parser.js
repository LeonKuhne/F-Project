class ParseJSModuleToChunks extends ItemParser {

  constructor(code, existingReferences=[]) {
    super(code.split('\n'))
    this.chunksWithRefs = ['']
    this.exists = (ref) => existingReferences.includes(ref)
  }

  parseItem(line) {
    const ref = this.parseReference(line)

    if (ref) {
      this.addReference(ref)
      this.nextChunk()
    } else {
      this.addCode(`${line}\n`)
    }
  }

  getResult() {
    return this.chunksWithRefs
  }

  // HELPERS
  //

  addReference(ref) {
    this.chunksWithRefs.push(ref)
  }

  nextChunk() {
    this.chunksWithRefs.push('')
  }

  addCode(line) {
    this.chunksWithRefs[this.chunksWithRefs.length-1] += line
  }


  // PARSERS
  //
  
  parseReference(line) {
    const ref = InspectJS.getFunctionCall(line)
    if (ref && this.exists(ref.name)) {
      return ref
    }
  }
}
