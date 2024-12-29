// Import necessary modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupControls } from './controls.js';

let scene, camera, renderer, mixer, character;
const clock = new THREE.Clock();
const animations = {};

let score = 0;
const collectibles = [];
let currentLevel = 1;
const totalLevels = 10;
const pointsToPass = 100;
const levelElement = document.getElementById('level');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
let timer = 90; // 90 seconds per level
let timerInterval;

let isPaused = false; // State to track if the game is paused

init();
loadLevel(currentLevel);
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
    loader.load('/public/Model.glb', (gltf) => {
        const map = gltf.scene;
        map.scale.set(10, 10, 10);
        map.position.set(0, -1, 0);
        scene.add(map);
})
    // Load Character and Animations
    loader.load('/public/character.glb', (gltf) => {
        character = gltf.scene;
        character.scale.set(3, 3, 3);
        character.position.set(0, 0, 0);
        scene.add(character);

        // Animation Mixer
        mixer = new THREE.AnimationMixer(character);
        loadAnimation('/public/Walking.glb', 'Walk');
        loadAnimation('/public/Running.glb', 'Run');
        loadAnimation('/public/jumping.glb', 'Jump');

        // Initialize Controls
        setupControls(character, mixer, animations);
    });

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Audio Setup
    setupAudio();

    // Key Press Listener for Enter to Continue
    document.addEventListener('keydown', handleKeyPress);
}


function handleKeyPress(event) {
    if (event.key === 'Enter' && isPaused) {
        isPaused = false; // Resume the game
        resetCharacterPosition();
        loadLevel(currentLevel); // Reload the current level
    }
}

function loadAnimation(path, name) {
    const loader = new GLTFLoader();
    loader.load(path, (gltf) => {
        const clip = gltf.animations[0];
        animations[name] = mixer.clipAction(clip);
    });
}

// Initialize Mouse Control Variables
let isMouseDown = false;

// Mouse event listeners
window.addEventListener('mousedown', () => (isMouseDown = true));
window.addEventListener('mouseup', () => (isMouseDown = false));
window.addEventListener('mousemove', (event) => {
    if (!isMouseDown || !character) return;

    const rotationSpeed = 0.005; // Adjust rotation sensitivity
    character.rotation.y -= event.movementX * rotationSpeed;
});

// Pointer Lock
document.body.addEventListener('click', () => {
    document.body.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement !== document.body) {
        isMouseDown = false; // Stop rotation if pointer is unlocked
    }
});

function setupAudio() {
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const audioLoader = new THREE.AudioLoader();
    const backgroundSound = new THREE.Audio(listener);

    audioLoader.load('/public/space-station-247790.mp3', (buffer) => {
        backgroundSound.setBuffer(buffer);
        backgroundSound.setLoop(true);
        backgroundSound.setVolume(0.5);
        backgroundSound.play();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'm') {
            if (backgroundSound.isPlaying) {
                backgroundSound.pause();
            } else {
                backgroundSound.play();
            }
        }
    });

    const coinSound = new THREE.Audio(listener);
    audioLoader.load('/public/coin-sound.mp3', (buffer) => {
        coinSound.setBuffer(buffer);
        coinSound.setVolume(0.7);
    });

    window.coinSound = coinSound;
}

function loadLevel(level) {
    console.log(`Loading Level ${level}...`);

    // Reset collectibles and score for the new level
    collectibles.forEach((coin) => scene.remove(coin));
    collectibles.length = 0;
    score = 0;
    updateScore();

    scatterCollectibles(level);

    levelElement.textContent = `Level: ${level}`;

    // Reset and start the timer
    clearInterval(timerInterval);
    timer =120;
    updateTimer();
    startTimer();
}

function updateTimer() {
    timerElement.textContent = `Time: ${Math.floor(timer)}s`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (!isPaused) {
            timer--;
            updateTimer();

            if (timer <= 0) {
                clearInterval(timerInterval);
                onLevelFail();
            }
        }
    }, 1000);
}

function onLevelFail() {
    showMessage('Time is up! Press Enter To Try again.');
    isPaused = true;
}

function resetCharacterPosition() {
    if (character) {
        character.position.set(0, 0, 0); // Reset position
        character.rotation.set(0, 0, 0); // Reset rotation
    }
}

function nextLevel() {
    clearInterval(timerInterval);

    if (currentLevel < totalLevels) {
        currentLevel++;
        showMessage('Congratulations! Press Enter to start the next level.');
        isPaused = true; // Pause the game until Enter is pressed
    } else {
        showMessage('Congratulations! You completed all levels!');
    }
}

function showMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.style.position = 'absolute';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.background = 'rgba(0, 0, 0, 0.8)';
    messageElement.style.color = 'white';
    messageElement.style.padding = '20px';
    messageElement.style.borderRadius = '10px';
    messageElement.style.fontSize = '20px';
    messageElement.textContent = message;

    document.body.appendChild(messageElement);

    setTimeout(() => {
        if (!isPaused) {
            document.body.removeChild(messageElement);
        }
    }, 3000); // Display message for 3 seconds unless paused
}

function scatterCollectibles(level) {
    const numberOfCoins = 20;
    const baseDistance = 150;
    const levelMultiplier = level * 2;
    const maxDistance = baseDistance + levelMultiplier;

    for (let i = 0; i < numberOfCoins; i++) {
        const distance = THREE.MathUtils.randFloat(baseDistance, maxDistance);
        const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const y = 1;

        const position = new THREE.Vector3(x, y, z);
        createCollectible(position);
    }
}

function createCollectible(position) {
    const textureLoader = new THREE.TextureLoader();
    const coinFaceTexture = textureLoader.load('/public/coin.jpeg');
    const coinEdgeTexture = textureLoader.load('/public/coin.jpeg');

    const geometry = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 32);
    const materials = [
        new THREE.MeshStandardMaterial({ map: coinFaceTexture, side: THREE.DoubleSide }),
        new THREE.MeshStandardMaterial({ map: coinFaceTexture, side: THREE.DoubleSide }),
        new THREE.MeshStandardMaterial({ map: coinEdgeTexture })
    ];

    const collectible = new THREE.Mesh(geometry, materials);
    collectible.rotation.x = Math.PI / 2;
    collectible.position.copy(position);
    scene.add(collectible);
    collectibles.push(collectible);
}

function checkCollisions() {
    collectibles.forEach((collectible, index) => {
        const distance = character.position.distanceTo(collectible.position);

        if (distance < 1.5) {
            scene.remove(collectible);
            collectibles.splice(index, 1);
            score += 10;
            updateScore();

            window.coinSound.play();

            if (score >= pointsToPass) {
                console.log('Level Complete!');
                nextLevel();
            }
        }
    });
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    if (character && !isPaused) {
        // Update camera to follow character
        const offset = new THREE.Vector3(0, 7, 10);
        const characterRotation = character.rotation.y;
        const cameraPosition = new THREE.Vector3(
            character.position.x - Math.sin(characterRotation) * offset.z,
            character.position.y + offset.y,
            character.position.z - Math.cos(characterRotation) * offset.z
        );
        camera.position.copy(cameraPosition);
        camera.lookAt(character.position.clone().add(new THREE.Vector3(0, 2, 0)));

        // Check for collisions with collectibles
        checkCollisions();
    }

    // Rotate coins
    collectibles.forEach((coin) => {
        coin.rotation.z += 0.05; // Adjust rotation speed as needed
    });

    renderer.render(scene, camera);
}
