'use strict';

class Linter {
  constructor(state, inputElem, outputElem, onlint=(code)=>{}) {
    this.inputElem = inputElem
    this.outputElem = outputElem

    // listen for actions
    this.inputElem.oninput = () => {
      this.lint()
      onlint(this.inputElem.value)
    }
    this.inputElem.onscroll = this.syncScroll
  }

  lint() {
    // Update code output text
    this.outputElem.innerHTML = this.inputElem.value;

    // Sync the scroll bars
    this.syncScroll()

    // Syntax Highlight
    hljs.highlightElement(this.outputElem)
  }

  syncScroll() {
    this.outputElem.scrollTop = this.inputElem.scrollTop;
    this.outputElem.scrollLeft = this.inputElem.scrollLeft;
  }
}
