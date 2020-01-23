'use strict'
import * as THREE from 'three'
import * as  uuidv4 from 'uuid/v4'
import Controller from './controller'
import OrbitController from './orbitController'
import VisualComponent from '../components/visualComponent'

export default class Stage3D {
    static instances: Stage3D[]
    id: string
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    cameras: THREE.Camera[]

    controllers: Controller[]

    parentDom: HTMLElement
    camPointLight: THREE.PointLight
    width: number
    height: number
    components: VisualComponent[]

    private _activeCamera: THREE.Camera
    private _activeController: Controller
    constructor() {
        this.id = uuidv4()
        this.components = []
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
        this.initLight()
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
        const ac = this.activeCamera
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
        this._activeController = this.controllers[-1]
        console.log(this.activeController)
    }
    initLight() {
        this.camPointLight = new THREE.PointLight(0xffffff)
        this.camPointLight.position.set(0, 0, 0)
        // this.camPointLight.position.copy(this.activeCamera.position)
    }
    get activeCamera(): THREE.Camera {
        if (!this._activeCamera) {
            this._activeCamera = this.cameras[0]
        }
        return this._activeCamera
    }
    get activeController() {
        if (!this._activeController) {
            this._activeController = this.controllers[0]
        }
        return this._activeController
    }
    render(time: any) {
        const r = this.renderer
        r.setClearColor(0x000000, 0)
        r.setViewport(0, 0, this.width, this.height)
        // console.log(this.updateFunctions)
        r.render(this.scene, this.activeCamera)
        // comment this.camPointLight.position.copy(this.activeCamera.position)
        if (this.activeController.update) {
            this.activeController.update(time)
            this.activeController.camera.updateMatrixWorld()
        }
        for (let i in this.components) {
            this.components[i].render()
        }

    }

    dispose() {

    }

    addComponents(c: VisualComponent) {
        if (c.renderEnv === 'three') {
            console.log(c)
            this.scene.add(c.obj)
            this.components.push(c)
        }
    }
}
