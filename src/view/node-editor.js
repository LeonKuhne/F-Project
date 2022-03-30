'use strict';

class NodeEditor {
  constructor(state) {
    this.state = state
    this.state.editor.node = this

    // load ui elements
    this.state.elem = {
      ...this.state.elem,
      editor: document.getElementById('editor'),
      // semantics
      nameIndicator: document.getElementById('name'),
      nameInput: document.getElementById('name-input'),
      // program
      codeContainer: document.getElementById('code-container'),
      codeArea: document.getElementById('code'),
      codeOutput: document.getElementById('code-output'),
      nodeResultContainer: document.getElementById('node-result-container'),
      nodeRunIdLabel: document.getElementById('node-run-id'),
      nodeInputArea: document.getElementById('node-input'),
      nodeResultArea: document.getElementById('node-result'),
      totalResultContainer: document.getElementById('total-result-container'),
      totalRunIdLabel: document.getElementById('total-run-id'),
      totalResultArea: document.getElementById('total-result'),
      // actions
      collapseButton: document.getElementById('collapse'),
      runButton: document.getElementById('run'),
      saveButton: document.getElementById('save'),
    }
    let elem = this.state.elem

    // create dependencies
    this.runner = new CodeRunner(this.state)
    this.linter = new Linter(
      this.state,
      elem.codeArea,
      elem.codeOutput,
      (code) => this.setCode(this.state.selected.node, code)
    )
    // NOTE: anonymous callbacks are needed to use class state; ie 'this'
    var manager = new NodeManager(this.state, {
      selectNode: (...args) => this.selectNode(...args),
      deselectNode: (...args) => this.deselectNode(...args),
      selectAnything: () => this.show(),
      selectNothing: () => this.hide(),
    })
    this.state.manager.node = manager

    // class state
    var dragging = null // nodel event containing a node
    this.editingName = false

    //
    // ACTIONS

    // collapse the node group
    elem.collapseButton.onclick = () => {
      const node = this.state.selected.node
      this.state.nodel.manager.toggleGroup(node.id)
    }

    // run the code
    elem.runButton.onclick = () => this.runCode(this.state.selected.node)

    // save the code
    elem.saveButton.onclick = () => {
      const node = this.state.selected.node
      const moduleManager = this.state.manager.module

      // save the node and/or node group
      moduleManager.save(node)
    }
    
    //
    // INTERACTIONS

    // edit node name
    elem.nameIndicator.addEventListener("click", () => {
      this.editName(true)
    })
    elem.nameInput.addEventListener("keyup", e => {
      this.saveName()
      this.updateName(this.state.elem.nameInput.value)

      if (e.key === 'Enter') {
        this.editName(false)
      }
    })

    const nl = this.state.nodel.listener
    // create node/group from selected module
    nl.on('dblclick', e => {
      const module = this.state.selected.module
      if (!module) {
        console.error(`No module is selected`)
        return
      } 

      manager.createNode(module, e.x, e.y)
    })

    // support dragging
    const isDraggedOnDifferent = node => {
      return dragging && node && dragging.node.id !== node?.id
    }

    // start dragging
    nl.on('mousedown', e => {
      if (e.node) {
        dragging = e
      }

      // update name field when clicked off input
      if (this.editingName) {
        this.saveName()
        this.updateName(this.state.elem.nameInput.value)
        this.editName(false)
      }
    })

    // indicate dragging using cursor
    nl.on('mousemove', e => {
      if (dragging) {
        if (isDraggedOnDifferent(e.node)) {
          elem.nodel.style.cursor = 'copy'
        } else {
          elem.nodel.style.cursor = 'move'
        }
      }
    })

    // drag release
    nl.on('mouseup', e => {
      // support connecting nodes
      if (isDraggedOnDifferent(e.node)) {
        nm.toggleConnect(dragging.node.id, e.node.id)

      // move node
      } else if (dragging && !e.node) {
        console.info('moving node', e.x, e.y)
        nm.moveNode(dragging.node.id, e.x, e.y)

      // select/deselect node
      } else {
        manager.engage(e.node)
      }

      // reset
      elem.nodel.style.cursor = 'default'
      dragging = null
    })

    // listen for changes
    nm.onDraw(() => {
      this.selectNode(this.state.selected.node)
    })
  }

