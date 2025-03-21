import * as THREE from 'three';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        // Create player mesh (rectangle)
        // Create main body
        const bodyGeometry = new THREE.BoxGeometry(1, .3, 2); // 2 units long, 1 unit wide/tall
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(bodyGeometry, material);
        this.mesh.position.y = 10; // Start above ground
        scene.add(this.mesh);
        
        // Add head at the front
        const headGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.4);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0x00aa00 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.1, -1.1); // Position at the front and slightly above the body
        this.mesh.add(head);

        const eyeSocketGeometry = new THREE.BoxGeometry(0.48, 0.2, 0.2);
        const eyeSocketMaterial = new THREE.MeshPhongMaterial({ color: 0x006600 });
        const eyeSocket = new THREE.Mesh(eyeSocketGeometry, eyeSocketMaterial);
        eyeSocket.position.set(0, 0.12, -1.35); // Position in front of the head
        this.mesh.add(eyeSocket);
        // Add eyes inside the eye socket
        const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        
        // Left eye
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(0.12, 0.12, -1.42); // Position in front of the eye socket
        this.mesh.add(leftEye);
        
        // Right eye
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(-0.12, 0.12, -1.42); // Position in front of the eye socket
        this.mesh.add(rightEye);
        
        // Add pupils (black centers of the eyes)
        const pupilGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        // Left pupil
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(0.12, 0.12, -1.46); // Position in front of the left eye
        this.mesh.add(leftPupil);
        
        // Right pupil
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(-0.12, 0.12, -1.46); // Position in front of the right eye
        this.mesh.add(rightPupil);
        
        

        // Add mouth (two thin boxes) in front of the head
        const upperMouthGeometry = new THREE.BoxGeometry(0.46, 0.05, 0.5);
        const lowerMouthGeometry = new THREE.BoxGeometry(0.46, 0.05, 0.5);
        const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x006600 });
        
        // Upper part of mouth
        const upperMouth = new THREE.Mesh(upperMouthGeometry, mouthMaterial);
        upperMouth.position.set(0, 0.05, -1.35); // Position in front of the head
        this.mesh.add(upperMouth);
        
        // Lower part of mouth
        const lowerMouth = new THREE.Mesh(lowerMouthGeometry, mouthMaterial);
        lowerMouth.position.set(0, 0.00, -1.35); // Position below the upper mouth
        this.mesh.add(lowerMouth);
        
        // Add four feet (small rectangles)
        const footGeometry = new THREE.BoxGeometry(0.2, 0.7, 0.3);
        const footMaterial = new THREE.MeshPhongMaterial({ color: 0x008800 });
        
        // Create foot joints (empty components)
        // Front left joint
        const frontLeftJoint = new THREE.Object3D();
        frontLeftJoint.position.set(0.45, -0.35, 0.8); // Bottom side corner position
        this.mesh.add(frontLeftJoint);
        
        // Front right joint
        const frontRightJoint = new THREE.Object3D();
        frontRightJoint.position.set(-0.45, -0.35, 0.8); // Bottom side corner position
        this.mesh.add(frontRightJoint);
        
        // Back left joint
        const backLeftJoint = new THREE.Object3D();
        backLeftJoint.position.set(0.45, -0.35, -0.8); // Bottom side corner position
        this.mesh.add(backLeftJoint);
        
        // Back right joint
        const backRightJoint = new THREE.Object3D();
        backRightJoint.position.set(-0.45, -0.35, -0.8); // Bottom side corner position
        this.mesh.add(backRightJoint);
        
        // Front left foot
        const frontLeftFoot = new THREE.Mesh(footGeometry, footMaterial);
        frontLeftFoot.position.set(0, 0.1, 0); // Position relative to joint
        frontLeftJoint.add(frontLeftFoot);
        
        // Front right foot
        const frontRightFoot = new THREE.Mesh(footGeometry, footMaterial);
        frontRightFoot.position.set(0, 0.1, 0); // Position relative to joint
        frontRightJoint.add(frontRightFoot);
        
        // Back left foot
        const backLeftFoot = new THREE.Mesh(footGeometry, footMaterial);
        backLeftFoot.position.set(0, 0.1, 0); // Position relative to joint
        backLeftJoint.add(backLeftFoot);
        
        // Back right foot
        const backRightFoot = new THREE.Mesh(footGeometry, footMaterial);
        backRightFoot.position.set(0, 0.1, 0); // Position relative to joint
        backRightJoint.add(backRightFoot);
        
        // Store references to joints for animation if needed
        this.footJoints = {
            frontLeft: frontLeftJoint,
            frontRight: frontRightJoint,
            backLeft: backLeftJoint,
            backRight: backRightJoint
        };

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
