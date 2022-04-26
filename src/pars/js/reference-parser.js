class ParseJSModuleToChunks extends ItemParser {

  constructor(code, existingReferences=[]) {
    super(code.split('\n'))
    this.references = []
    this.codeChunks = ['']
    this.exists = (ref) => existingReferences.includes(ref)
  }

  parseItem(line) {
    const ref = this.parseReference(line)
    this.parseCodeBlock(line, ref)
  }

  getResult() {
    return {
      references: this.references,
      codeChunks: this.codeChunks,
    }
  }

  // HELPERS
  //

  addReference(ref) {
    this.references.push(ref)
  }

  nextChunk() {
    this.codeChunks.push('')
  }

  addCode(line) {
    this.codeChunks[this.codeChunks.length-1] += line
  }


  // PARSERS
  //
  
  parseReference(line) {
    const ref = InspectJS.getFunctionCall(line)
    if (ref && this.exists(ref.name)) {
      this.addReference(ref)
      return ref
    }
  }

  parseCodeBlock(line, ref) {
    if (ref) {
      this.nextChunk()
    } else {
      this.addCode(`${line}\n`)
    }
  }
}
