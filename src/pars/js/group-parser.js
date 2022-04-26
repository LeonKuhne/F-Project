class ParseJSCodeBlocksToMap extends ItemParser {

  constructor(name, blocks, references) {
    super(blocks)
    this.name = name
    this.references = references
    this.mapHead = null
    this.currMap = null
  }

  parseItem(code) {
    this.addMap({
      id: this.idx ? `${this.name} #${this.idx}` : this.name,
      offsetX: 0,
      offsetY: 100,
      parents: this.currMap?.id ? [this.currMap.id] : [],
      children: [],
    })
  }

  getResult() {
    return this.mapHead
  }

  // HELPERS
  //

  addMap(map) {
    // if no group map exists, start with this one 
    if (!this.map) {
      this.mapHead = map
      this.currMap = this.mapHead

    // point the group map's child to this map
    } else {
      // update the map
      this.currMap.children = map
      // move the cursor
      this.currMap = map.children
    }
  }

  // PARSERS
  //
  
}
