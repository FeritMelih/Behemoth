import * as THREE from 'three';

export class WorldGenerator {
    constructor() {
        // Configuration parameters
        this.size = 1000; // 1000x1000 meters
        this.resolution = 256; // Number of vertices per side (higher = more detailed)
        this.maxHeight = 50; // Maximum height of terrain
        this.smoothness = 0.008; // Lower values = smoother terrain
    }

    generateTerrain() {
        // Create a plane geometry with high polygon count
        const geometry = new THREE.PlaneGeometry(
            this.size, 
            this.size, 
            this.resolution, 
            this.resolution
        );

        // Generate heightmap
        const heightmap = this.generateHeightmap();

        // Apply heightmap to geometry
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            // Y is the height in this case (after the plane is rotated)
            const x = Math.floor((i / 3) % (this.resolution + 1));
            const z = Math.floor((i / 3) / (this.resolution + 1));
            
            // Get height from our heightmap
            const height = heightmap[z][x];
            vertices[i+2] = height;
        }

        // Update geometry after modifying vertices
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        // Create material
        const material = new THREE.MeshStandardMaterial({
            color: 0x3d7c47,
            side: THREE.DoubleSide,
            flatShading: false,
            wireframe: false
        });

        // Create mesh
        const terrain = new THREE.Mesh(geometry, material);
        
        // Rotate to be horizontal and ensure proper scale
        terrain.rotation.x = -Math.PI / 2;
        terrain.scale.set(1, 1, 1); // Ensure uniform scale
        
        // Add collision detection
        terrain.userData.heightmap = heightmap;
        terrain.userData.size = this.size;
        terrain.userData.resolution = this.resolution;
        
        // Method to check height at any x,z coordinate
        terrain.getHeightAt = (x, z) => {
            // Convert world coordinates to heightmap indices
            const halfSize = this.size / 2;
            
            // Normalize coordinates to 0-1 range within the terrain bounds
            const normalizedX = (x + halfSize) / this.size;
            const normalizedZ = (z + halfSize) / this.size;
            
            // Convert to heightmap indices
            const ix = Math.floor(normalizedX * this.resolution);
            const iz = Math.floor(normalizedZ * this.resolution);
            
            // Clamp to valid indices
            const clampedIX = Math.max(0, Math.min(this.resolution, ix));
            const clampedIZ = Math.max(0, Math.min(this.resolution, iz));
            
            // Return the height at this position
            return heightmap[clampedIZ][clampedIX];
        };
        
