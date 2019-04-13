/*
 * @Description: 
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-29 02:24:30
 * @LastEditTime: 2019-04-14 01:32:40
 */

'use strict'

/**
 * HiC Event
 *
 * @class HiCEvent
 */
class HiCEvent {

  /**
   *Creates an instance of HiCEvent.
   * @memberof HiCEvent
   */
  constructor () {

  }

  /**
   * Add a {name:val} to HiC Event
   *
   * @param {String} name
   * @param {*} val
   * @returns {HiCEvent}
   * @memberof HiCEvent
   */
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
