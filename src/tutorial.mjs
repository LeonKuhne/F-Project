export class Tutorial {
  constructor(state) {
    this.state = state
    this.elem = document.getElementById('tutorial')
    this.elem.addEventListener('click', e => {
      this.elem.show()
    })
  }
  start() {
    console.log("showing tutorial")
    this.elem.show()
  }
}