  //
  // NODE INTERACTIONS

  selectNode(node) {
    if (!node) {
      return
    }

    // indicate selected node
    const selectedElem = document.getElementById(node.id)
    const elems = this.state.elem
    selectedElem.classList.add('selected')

    // update editor elements
    elems.nameIndicator.innerHTML = node.data.name || node.id

    // render groups differently
    if (node.isGroup(true)) {
      elems.codeContainer.hidden = true
    } else {
      elems.codeContainer.hidden = false
      elems.codeArea.value = node.data.code
      this.linter.lint()
    }

    this.updateName()

    // update button text
    this.updateCollapsedButton(node)

    // update the result
    this.updateNodeResult(node)

    console.info(`Selecting ${node.id}`)
  }

  deselectNode(node) {
    // indicate deselected node
    const elem = document.getElementById(node.id)
    elem.classList.remove('selected')
    console.info(`Deselecting ${node.id}`)
  }

  updateCollapsedButton(node) {
    let button = this.state.elem.collapseButton
    if (node.group.collapsed) {
      button.innerText = button.getAttribute('on')
    } else {
      button.innerText = button.getAttribute('off')
    }
  }


  //
  // EDITOR INTERACTIONS

  show() {
    // show the editor
    editor.show('flex')
  }

  hide() {
    const elem = state.elem

    // hide editor and reset editor elements
    elem.editor.hide()
    elem.codeArea.value = ''
    elem.nameIndicator.innerHTML = ''
    this.linter.lint('')
  }

  //
  // PROGRAM

  setCode(node, code) {
    node.data.code = code
  }

  runCode(node) {
    if (!node) {
      console.log("no start node selected")
      return
    }

    // collect state
    const totalResultArea = this.state.elem.totalResultArea
    const responses = this.runner.run(node)

    // render 
    let responseText = ""
    for (const res of responses) {
      responseText += JSON.stringify(res) + "\n"
    }
    this.updateTotalResult(node.data.runId, responseText)
    this.updateNodeResult(node)
  }

  updateTotalResult(runId, result) {
    const totalResultContainer = this.state.elem.totalResultContainer
    const totalRunIdLabel = this.state.elem.totalRunIdLabel
    const totalResultArea = this.state.elem.totalResultArea
    totalRunIdLabel.innerText = `program ${runId} output`
    totalResultArea.value = result
    totalResultContainer.show()
  }

  updateNodeResult(node) {
    const elems = this.state.elem
    if (node.data.result === undefined) {
      elems.nodeResultContainer.hide()
    } else {
      elems.nodeRunIdLabel.innerText = 'deamon ' + node.data.runId
      elems.nodeInputArea.value = '' + JSON.stringify(node.data.param)
      elems.nodeResultArea.value = '' + JSON.stringify(node.data.result)
      elems.nodeResultContainer.show()
    }
  }

  //
  // NAME INTERACTIONS

  editName(editing) {
    const elems = this.state.elem
    const node = this.state.selected.node
    const nodeElem = document.getElementById(this.state.selected.node.id)
    const input = elems.nameInput
    const label = elems.nameIndicator

    // update the state
    this.editingName = editing

    if (this.editingName) {
      input.value = label.innerText
      input.show()
      label.hide()
    } else {
      const name = input.value
      input.hide()
      label.show()
    }
  }

  updateName(name=null) {
    // use the selected node by default
    const node = this.state.selected.node
    name = name || node.data.name || node.id
    // get elements
    const nodeElem = document.getElementById(node.id)
    const label = this.state.elem.nameIndicator
    const input = this.state.elem.nameInput
    // set element properties
    input.value = name
    label.innerText = name
    nodeElem.innerText = name
  }

  saveName() {
    const name = this.state.elem.nameInput.value
    const node = this.state.selected.node

    if (node.group.collapsed) {
      // name the group
      this.state.nodel.manager.createGroup(node.id, name)

    } else {
      // name the node
      node.data.name = name 
    }
  }
}
