'use strict'
import * as THREE from 'three'
import * as  uuidv4 from 'uuid/v4'
import Controller from './controller'
import OrbitController from './orbitController'

export default class Stage3D {
    static instances: Stage3D[]
    id: string
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    cameras: THREE.Camera[]
    activeCamera: THREE.Camera
    controllers: Controller[]
    activeController: Controller
    parentDom: HTMLElement
    width: number
    height: number
    constructor() {
        this.id = uuidv4()
        if (!Stage3D.instances) {
            Stage3D.instances = []
        }
        Stage3D.instances.push(this)
        this.init()
        function animate(time: any) {
            requestAnimationFrame(animate)
            Stage3D.each(instance => {
                instance.render(time)
            })
        }
        animate(0)
    }
    static each(f: (...args: any[]) => void): void {
        Stage3D.instances.forEach(f)
    }
    init() {
        this.bindElement()
        this.initScene()
        this.initCamera()
        this.initController()
    }

    bindElement() {
        this.parentDom = document.getElementById('3d')
        this.width = this.parentDom.getBoundingClientRect().width
        this.height = this.parentDom.getBoundingClientRect().height
    }
    initScene() {
        this.scene = new THREE.Scene()
        this.scene.add(new THREE.AxesHelper(20))
        this.scene.background = new THREE.Color(0xfff0f0)
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.width, this.height)
        this.renderer.gammaInput = true
        this.renderer.gammaOutput = true;
        (this.renderer.domElement.style as { [index: string]: any }).tabindex = 1
        this.parentDom.appendChild(this.renderer.domElement)
    }
    initCamera() {
        if (!this.cameras) {
            this.cameras = []
        }
        this.cameras.push(new THREE.PerspectiveCamera(50, this.width / this.height, 1, 3000))
        const ac = this.getActiveCamera()
        ac.position.set(0, 0, 300)
        ac.lookAt(0, 0, 0)
        ac.layers.enable(0)

    }
    initController() {
        this.controllers = []
        let orbitController = new OrbitController(this.activeCamera as THREE.PerspectiveCamera, this.renderer.domElement)
        orbitController.minDistance = 5
        orbitController.maxDistance = 2000
        orbitController.enablePan = false
        orbitController.enableDamping = true
        orbitController.dampingFactor = 0.25
        this.controllers.push(orbitController)
        this.activeController = this.controllers[-1]
        console.log(this.activeController)
    }
    getActiveCamera() {
        if (!this.activeCamera) {
            this.activeCamera = this.cameras[0]
        }
        return this.activeCamera
    }

    render(time: any) {
        const r = this.renderer
        r.setClearColor(0x000000, 0)
        r.setViewport(0, 0, this.width, this.height)
        // console.log(this.updateFunctions)
        r.render(this.scene, this.getActiveCamera())

    }
}
