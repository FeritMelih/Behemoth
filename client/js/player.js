import * as THREE from 'three';
import { Avatar } from './avatar.js';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        // Create player avatar
        const avatarData = {
            size: 1,
            evolutionLevel: 1
        };
        const avatar = new Avatar(avatarData);
        this.mesh = avatar.getMesh();
        this.mesh.position.y = 10; // Start above ground
        scene.add(this.mesh);

        // Create an empty component at the same location as the player
        this.component = new THREE.Object3D();
        this.component.position.copy(this.mesh.position);
        
        // Attach the component to the player
        this.mesh.add(this.component);

        // Position the component relative to the player mesh
        // The component will be at the front of the player
        this.component.position.set(0, 0, 0); // 1 unit in front of the player
        
        // Position the camera relative to the component
        // 2 units behind and 1 unit up from the component
        this.camera.position.set(0, 1, 4);
        
        // Make the camera look at the component
        this.camera.lookAt(this.component.position);
        
        // Attach the camera to the component
        this.component.add(this.camera);

        // Physics
        this.velocity = new THREE.Vector3();
        this.gravity = -0.01;
        this.grounded = false;

        // Attach camera to player
        
        // Add camera control parameters
        this.mouseSensitivity = 0.02;
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.cameraPosition = new THREE.Vector3();
        this.camera.quaternion.setFromEuler(this.euler);
        this.updateCamera();

    }

    update(controls) {
        // Apply gravity
        if (!this.grounded) {
            this.velocity.y += this.gravity;
        }
        this.mesh.position.y += this.velocity.y;

        // Ground check (simple)
        // Get the terrain height at the player's position
        const terrain = this.scene.getObjectByName('ground');  // Look for the ground object specifically
        if (terrain && terrain.getHeightAt) {
            const terrainHeight = terrain.getHeightAt(this.mesh.position.x, this.mesh.position.z);
            const playerHeight = terrainHeight + terrain.position.y + 0.5; // 0.5 is half the player's height
            
            if (this.mesh.position.y < playerHeight) {
                this.mesh.position.y = playerHeight;
                this.velocity.y = 0;
                this.grounded = true;
            } else {
                this.grounded = false;
            }
        } else {
            // Fallback if terrain not found
            this.grounded = this.mesh.position.y < -39;
            if (this.grounded) {
                this.mesh.position.y = -39;
                this.velocity.y = 0;
            }
        }

        // Handle camera rotation from mouse movement
        this.euler.setFromQuaternion(this.component.quaternion);

        if (controls.mouseMoved) {
            // Get the current camera orientation
            

            this.euler.y -= controls.mouseMovement.x * this.mouseSensitivity;

            
            // Calculate the new x value and check if it's within bounds (-30 to 30 degrees)
            const newXValue = this.euler.x - controls.mouseMovement.y * this.mouseSensitivity;
            const minAngle = -40 * (Math.PI / 180); // -30 degrees in radians
            const maxAngle = 10 * (Math.PI / 180);  // 30 degrees in radians
            
            // Only update if within bounds
            if (newXValue >= minAngle && newXValue <= maxAngle) {
                this.euler.x = newXValue;
            }


            controls.mouseMoved = false;
        }

        // Movement based on camera direction
        if (controls.moveForward || controls.moveBackward || controls.moveLeft || controls.moveRight) {
            // Get camera's forward direction (excluding Y component)
            const cameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);
            cameraDirection.y = 0;
            cameraDirection.normalize();

            // Calculate movement direction
            const moveDirection = new THREE.Vector3();
            
            if (controls.moveForward) moveDirection.add(cameraDirection);
            if (controls.moveBackward) moveDirection.sub(cameraDirection);
            
            // Left/Right movement perpendicular to camera direction
            const rightVector = new THREE.Vector3();
            rightVector.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
            
            if (controls.moveRight) moveDirection.add(rightVector);
            if (controls.moveLeft) moveDirection.sub(rightVector);

            // Normalize and apply movement
            if (moveDirection.length() > 0) {

                this.mesh.rotation.y += this.euler.y;
                this.euler.y = 0;
                
                moveDirection.normalize();
                this.mesh.position.add(moveDirection.multiplyScalar(controls.speed));
            }
        }

        this.updateCamera();

    }

    updateCamera() {
        this.component.quaternion.setFromEuler(this.euler);

    }
}
