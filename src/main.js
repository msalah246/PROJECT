import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupControls } from './controls.js';

let scene, camera, renderer, mixer, character;
const clock = new THREE.Clock();
const animations = {};

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Load Map
    const loader = new GLTFLoader();
    loader.load('/public/town4new.glb', (gltf) => {
        const map = gltf.scene;
        map.scale.set(10, 10, 10);
        map.position.set(0, -1, 0);
        scene.add(map);
    });

    // Load Character and Animations
    loader.load('/public/character.glb', (gltf) => {
        character = gltf.scene;
        character.scale.set(3, 3, 3);
        character.position.set(0, 0, 0);
        scene.add(character);

        // Animation Mixer
        mixer = new THREE.AnimationMixer(character);
        loadAnimation('/public/Walking (1).glb', 'Walk');
        loadAnimation('/public/Running (1).glb', 'Run');
        loadAnimation('/public/jump.glb', 'Jump');

        // Initialize Controls
        setupControls(character, mixer, animations);
    });

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function loadAnimation(path, name) {
    const loader = new GLTFLoader();
    loader.load(path, (gltf) => {
        const clip = gltf.animations[0];
        animations[name] = mixer.clipAction(clip);
    });
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    if (character) {
        // Offset position behind the character (adjust as needed)
        const offset = new THREE.Vector3(0, 7, 10);
        
        // Apply character's rotation to offset (follow direction)
        const characterRotation = character.rotation.y;
        const cameraPosition = new THREE.Vector3(
            character.position.x - Math.sin(characterRotation) * offset.z,
            character.position.y + offset.y,
            character.position.z - Math.cos(characterRotation) * offset.z
        );
        
        // Update camera position
        camera.position.copy(cameraPosition);
        
        // Make the camera look at the character's position (slightly above)
        camera.lookAt(character.position.clone().add(new THREE.Vector3(0, 2, 0)));
    }

    renderer.render(scene, camera);
}
