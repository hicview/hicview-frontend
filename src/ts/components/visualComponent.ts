'use strict'
import * as uuidv4 from 'uuid/v4'
import * as _ from 'lodash'
import * as THREE from 'three'

import ComponentBase from './component'

type vComponentState = 0 | 1 | 2 | 3 | 4
type vComponentStateName = 'NONE' | 'INIT' | 'READY' | 'UPDATE' | 'DISPOSE'
type vComponentRenderEnv = 'three' | 'd3' | 'pixi'
type vComponentObjectType = THREE.Object3D

export default class VisualComponent extends ComponentBase {
    static instances: VisualComponent[]



    public renderEnv: vComponentRenderEnv
    public obj: vComponentObjectType

    protected childComponents: VisualComponent[]
    protected parentComponent: VisualComponent


    constructor(rEnv: vComponentRenderEnv) {
        super()
        this.renderEnv = rEnv

    }
    init() {
        super.init()
    }
    addChild(c: VisualComponent | VisualComponent[]) {


    }
    render() {
        for (let i in this.childComponents) {
            if (this.childComponents[i].renderEnv === this.renderEnv)
                this.childComponents[i].render()
        }
    }
    protected _update() {

    }
    protected _dispose() {
        _.remove(VisualComponent.instances, c => c === this)
    }

}
