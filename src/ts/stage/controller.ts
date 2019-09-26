
import * as THREE from 'three';

export default class Controller extends THREE.EventDispatcher {
    // Constructing parameters
    public object: THREE.PerspectiveCamera | THREE.OrthographicCamera
    public camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
    public domElement: Element
    public controllerType: string

    public update: any

    // Public properties
    public enabled: boolean
    public target: THREE.Vector3

    public minDistance: number
    public maxDistance: number

    public minZoom: number
    public maxZoom: number

    public minPolarAngle: number
    public maxPolarAngle: number

    public minAzimuthAngle: number
    public maxAzimuthAngle: number

    public enableDamping: boolean
    public dampingFactor: number

    public enableZoom: boolean
    public zoomSpeed: number

    public enableRotate: boolean;
    public rotateSpeed: number;
    public enablePan: boolean;
    public panSpeed: number;
    public screenSpacePanning: boolean;
    public keyPanSpeed: number;

    public autoRotate: boolean;
    public autoRotateSpeed: number;


    public enableKeys: boolean;
    public keys: { [index: string]: number };

    public mouseButtons: { [index: string]: any };

    public target0: THREE.Vector3;
    public position0: THREE.Vector3;
    public zoom0: number;


    public changeEvent: { "type": string }
    public startEvent: { "type": string }
    public endEvent: { "type": string }

    public STATE: { [index: string]: -1 | 0 | 1 | 2 | 3 | 4 }


    public state: -1 | 0 | 1 | 2 | 3 | 4

    public EPS: number

    // current position in spherical coordinates
    public spherical: THREE.Spherical
    public sphericalDelta: THREE.Spherical

    public scale: number
    public panOffset: THREE.Vector3
    public zoomChanged: boolean

    public rotateStart: THREE.Vector2
    public rotateEnd: THREE.Vector2
    public rotateDelta: THREE.Vector2

    public panStart: THREE.Vector2
    public panEnd: THREE.Vector2
    public panDelta: THREE.Vector2

    public dollyStart: THREE.Vector2
    public dollyEnd: THREE.Vector2
    public dollyDelta: THREE.Vector2


    constructor(object: THREE.PerspectiveCamera | THREE.OrthographicCamera, domElement: Element) {
        super()
        this.controllerType = 'controller:base'
        this.object = object
        this.camera = this.object
        this.domElement = (domElement !== undefined) ? domElement : document.body;

        this.changeEvent = { type: 'change' };
        this.startEvent = { type: 'start' };
        this.endEvent = { type: 'end' };

        this.STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4 };

        this.state = this.STATE.NONE;

        this.EPS = 0.000001;

        // current position in spherical coordinates
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();

        this.scale = 1;
        this.panOffset = new THREE.Vector3();
        this.zoomChanged = false;

        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();

        this.panStart = new THREE.Vector2();
        this.panEnd = new THREE.Vector2();
        this.panDelta = new THREE.Vector2();

        this.dollyStart = new THREE.Vector2();
        this.dollyEnd = new THREE.Vector2();
        this.dollyDelta = new THREE.Vector2();


    }
}
