'use strict'
import * as THREE from 'three'
import * as nj from 'numjs'
import { HiCArray } from '../types/array'
import VisualComponent from './visualComponent'
import {
    isNdArray,
    arrayLength
} from '../utils/functions'

export type ChromosomeShapeType = 'circle' | 'square'
export type ChromosomeColor = THREE.Color

function Circle2D(radius: number, intervals: number = 10) {
    let pts = []
    for (let i = 0; i < intervals; i++) {
        let a = 2 * i / intervals * Math.PI
        pts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius))
    }
    return new THREE.Shape(pts)
}
const defaultExtrudeShape = Circle2D(1, 10)

export default class Chromosome extends VisualComponent {
    static instances: Chromosome[]
    mesh: THREE.Mesh
    path: any
    shape: THREE.Shape
    geometry: THREE.Geometry | THREE.BufferGeometry | null
    material: THREE.Material | null
    color: ChromosomeColor
    extrudeSettings: { [index: string]: any }
    shapeType: ChromosomeShapeType
    shapeOptions: { [index: string]: any }
    divisions: number

    constructor(data: Array<any> | nj.NdArray<any> | HiCArray,
        color: ChromosomeColor,
        shapeOptions?: { [index: string]: ChromosomeShapeType | number }) {
        super('three')
        this._data = data
        this.color = color
        shapeOptions = shapeOptions ? shapeOptions : {}
        this.shapeType = shapeOptions.shapeType as ChromosomeShapeType
        this.shapeOptions = shapeOptions
        this.divisions = shapeOptions.divisions as number



        this.init()
        if (!Chromosome.instances) {
            Chromosome.instances = []
        }
        Chromosome.instances.push(this)


    }
    init() {

        if (this.shapeType === 'circle') {
            this.shape = this.shapeOptions.radius
                ? Circle2D(this.shapeOptions.radius as number)
                : defaultExtrudeShape
        } else {
            this.shape = defaultExtrudeShape
        }
        this.generateMesh()
        super.init()
    }

    get generatePath(): THREE.Vector3[] {
        let vec: THREE.Vector3[] = []
        console.log(this.data,
            this.data instanceof HiCArray,
            isNdArray(this.data),
            this.data instanceof Array
        )
        if (this.data instanceof HiCArray) {

        } else if (isNdArray(this.data)) { // TODO change it to NdArray
            let _d = (this.data as nj.NdArray).tolist()
            for (let i in _d) {
                vec.push(new THREE.Vector3(...(_d[i] as unknown as Array<number>)))
            }
        } else if (this.data instanceof Array) {
            for (let i in this.data) {
                vec.push(new THREE.Vector3(...this.data[i]))
            }
        }
        return vec
    }
    generateMesh() {
        this._dispose()
        //console.log(this.generatePath())
        this.path = new THREE.CatmullRomCurve3(this.generatePath)

        this.extrudeSettings = {
            steps: this.path.points.length * (this.divisions ? this.divisions : 1),
            bevelEnabled: false,
            extrudePath: this.path
        }
        //console.log(this.shape, this.extrudeSettings)
        this.geometry = new THREE.ExtrudeBufferGeometry(this.shape, this.extrudeSettings)
        this.material = new THREE.MeshLambertMaterial({
            color: this.color.getHex(),
            wireframe: false
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.obj = this.mesh
    }
    protected _dispose() {

        if (this.path) { delete this.path }
        if (this.extrudeSettings) { delete this.extrudeSettings }
        if (this.geometry) { delete this.geometry }
        if (this.material) { delete this.material }
        if (this.mesh) { delete this.mesh }
        super._dispose()

    }
    dispose() {
        this._dispose()
        super.dispose()
    }
}
