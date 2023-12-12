export function setupHideables() {
  for (const hideElem of document.getElementsByClassName('hideable')) {
    // setup elem
    hideElem.hide = () => {
      hideElem.hidden = true
      hideElem.style.display = `none`
    }
    hideElem.show = (type='block') => {
      hideElem.hidden = false 
      hideElem.style.display = type
    }
  }
}
