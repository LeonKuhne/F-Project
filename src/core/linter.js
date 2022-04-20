'use strict';

class Linter {
  constructor(inputElem, outputElem) {
    this.inputElem = inputElem
    this.outputElem = outputElem

    // listen for actions
    this.inputElem.addEventListener('input', e => {
      this.lint()
    })
    this.inputElem.onscroll = this.syncScroll
  }

  lint() {
    // Update code output text
    this.outputElem.textContent = this.inputElem.value;

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
