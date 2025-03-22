import * as THREE from 'three';
import { Controls } from '../controls.js';
import { WorldGenerator } from '../worldGenerator.js';
import { Player } from '../player.js';
import { AnimationManager } from './animationManager.js';

export class Game {
    constructor() {
        // Three.js core components
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        // Add AnimationManager initialization
        this.animationManager = new AnimationManager();
        
        // Initialize world
        this.initWorld();
        
        // Initialize controls
        this.controls = new Controls(this.camera, this.renderer.domElement);
        
        // Initialize player
        this.player = new Player(this.scene, this.camera, this.animationManager);
        
        // Start game loop
        this.lastTime = performance.now();
        this.animate();
    }
    
    initWorld() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Add a sky dome
        const skyGeo = new THREE.SphereGeometry(10000, 25, 25);
        // Create a blue material for the sky instead of using a texture
        // Create a gradient material for the sky
        const vertexShader = `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        
        const fragmentShader = `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition).y;
                float t = max(0.0, h);
                gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
            }
        `;
        
        const uniforms = {
            topColor: { value: new THREE.Color("#cce4ff") },
            bottomColor: { value: new THREE.Color("#91c5ff") }
        };
        
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide
        });
        // Use the skyMaterial that was already defined above
        const sky = new THREE.Mesh(skyGeo, skyMaterial);
        // The BackSide property is already set in skyMaterial
        this.scene.add(sky);
        // Add a sun
        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00, // Yellow color
            emissive: 0xffff00,
            emissiveIntensity: 1
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.set(50, 100, -50); // Position the sun in the sky
        this.scene.add(this.sun);
        
        // Make the directional light come from the sun's position
        directionalLight.position.copy(this.sun.position);
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        // this.scene.add(ambientLight);
        
        
        
        // Generate terrain using WorldGenerator
        const worldGenerator = new WorldGenerator();
        this.ground = worldGenerator.generateTerrain();
        this.ground.name = 'ground';
        this.ground.position.y = -40; // Position slightly below the origin
        this.scene.add(this.ground);
        worldGenerator.addFlowers(this.ground, 1000, this.scene);
        
    }

    
    
    animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        requestAnimationFrame(() => this.animate());
        
        // Update animations
        this.animationManager.update(deltaTime);
        
        this.player.update(this.controls);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Add any additional game methods here
}
