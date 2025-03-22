import * as THREE from 'three';

export class Avatar {
    constructor(avatarData) {
        this.size = avatarData.size || 1;
        this.evolutionLevel = avatarData.evolutionLevel || 1;
        
        // Create main body
        const bodyGeometry = new THREE.BoxGeometry(1 * this.size, .3 * this.size, 2 * this.size);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(bodyGeometry, material);
        
        // Add head at the front
        const headGeometry = new THREE.BoxGeometry(0.5 * this.size, 0.3 * this.size, 0.4 * this.size);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0x00aa00 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.1 * this.size, -1.1 * this.size);
        this.mesh.add(head);

        // Add eye socket
        const eyeSocketGeometry = new THREE.BoxGeometry(0.48 * this.size, 0.2 * this.size, 0.2 * this.size);
        const eyeSocketMaterial = new THREE.MeshPhongMaterial({ color: 0x006600 });
        const eyeSocket = new THREE.Mesh(eyeSocketGeometry, eyeSocketMaterial);
        eyeSocket.position.set(0, 0.12 * this.size, -1.35 * this.size);
        this.mesh.add(eyeSocket);

        // Add eyes
        const eyeGeometry = new THREE.SphereGeometry(0.08 * this.size, 16, 16);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(0.12 * this.size, 0.12 * this.size, -1.42 * this.size);
        this.mesh.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(-0.12 * this.size, 0.12 * this.size, -1.42 * this.size);
        this.mesh.add(rightEye);

        // Add pupils
        const pupilGeometry = new THREE.SphereGeometry(0.04 * this.size, 8, 8);
        const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(0.12 * this.size, 0.12 * this.size, -1.46 * this.size);
        this.mesh.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(-0.12 * this.size, 0.12 * this.size, -1.46 * this.size);
        this.mesh.add(rightPupil);

        // Add mouth
        const mouthGeometry = new THREE.BoxGeometry(0.46 * this.size, 0.05 * this.size, 0.5 * this.size);
        const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x006600 });
        
        const upperMouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        upperMouth.position.set(0, 0.05 * this.size, -1.35 * this.size);
        this.mesh.add(upperMouth);
        
        const lowerMouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        lowerMouth.position.set(0, 0.00, -1.35 * this.size);
        this.mesh.add(lowerMouth);

        // Add feet
        const footGeometry = new THREE.BoxGeometry(0.2 * this.size, 0.7 * this.size, 0.3 * this.size);
        const footMaterial = new THREE.MeshPhongMaterial({ color: 0x008800 });
        
        // Create foot joints
        this.footJoints = {};
        const jointPositions = {
            frontLeft: [0.45, -0.35, 0.8],
            frontRight: [-0.45, -0.35, 0.8],
            backLeft: [0.45, -0.35, -0.8],
            backRight: [-0.45, -0.35, -0.8]
        };

        for (const [key, pos] of Object.entries(jointPositions)) {
            const joint = new THREE.Object3D();
            joint.position.set(
                pos[0] * this.size, 
                pos[1] * this.size, 
                pos[2] * this.size
            );
            this.mesh.add(joint);
            
            const foot = new THREE.Mesh(footGeometry, footMaterial);
            foot.position.set(0, 0.1 * this.size, 0);
            joint.add(foot);
            
            this.footJoints[key] = joint;
        }
    }

    getMesh() {
        return this.mesh;
    }
}
