/*
 * @Description: 
 * @Author: Hongpeng Ma
 * @Date: 2019-08-17 21:21:52
 * @Github: gitlab.com/hongpengm
 * @LastEditTime: 2019-08-18 12:21:04
 */

'use strict';

import * as THREE from 'three';
import Controller from './controller'



export default class OrbitController extends Controller {

    constructor(object: THREE.PerspectiveCamera | THREE.OrthographicCamera, domElement: Element) {
        super(object, domElement)
        var scope = this
        this.controllerType = 'controller:orbit'
        // Set to false to disable this control
        this.enabled = true;

        // "target" sets the location of focus, where the object orbits around
        this.target = new THREE.Vector3();

        // How far you can dolly in and out ( PerspectiveCamera only )
        this.minDistance = 0;
        this.maxDistance = Infinity;

        // How far you can zoom in and out ( OrthographicCamera only )
        this.minZoom = 0;
        this.maxZoom = Infinity;

        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
        this.minAzimuthAngle = - Infinity; // radians
        this.maxAzimuthAngle = Infinity; // radians

        // Set to true to enable damping (inertia)
        // If damping is enabled, you must call controls.update() in your animation loop
        this.enableDamping = false;
        this.dampingFactor = 0.25;

        // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
        // Set to false to disable zooming
        this.enableZoom = true;
        this.zoomSpeed = 1.0;

        // Set to false to disable rotating
        this.enableRotate = true;
        this.rotateSpeed = 1.0;

        // Set to false to disable panning
        this.enablePan = true;
        this.panSpeed = 1.0;
        this.screenSpacePanning = false; // if true, pan in screen-space
        this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

        // Set to true to automatically rotate around the target
        // If auto-rotate is enabled, you must call controls.update() in your animation loop
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

        // Set to false to disable use of the keys
        this.enableKeys = true;

        // The four arrow keys
        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

        // Mouse buttons
        this.mouseButtons = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT };

        // for reset
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;


        this.domElement.addEventListener('contextmenu', this.onContextMenu, false);

        this.domElement.addEventListener('mousedown', this.onMouseDown, false);
        this.domElement.addEventListener('wheel', this.onMouseWheel, false);

        this.domElement.addEventListener('touchstart', this.onTouchStart, false);
        this.domElement.addEventListener('touchend', this.onTouchEnd, false);
        this.domElement.addEventListener('touchmove', this.onTouchMove, false);

        window.addEventListener('keydown', this.onKeyDown, false);

        // force an update at start

