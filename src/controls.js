export function setupControls(character, mixer, animations) {
    let currentAction = null;
    const keys = { forward: false, backward: false, left: false, right: false, run: false, jump: false };

    function switchAnimation(name) {
        if (currentAction !== animations[name]) {
            if (currentAction) currentAction.fadeOut(0.2);
            currentAction = animations[name];
            if (currentAction) currentAction.reset().fadeIn(0.2).play();
        }
    }

    window.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': keys.forward = true; break;
            case 'KeyS': keys.backward = true; break;
            case 'KeyA': keys.left = true; break;
            case 'KeyD': keys.right = true; break;
            case 'ShiftLeft': keys.run = true; break;
            case 'Space': keys.jump = true; break;
        }
        updateMovement();
    });

    window.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW': keys.forward = false; break;
            case 'KeyS': keys.backward = false; break;
            case 'KeyA': keys.left = false; break;
            case 'KeyD': keys.right = false; break;
            case 'ShiftLeft': keys.run = false; break;
            case 'Space': keys.jump = false; break;
        }
        updateMovement();
    });

const movementSpeed = 0.2; // Base speed for walking
const runSpeedMultiplier = 2; // Running speed multiplier
const rotationSpeed = 0.05; // Rotation speed for left/right turn

function updateMovement() {
    // Handle forward/backward movement
    if (keys.forward) {
        character.translateZ(movementSpeed * (keys.run ? runSpeedMultiplier : 1)); // Move forward
    }
    if (keys.backward) {
        character.translateZ(-movementSpeed * (keys.run ? runSpeedMultiplier : 1)); // Move backward
    }
    
    // Handle left/right rotation while moving forward
    if (keys.left) {
        character.rotation.y += rotationSpeed; // Turn left (rotate counterclockwise)
    }
    if (keys.right) {
        character.rotation.y -= rotationSpeed; // Turn right (rotate clockwise)
    }

    // Handle jump animation
    if (keys.jump) {
        switchAnimation('Jump');
    } else if (keys.forward && keys.run) {
        switchAnimation('Run');
    } else if (keys.forward) {
        switchAnimation('Walk');
    } else {
        switchAnimation(null); // Idle animation
    }
}

}
