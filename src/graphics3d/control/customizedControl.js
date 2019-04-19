import { Vector3,
	 Euler,
	 Object3D } from 'three'
class CControls {
  constructor (camera, domElement, enabled = false) {
    this.camera = camera

    this.baseDOM = (domElement !== undefined) ? domElement : document

    this.enabled = enabled
    this.enableKeys = true
    this.enableZoom = true
    this.zoomSpeed = 0.95
    this.target = new Vector3()
    this.mouseMovementSensitivity = 0.005
    this.keySpeed = 0.5
    this.keys = {
      W: 87,
      A: 65,
      S: 83,
      D: 68,
      UpArrow: 38,
      LeftArrow: 37,
      DownArrow: 40,
      RightArrow: 39
    }
    this.PI_2 = Math.PI / 2
    this.translation = {
      up: new Vector3(1, 0, 0),
      down: new Vector3(-1, 0, 0),
      left: new Vector3(0, 0, 1),
      right: new Vector3(0, 0, -1)
    }

    if (this.enabled === true) {
      this.init()
    }

    const controller = this
    this.listeners = { }
  }
  init () {
    this.camera.rotation.set(0, 0, 0)
    this.camera.position.set(0, 0, 300)
    this.cameraFront = new Vector3(0, 0, -1)
    this.leastFrameInterval = 50
    this.delta = 0
    this.rotateEuler = new Euler(0, 0, 0, 'YXZ')
    this.initMouseMove()
    this.initKeyDown()
    this.initWheel()
    this.initMouseDown()
  }

  initMouseMove () {
    const controller = this
    this.baseDOM.addEventListener('mousemove', function _mousemove (e) {
      controller.listeners.mousemove = _mousemove
      return controller.handleMouseMove(e)
    }, false)
  }
  initWheel () {
    const controller = this
    if (this.enableZoom === false) return
    this.baseDOM.addEventListener('wheel', function _wheel (e) {
      controller.listeners.wheel = _wheel
      return controller.handleMouseScroll(e)
    }, false)
  }
  initKeyDown () {
    // This is a hacky method to change `this` direction
    // Using the closure properties
    // The _keydown function add to `this`.listeners in case of removing
    // emmm
    const controller = this
    if (this.enableKeys === false) return
    window.addEventListener('keydown', function _keydown (e) {
      controller.listeners.keydown = _keydown
      return controller.handleKeyDown(e)
    }, false)
  }
  initMouseDown () {
    const controller = this
    this.baseDOM.addEventListener('mousedown', function _mousedown (e) {
      controller.listeners.mousedown = _mousedown
      return controller.handleMouseDown(e)
    }, false)
  }

  update (time) {
    //    console.log(this.t)
    if (!this.lastTime) {
      // First time init
      this.lastTime = time
    } else {
      this.delta = time - this.lastTime
      // if not exceed the frame interval, return
      if (time - this.lastTime < this.leastFrameInterval) {
        return
      } else {
        this.lastTime = time
      }
    }
    // console.log(this.cameraFront, this.rotateEuler)
    this.cameraFront.applyEuler(this.rotateEuler)
    this.rotateEuler.x = 0
    this.rotateEuler.y = 0
    // console.log(time)
    this.camera.lookAt(this.camera.position.clone()
		       .add(this.cameraFront))
    // this.yawObject.position.copy(this.translationOffset)
    this.camera.updateProjectionMatrix()
  }

  handleMouseDown (e) {
    if (this.enabled !== true) return
    event.preventDefault()
    const controller = this
    this.baseDOM.addEventListener('mouseup', function _mouseup (e) {
      controller.listeners.mouseup = _mouseup
      return controller.handleMouseUp(e)
    }, false)
    this.moveFlag = true
  }
  handleMouseUp (e) {
    if (this.enabled !== true) return
    this.moveFlag = false
    this.baseDOM.removeEventListener('mouseup', this.listeners.mouseup)
  }
  handleMouseMove (e) {
    if (this.enabled !== true) return
    let movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
    let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0
    if (this.moveFlag === true) {
      // yaw
      this.rotateEuler.x = movementY * this.mouseMovementSensitivity
      // pitch
      this.rotateEuler.y = movementX * this.mouseMovementSensitivity
      // constrain pitch
      this.rotateEuler.y = Math.max(-this.PI_2,
				     Math.min(this.PI_2,
					       this.rotateEuler.y))
    }
    // console.log(this.moveFlag, movementX, movementY, this.rotateEuler)
  }
  handleMouseScroll (e) {
    if (this.enabled !== true) return
    // console.log(this.camera.scale)
    if (e.deltaY < 0) {
      if (this.camera.isPerspectiveCamera) {
        this.camera.fov *= this.zoomSpeed
      }
    } else if (e.deltaY > 0) {
      if (this.camera.isPerspectiveCamera) {
        this.camera.fov /= this.zoomSpeed
      }
    }
  }
  handleKeyDown (e) {
    if (this.enabled !== true) return
    console.log('look', e.keyCode)
    switch (e.keyCode) {
      case this.keys.W:
      case this.keys.UpArrow:
        this.camera.position.add(this.cameraFront.clone()
			       .multiplyScalar(this.keySpeed)
			       .multiplyScalar(this.delta))
        break
      case this.keys.S:
      case this.keys.DownArrow:
        this.camera.position.sub(this.cameraFront.clone()
			       .multiplyScalar(this.keySpeed)
			       .multiplyScalar(this.delta))
        break
      case this.keys.A:
      case this.keys.LeftArrow:
        this.camera.position.sub(new Vector3().crossVectors(this.cameraFront,
							  this.camera.up)
			       .normalize()
			       .multiplyScalar(this.keySpeed)
			       .multiplyScalar(this.delta))
        break
      case this.keys.D:
      case this.keys.RightArrow:
        this.camera.position.add(new Vector3().crossVectors(this.cameraFront,
							  this.camera.up)
			       .normalize()
			       .multiplyScalar(this.keySpeed)
			       .multiplyScalar(this.delta))
        break
    }
    console.log(this.delta)
    // this.camera.position.copy(this.cameraObject.position)
    // this.camera.lookAt(this.target)
    // this.cameraObject.updateProjectionMatrix()

    // console.log(this.camera)
  }
  dispose () {
    window.removeEventListener('keydown', this.listeners.keydown)
    this.baseDOM.removeEventListener('mousemove', this.listeners.mousemove)
    this.baseDOM.removeEventListener('wheel', this.listeners.wheel)
    this.baseDOM.removeEventListener('mousedown', this.listeners.mousedown)
    this.lastTime = undefined
  }
}

export { CControls }