        this.update();
    }

    public getPolarAngle() {
        return this.spherical.phi
    }

    public getAzimuthalAngle() {

        return this.spherical.theta;

    };

    public saveState() {

        this.target0.copy(this.target);
        this.position0.copy(this.object.position);
        this.zoom0 = this.object.zoom;

    };

    public reset() {

        this.target.copy(this.target0);
        this.object.position.copy(this.position0);
        this.object.zoom = this.zoom0;

        this.object.updateProjectionMatrix();
        this.dispatchEvent(this.changeEvent);

        this.update();

        this.state = this.STATE.NONE;

    };

    // this method is exposed, but perhaps it would be better if we can make it private...
    public update = ((): () => boolean => {
        var scope = this
        var offset = new THREE.Vector3();

        // so camera.up is the orbit axis
        var quat = new THREE.Quaternion().setFromUnitVectors(this.object.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().inverse();

        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();

        return function () {
            let position = scope.object.position;

            offset.copy(position).sub(scope.target);

            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion(quat);

            // angle from z-axis around y-axis
            scope.spherical.setFromVector3(offset);

            if (scope.autoRotate && scope.state === scope.STATE.NONE) {

                scope.rotateLeft(scope.getAutoRotationAngle());

            }

            scope.spherical.theta += scope.sphericalDelta.theta;
            scope.spherical.phi += scope.sphericalDelta.phi;

            // restrict theta to be between desired limits
            scope.spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, scope.spherical.theta));

            // restrict phi to be between desired limits
            scope.spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, scope.spherical.phi));

            scope.spherical.makeSafe();


            scope.spherical.radius *= scope.scale;

            // restrict radius to be between desired limits
            scope.spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, scope.spherical.radius));

            // move target to panned location
            scope.target.add(scope.panOffset);

            offset.setFromSpherical(scope.spherical);

            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion(quatInverse);

            position.copy(scope.target).add(offset);

            scope.object.lookAt(scope.target);

            if (scope.enableDamping === true) {

                scope.sphericalDelta.theta *= (1 - scope.dampingFactor);
                scope.sphericalDelta.phi *= (1 - scope.dampingFactor);

                scope.panOffset.multiplyScalar(1 - scope.dampingFactor);

            } else {

                scope.sphericalDelta.set(0, 0, 0);

                scope.panOffset.set(0, 0, 0);

            }

            scope.scale = 1;

            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8

            if (scope.zoomChanged ||
                lastPosition.distanceToSquared(scope.object.position) > scope.EPS ||
                8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > scope.EPS) {

                scope.dispatchEvent(scope.changeEvent);

                lastPosition.copy(scope.object.position);
                lastQuaternion.copy(scope.object.quaternion);
                scope.zoomChanged = false;

                return true;

            }

            return false;

        };

    })();

    public dispose() {

        this.domElement.removeEventListener('contextmenu', this.onContextMenu, false);
        this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
        this.domElement.removeEventListener('wheel', this.onMouseWheel, false);

        this.domElement.removeEventListener('touchstart', this.onTouchStart, false);
        this.domElement.removeEventListener('touchend', this.onTouchEnd, false);
        this.domElement.removeEventListener('touchmove', this.onTouchMove, false);

        document.removeEventListener('mousemove', this.onMouseMove, false);
        document.removeEventListener('mouseup', this.onMouseUp, false);

        window.removeEventListener('keydown', this.onKeyDown, false);

        //this.dispatchEvent( { type: 'dispose' } ); // should this be added here?

    };



    // private functions //////////////////////////////////////////////////////
    // some event handlers' functions should use instance functions, eg. private func = () => {}
    // this format will bind `this` to the function and do not allow modify, however it could not be inherit
    private getAutoRotationAngle = (): number => {
        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
    }

    private getZoomScale = () => {
        return Math.pow(0.95, this.zoomSpeed);
    }

    private rotateLeft = (angle: number) => {
        this.sphericalDelta.theta -= angle;
    }

    private rotateUp = (angle: number) => {
        this.sphericalDelta.phi -= angle;
    }

    private panLeft = (() => {

        let v = new THREE.Vector3();

        return function panLeft(distance: number, objectMatrix: THREE.Matrix4) {

            v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
            v.multiplyScalar(- distance);

            this.panOffset.add(v);

        };

    })();

    private panUp = (() => {

        let v = new THREE.Vector3();

        return function panUp(distance: number, objectMatrix: THREE.Matrix4) {

            if (this.screenSpacePanning === true) {

                v.setFromMatrixColumn(objectMatrix, 1);

            } else {

                v.setFromMatrixColumn(objectMatrix, 0);
                v.crossVectors(this.object.up, v);

            }

            v.multiplyScalar(distance);

            this.panOffset.add(v);

        };

    })();

    // deltaX and deltaY are in pixels; right and down are positive
    private pan = (() => {

        let offset = new THREE.Vector3();

        return function pan(deltaX: number, deltaY: number) {

            let element = this.domElement === document ? this.domElement.body : this.domElement;

            if (this.object.isPerspectiveCamera) {

                // perspective
                let position = this.object.position;
                offset.copy(position).sub(this.target);
                let targetDistance = offset.length();

                // half of the fov is center to top of screen
                targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);

                // we use only clientHeight here so aspect ratio does not distort speed
                this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.object.matrix);
                this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.object.matrix);

            } else if (this.object.isOrthographicCamera) {

                // orthographic
                this.panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / element.clientWidth, this.object.matrix);
                this.panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / element.clientHeight, this.object.matrix);

            } else {

                // camera neither orthographic nor perspective
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
                this.enablePan = false;

            }

        };

    })();

    private dollyIn = (dollyScale: number) => {

        if ((this.object as THREE.PerspectiveCamera).isPerspectiveCamera) {

            this.scale /= dollyScale;

        } else if ((this.object as THREE.OrthographicCamera).isOrthographicCamera) {

            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
            this.object.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;

        }

    }

    private dollyOut = (dollyScale: number) => {

        if ((this.object as THREE.PerspectiveCamera).isPerspectiveCamera) {

            this.scale *= dollyScale;

        } else if ((this.object as THREE.OrthographicCamera).isOrthographicCamera) {

            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
            this.object.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;

        }

    }

    //
    // event callbacks - update the object state
    //

    private handleMouseDownRotate = (event: { [index: string]: any }) => {

        //console.log( 'handleMouseDownRotate' );

        this.rotateStart.set(event.clientX, event.clientY);

    }

    private handleMouseDownDolly = (event: { [index: string]: any }) => {

        //console.log( 'handleMouseDownDolly' );

        this.dollyStart.set(event.clientX, event.clientY);

    }

    private handleMouseDownPan = (event: { [index: string]: any }) => {

        //console.log( 'handleMouseDownPan' );

        this.panStart.set(event.clientX, event.clientY);

    }

    private handleMouseMoveRotate = (event: { [index: string]: any }) => {

        //console.log( 'handleMouseMoveRotate' );

        this.rotateEnd.set(event.clientX, event.clientY);

        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

        let element = this.domElement;

        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight); // yes, height

        this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight);

        this.rotateStart.copy(this.rotateEnd);

        this.update();

    }

    private handleMouseMoveDolly = (event: { [index: string]: any }) => {

        //console.log( 'handleMouseMoveDolly' );

        this.dollyEnd.set(event.clientX, event.clientY);

        this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

        if (this.dollyDelta.y > 0) {

            this.dollyIn(this.getZoomScale());

        } else if (this.dollyDelta.y < 0) {

            this.dollyOut(this.getZoomScale());

        }

        this.dollyStart.copy(this.dollyEnd);

        this.update();

    }

    private handleMouseMovePan = (event: { [index: string]: any }) => {

        //console.log( 'handleMouseMovePan' );

        this.panEnd.set(event.clientX, event.clientY);

        this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);

        this.pan(this.panDelta.x, this.panDelta.y);

        this.panStart.copy(this.panEnd);

        this.update();

    }

    private handleMouseUp = (event: { [index: string]: any }) => {

        // console.log( 'handleMouseUp' );

    }

    private handleMouseWheel = (event: { [index: string]: any }) => {

        // console.log( 'handleMouseWheel' );

        if (event.deltaY < 0) {

            this.dollyOut(this.getZoomScale());

        } else if (event.deltaY > 0) {

            this.dollyIn(this.getZoomScale());

        }

        this.update();

    }

    private handleKeyDown = (event: { [index: string]: any }) => {

        // console.log( 'handleKeyDown' );

        let needsUpdate = false;

        switch (event.keyCode) {

            case this.keys.UP:
                this.pan(0, this.keyPanSpeed);
                needsUpdate = true;
                break;

            case this.keys.BOTTOM:
                this.pan(0, - this.keyPanSpeed);
                needsUpdate = true;
                break;

            case this.keys.LEFT:
                this.pan(this.keyPanSpeed, 0);
                needsUpdate = true;
                break;

            case this.keys.RIGHT:
                this.pan(- this.keyPanSpeed, 0);
                needsUpdate = true;
                break;

        }

        if (needsUpdate) {

            // prevent the browser from scrolling on cursor keys
            event.preventDefault();

            this.update();

        }


    }

    private handleTouchStartRotate = (event: { [index: string]: any }) => {

        //console.log( 'handleTouchStartRotate' );

        this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);

    }

    private handleTouchStartDollyPan = (event: { [index: string]: any }) => {

        //console.log( 'handleTouchStartDollyPan' );

        if (this.enableZoom) {

            let dx = event.touches[0].pageX - event.touches[1].pageX;
            let dy = event.touches[0].pageY - event.touches[1].pageY;

            let distance = Math.sqrt(dx * dx + dy * dy);

            this.dollyStart.set(0, distance);

        }

        if (this.enablePan) {

            let x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            let y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

            this.panStart.set(x, y);

        }

    }

    private handleTouchMoveRotate = (event: { [index: string]: any }) => {

        //console.log( 'handleTouchMoveRotate' );

        this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);

        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

        let element = this.domElement

        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight); // yes, height

        this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight);

        this.rotateStart.copy(this.rotateEnd);

        this.update();

    }

    private handleTouchMoveDollyPan = (event: { [index: string]: any }) => {

        //console.log( 'handleTouchMoveDollyPan' );

        if (this.enableZoom) {

            let dx = event.touches[0].pageX - event.touches[1].pageX;
            let dy = event.touches[0].pageY - event.touches[1].pageY;

            let distance = Math.sqrt(dx * dx + dy * dy);

            this.dollyEnd.set(0, distance);

            this.dollyDelta.set(0, Math.pow(this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed));

            this.dollyIn(this.dollyDelta.y);

            this.dollyStart.copy(this.dollyEnd);

        }

        if (this.enablePan) {

            let x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            let y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

            this.panEnd.set(x, y);

            this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);

            this.pan(this.panDelta.x, this.panDelta.y);

            this.panStart.copy(this.panEnd);

        }

        this.update();

    }

    private handleTouchEnd = (event: { [index: string]: any }) => {

        //console.log( 'handleTouchEnd' );

    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    private onMouseDown = (event: { [index: string]: any }) => {
        console.log(this)
        if (this.enabled === false) return;

        // Prevent the browser from scrolling.

        event.preventDefault();

        // Manually set the focus since calling preventDefault above
        // prevents the browser from setting it automatically.
        console.log(this);
        (this.domElement as HTMLElement).focus ? (this.domElement as HTMLElement).focus() : window.focus();

        switch (event.button) {

            case this.mouseButtons.LEFT:

                if (event.ctrlKey || event.metaKey || event.shiftKey) {

                    if (this.enablePan === false) return;

                    this.handleMouseDownPan(event);

                    this.state = this.STATE.PAN;

                } else {

                    if (this.enableRotate === false) return;

                    this.handleMouseDownRotate(event);

                    this.state = this.STATE.ROTATE;

                }

                break;

            case this.mouseButtons.MIDDLE:

                if (this.enableZoom === false) return;

                this.handleMouseDownDolly(event);

                this.state = this.STATE.DOLLY;

                break;

            case this.mouseButtons.RIGHT:

                if (this.enablePan === false) return;

                this.handleMouseDownPan(event);

                this.state = this.STATE.PAN;

                break;

        }

        if (this.state !== this.STATE.NONE) {

            document.addEventListener('mousemove', this.onMouseMove, false);
            document.addEventListener('mouseup', this.onMouseUp, false);

            this.dispatchEvent(this.startEvent);

        }

    }

    private onMouseMove = (event: { [index: string]: any }) => {

        if (this.enabled === false) return;

        event.preventDefault();

        switch (this.state) {

            case this.STATE.ROTATE:

                if (this.enableRotate === false) return;

                this.handleMouseMoveRotate(event);

                break;

            case this.STATE.DOLLY:

                if (this.enableZoom === false) return;

                this.handleMouseMoveDolly(event);

                break;

            case this.STATE.PAN:

                if (this.enablePan === false) return;

                this.handleMouseMovePan(event);

                break;

        }

    }

    private onMouseUp = (event: { [index: string]: any }) => {

        if (this.enabled === false) return;

        this.handleMouseUp(event);

        document.removeEventListener('mousemove', this.onMouseMove, false);
        document.removeEventListener('mouseup', this.onMouseUp, false);

        this.dispatchEvent(this.endEvent);

        this.state = this.STATE.NONE;

    }

    private onMouseWheel = (event: { [index: string]: any }) => {

        if (this.enabled === false || this.enableZoom === false || (this.state !== this.STATE.NONE && this.state !== this.STATE.ROTATE)) return;

        event.preventDefault();
        event.stopPropagation();

        this.dispatchEvent(this.startEvent);

        this.handleMouseWheel(event);

        this.dispatchEvent(this.endEvent);

    }

    private onKeyDown = (event: { [index: string]: any }) => {

        if (this.enabled === false || this.enableKeys === false || this.enablePan === false) return;

        this.handleKeyDown(event);

    }

    private onTouchStart = (event: { [index: string]: any }) => {

        if (this.enabled === false) return;

        event.preventDefault();

        switch (event.touches.length) {

            case 1:	// one-fingered touch: rotate

                if (this.enableRotate === false) return;

                this.handleTouchStartRotate(event);

                this.state = this.STATE.TOUCH_ROTATE;

                break;

            case 2:	// two-fingered touch: dolly-pan

                if (this.enableZoom === false && this.enablePan === false) return;

                this.handleTouchStartDollyPan(event);

                this.state = this.STATE.TOUCH_DOLLY_PAN;

                break;

            default:

                this.state = this.STATE.NONE;

        }

        if (this.state !== this.STATE.NONE) {

            this.dispatchEvent(this.startEvent);

        }

    }

    private onTouchMove = (event: { [index: string]: any }) => {

        if (this.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        switch (event.touches.length) {

            case 1: // one-fingered touch: rotate

                if (this.enableRotate === false) return;
                if (this.state !== this.STATE.TOUCH_ROTATE) return; // is this needed?

                this.handleTouchMoveRotate(event);

                break;

            case 2: // two-fingered touch: dolly-pan

                if (this.enableZoom === false && this.enablePan === false) return;
                if (this.state !== this.STATE.TOUCH_DOLLY_PAN) return; // is this needed?

                this.handleTouchMoveDollyPan(event);

                break;

            default:

                this.state = this.STATE.NONE;

        }

    }

    private onTouchEnd = (event: { [index: string]: any }) => {

        if (this.enabled === false) return;

        this.handleTouchEnd(event);

        this.dispatchEvent(this.endEvent);

        this.state = this.STATE.NONE;

    }

    private onContextMenu = (event: { [index: string]: any }) => {

        if (this.enabled === false) return;

        event.preventDefault();

    }
}


