'use strict'

class HiCEvent {
  constructor () {

  }
  attr (name, val) {
    if (typeof val === 'object') {
      this[name] = Object.assign(val)
    } else {
      this[name] = val
    }

    return this
  }
}

export { HiCEvent }