        return terrain;
    }

    generateHeightmap() {
        // Create a 2D array for the heightmap
        const heightmap = [];
        for (let z = 0; z <= this.resolution; z++) {
            heightmap[z] = [];
            for (let x = 0; x <= this.resolution; x++) {
                heightmap[z][x] = 0;
            }
        }

        // Use smooth mathematical functions for terrain generation
        for (let z = 0; z <= this.resolution; z++) {
            for (let x = 0; x <= this.resolution; x++) {
                // Normalize coordinates to -1 to 1 range
                const nx = (x / this.resolution) * 2 - 1;
                const nz = (z / this.resolution) * 2 - 1;
                
                // Calculate distance from center
                const distance = Math.sqrt(nx * nx + nz * nz);
                
                // Create a smooth rolling hills pattern
                let height = 0;
                
                // Base terrain - gentle rolling hills
                height += Math.cos(nx * 1.5) * Math.sin(nz * 1.2) * 0.2;
                
                // Add some larger terrain features
                height += Math.sin(nx * 0.8 + nz * 0.3) * 0.3;
                
                // Add a central mountain or valley
                const centralFeature = 0.5 * (1 - Math.min(1, distance * 1.5));
                height += centralFeature;
                
                // Add some ridges
                height += 0.1 * Math.sin(nx * 3 + nz * 5);
                
                // Scale to desired height
                height = (height + 1) / 2; // Normalize to 0-1 range
                height *= this.maxHeight;
                
                heightmap[z][x] = height;
            }
        }

        return heightmap;
    }

    // Simple noise function (not true Perlin noise but works for our purpose)
    noise(x, y) {
        // We'll use a simple but effective pseudo-random function
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return 2.0 * (n - Math.floor(n)) - 1.0;
    }

    addFlowers(mesh, count = 10, scene) {
        // Load the flower geometry from the JSON file
        fetch('./geometry.json')
            .then(response => response.json())
            .then(geometryData => {
                const flowerConfig = geometryData.flower;
                
                for (let i = 0; i < count; i++) {
                    // Create a flower group to hold all flower parts
                    const flower = new THREE.Group();
                    
                    // Create the stem
                    const stemConfig = flowerConfig.stem;
                    const stemGeometry = new THREE.CylinderGeometry(
                        stemConfig.radius,
                        stemConfig.radius,
                        stemConfig.height,
                        stemConfig.segments
                    );
                    const stemMaterial = new THREE.MeshPhongMaterial({
                        color: parseInt(stemConfig.material.color),
                        shininess: stemConfig.material.shininess
                    });
                    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                    stem.position.y = stemConfig.height / 2;
                    flower.add(stem);
                    
                    // Create the center
                    const centerConfig = flowerConfig.center;
                    const centerGeometry = new THREE.SphereGeometry(
                        centerConfig.radius,
                        centerConfig.segments,
                        centerConfig.segments
                    );
                    const centerMaterial = new THREE.MeshPhongMaterial({
                        color: parseInt(centerConfig.material.color),
                        emissive: parseInt(centerConfig.material.emissive),
                        emissiveIntensity: centerConfig.material.emissiveIntensity
                    });
                    const center = new THREE.Mesh(centerGeometry, centerMaterial);
                    center.position.y = stemConfig.height;
                    flower.add(center);
                    
                    // Create petals
                    const petalConfig = flowerConfig.petals;
                    const petalMaterial = new THREE.MeshPhongMaterial({
                        color: parseInt(petalConfig.material.color),
                        emissive: parseInt(petalConfig.material.emissive),
                        emissiveIntensity: petalConfig.material.emissiveIntensity,
                        shininess: petalConfig.material.shininess
                    });
                    
                    for (let j = 0; j < petalConfig.arrangement.count; j++) {
                        const petalGeometry = new THREE.CircleGeometry(
                            petalConfig.radius,
                            petalConfig.segments
                        );
                        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                        
                        // Position and rotate each petal around the center
                        const angle = (j / petalConfig.arrangement.count) * Math.PI * 2;
                        petal.position.x = Math.cos(angle) * petalConfig.arrangement.radius;
                        petal.position.z = Math.sin(angle) * petalConfig.arrangement.radius;
                        petal.position.y = stemConfig.height;
                        
                        // Rotate petal to face outward
                        petal.rotation.x = -Math.PI / 2 + petalConfig.arrangement.tiltAngle;
                        petal.rotation.y = angle + petalConfig.arrangement.rotationOffset;
                        
                        flower.add(petal);
                    }
                    
                    // Create leaves
                    const leafConfig = flowerConfig.leaves;
                    const leafMaterial = new THREE.MeshPhongMaterial({
                        color: parseInt(leafConfig.material.color),
                        side: THREE.DoubleSide
                    });
                    
                    for (let j = 0; j < leafConfig.arrangement.count; j++) {
                        const leafGeometry = new THREE.PlaneGeometry(
                            leafConfig.width,
                            leafConfig.height
                        );
                        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                        
                        // Position leaves at different heights on the stem
                        leaf.position.y = leafConfig.arrangement.heightPositions[j];
                        
                        // Rotate leaves around the stem
                        leaf.rotation.x = -Math.PI / 2;
                        leaf.rotation.z = leafConfig.arrangement.rotationAngles[j];
                        
                        flower.add(leaf);
                    }
                    
                    // Find a random position on the top side of the mesh
                    const position = this.getRandomPositionOnMesh(mesh);
                    if (position) {
                        flower.position.copy(position);
                        // Adjust position down by 0.5 units
                        flower.position.y -= 0.7;
                        // Add randomized size between 0.7 and 1.2
                        const randomScale = 0.7 + Math.random() * 0.5; // Range from 0.7 to 1.2
                        flower.scale.set(randomScale, randomScale, randomScale);
                        // Add some random rotation for variety
                        flower.rotation.y = Math.random() * Math.PI * 2;
                        
                        // Add the flower to the scene
                        scene.add(flower);
                    }
                }
            })
            .catch(error => console.error('Error loading geometry data:', error));
    }
    
    getRandomPositionOnMesh(mesh) {
        if (!mesh.geometry) return null;
        
        // Get a random face from the mesh geometry
        const geometry = mesh.geometry;
        if (!geometry.isBufferGeometry) return null;
        
        const positionAttribute = geometry.getAttribute('position');
        const count = positionAttribute.count / 3; // Number of triangles
        
        if (count === 0) return null;
        
        // Select a random triangle
        const randomTriangle = Math.floor(Math.random() * count);
        
        // Get the vertices of the triangle
        const vertices = [];
        for (let i = 0; i < 3; i++) {
            const index = randomTriangle * 3 + i;
            vertices.push(new THREE.Vector3(
                positionAttribute.getX(index),
                positionAttribute.getY(index),
                positionAttribute.getZ(index)
            ));
        }
        
        // Calculate the normal of the triangle
        const normal = new THREE.Vector3()
            .crossVectors(
                new THREE.Vector3().subVectors(vertices[1], vertices[0]),
                new THREE.Vector3().subVectors(vertices[2], vertices[0])
            )
            .normalize();
        
        // Only use faces that are pointing upward
        if (normal.y < 0.5) return this.getRandomPositionOnMesh(mesh); // Try again
        
        // Get a random point on the triangle
        const point = new THREE.Vector3();
        // Barycentric coordinates
        const a = Math.random();
        const b = Math.random() * (1 - a);
        const c = 1 - a - b;
        
        point.addScaledVector(vertices[0], a);
        point.addScaledVector(vertices[1], b);
        point.addScaledVector(vertices[2], c);
        
        // Transform to world coordinates
        point.applyMatrix4(mesh.matrixWorld);
        
        return point;
    }
}
