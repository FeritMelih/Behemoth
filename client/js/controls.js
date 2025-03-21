import * as THREE from 'three';

export class Controls {
    constructor(camera, domElement) {
        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        // Mouse movement tracking
        this.mouseMoved = false;
        this.mouseMovement = { x: 0, y: 0 };
        this.isPointerLocked = false;
        
        // Movement speed
        this.speed = 0.1;
        
        // Bind event listeners
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        
        // Add event listeners
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        document.addEventListener('mousemove', this.onMouseMove);
        
        // Setup pointer lock
        this.domElement = domElement;
        this.domElement.addEventListener('click', () => {
            this.domElement.requestPointerLock();
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.domElement;
        });
    }
    
    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
                this.moveForward = true;
                break;
            case 'KeyA':
                this.moveLeft = true;
                break;
            case 'KeyS':
                this.moveBackward = true;
                break;
            case 'KeyD':
                this.moveRight = true;
                break;
        }
    }
    
    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'KeyA':
                this.moveLeft = false;
                break;
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'KeyD':
                this.moveRight = false;
                break;
        }
    }
    
    onMouseMove(event) {
        if (!this.isPointerLocked) return;
        // console.log(event);
        this.mouseMovement.x = event.movementX || 0;
        this.mouseMovement.y = event.movementY || 0;
        this.mouseMoved = true;
    }
    
    dispose() {
        // Remove event listeners when no longer needed
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('click');
        document.removeEventListener('pointerlockchange');
    }
}
