'use strict';


class Template {

  static hideTemplates() {
    const elems = document.getElementsByClassName('template')
    for (const templateElem of elems) {
      templateElem.classList.add('hidden')
    }
  }

  // update an html element with template properties
  static apply(id, elem, template) {
    // rename
    elem.id = id
    elem.classList.remove('template')
    elem.classList.remove('hidden')

    // swap out variables with properties from template
    for (const [attr, value] of Object.entries(template)) {
      elem.innerHTML = elem.innerHTML.replaceAll(`{${attr}}`, value)
    }

    // collect callback references
    const callbacks = {}
    for (const childElem of elem.children) {
      const action = childElem.getAttribute('onclick')
      // match curly braces; ie. '{someKey}'
      if (action.match(/^{[a-zA-Z0-9-_]*}$/g)) {
        const key = action.replace(/{|}/g, '')
        childElem.onclick = (e) => {
          const callback = callbacks[key]
          if (callback) {
            callback(e)
          } else {
            console.warn(`Callback ${key} is not defined for elem #${id}`)
          }
        }
      }
    }
    return callbacks
  }
}
