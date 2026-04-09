import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { VRButton } from 'https://unpkg.com/three@0.160.0/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'https://unpkg.com/three@0.160.0/examples/jsm/webxr/XRControllerModelFactory.js';

const ui = {
    easyBtn: document.getElementById('easyBtn'),
    hardBtn: document.getElementById('hardBtn'),
    restartBtn: document.getElementById('restartBtn'),
    modeLabel: document.getElementById('modeLabel'),
    levelLabel: document.getElementById('levelLabel'),
    timerLabel: document.getElementById('timerLabel'),
    status: document.getElementById('status')
};

// 1. Khởi tạo Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1f1f1f);

// 2. Khởi tạo Camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 3);

// 3. Khởi tạo Renderer & Bật WebXR
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// 4. Thêm ánh sáng cơ bản
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
light.position.set(0, 1, 0);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

// 5. Mặt sàn
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Raycaster
const raycaster = new THREE.Raycaster();
const intersected = [];
const tempMatrix = new THREE.Matrix4();

// Group chứa vật thể tương tác
const interactableObjects = new THREE.Group();
scene.add(interactableObjects);

const levelGroup = new THREE.Group();
scene.add(levelGroup);

let controller1, controller2;
let controllerGrip1, controllerGrip2;

// ===== Gameplay Data =====
const LEVELS = [
    {
        name: 'Primary',
        colors: [
            { id: 'red', name: 'Red', value: 0xff1e1e },
            { id: 'yellow', name: 'Yellow', value: 0xfff200 },
            { id: 'blue', name: 'Blue', value: 0x1e6bff }
        ]
    },
    {
        name: 'Secondary',
        colors: [
            { id: 'orange', name: 'Orange', value: 0xff8c1a },
            { id: 'green', name: 'Green', value: 0x2ecc71 },
            { id: 'purple', name: 'Purple', value: 0x8e44ad }
        ]
    },
    {
        name: 'Tertiary',
        colors: [
            { id: 'red-orange', name: 'Red-Orange', value: 0xff4d1a },
            { id: 'yellow-orange', name: 'Yellow-Orange', value: 0xffb31a },
            { id: 'yellow-green', name: 'Yellow-Green', value: 0x9ad51a },
            { id: 'blue-green', name: 'Blue-Green', value: 0x1ab3a6 },
            { id: 'blue-purple', name: 'Blue-Purple', value: 0x4b4bff },
            { id: 'red-purple', name: 'Red-Purple', value: 0xc81aff }
        ]
    }
];

const MODE = {
    EASY: 'Easy',
    HARD: 'Hard'
};

const timeLimits = [60, 75, 90];
let currentMode = null;
let currentLevelIndex = 0;
let activeSlots = [];
let activePieces = [];
let levelStarted = false;
let timer = 0;
let lastFrameTime = performance.now();

// ===== Audio (WebAudio synth) =====
const listener = new THREE.AudioListener();
camera.add(listener);
let audioReady = false;
let bgOsc = null;
let bgGain = null;

function initAudio() {
    if (audioReady) return;
    const context = listener.context;
    bgGain = context.createGain();
    bgGain.gain.value = 0.02;
    bgGain.connect(context.destination);

    bgOsc = context.createOscillator();
    bgOsc.type = 'sine';
    bgOsc.frequency.value = 140;
    bgOsc.connect(bgGain);
    bgOsc.start();
    audioReady = true;
}

function playSfx(type) {
    if (!audioReady) return;
    const context = listener.context;
    const osc = context.createOscillator();
    const gain = context.createGain();
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(context.destination);

    if (type === 'grab') {
        osc.frequency.value = 440;
    } else if (type === 'correct') {
        osc.frequency.value = 660;
    } else if (type === 'wrong') {
        osc.frequency.value = 220;
    } else if (type === 'level') {
        osc.frequency.value = 880;
    } else if (type === 'win') {
        osc.frequency.value = 990;
    }

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);
    osc.stop(context.currentTime + 0.25);
}

// ===== UI =====
function setStatus(text) {
    ui.status.textContent = text;
}

function updateLabels() {
    ui.modeLabel.textContent = `Mode: ${currentMode ?? '-'}`;
    ui.levelLabel.textContent = `Level: ${currentLevelIndex + 1} (${LEVELS[currentLevelIndex].name})`;
    ui.timerLabel.textContent = currentMode === MODE.HARD ? `Time: ${Math.max(0, Math.ceil(timer))}s` : 'Time: --';
}

ui.easyBtn.addEventListener('click', () => startGame(MODE.EASY));
ui.hardBtn.addEventListener('click', () => startGame(MODE.HARD));
ui.restartBtn.addEventListener('click', () => startGame(currentMode ?? MODE.EASY));

function startGame(mode) {
    initAudio();
    currentMode = mode;
    currentLevelIndex = 0;
    buildLevel(currentLevelIndex);
    setStatus('Bắt đầu! Đặt màu đúng vị trí trên vòng tròn.');
    updateLabels();
}

// ===== Level Build =====
const wheelCenter = new THREE.Vector3(0, 1.5, -1.8);
const wheelRadius = 0.9;
const slotRadius = 0.08;
const snapDistance = 0.15;

function clearLevel() {
    while (levelGroup.children.length) levelGroup.remove(levelGroup.children[0]);
    while (interactableObjects.children.length) interactableObjects.remove(interactableObjects.children[0]);
    activeSlots = [];
    activePieces = [];
}

function buildLevel(index) {
    clearLevel();
    const level = LEVELS[index];
    const colorCount = level.colors.length;

    const ring = new THREE.TorusGeometry(wheelRadius, 0.02, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6, metalness: 0.1 });
    const ringMesh = new THREE.Mesh(ring, ringMat);
    ringMesh.position.copy(wheelCenter);
    ringMesh.rotation.x = Math.PI / 2;
    levelGroup.add(ringMesh);

    for (let i = 0; i < colorCount; i += 1) {
        const angle = (i / colorCount) * Math.PI * 2;
        const slotPos = new THREE.Vector3(
            wheelCenter.x + Math.cos(angle) * wheelRadius,
            wheelCenter.y + Math.sin(angle) * wheelRadius,
            wheelCenter.z
        );

        const slotGeo = new THREE.TorusGeometry(slotRadius, 0.015, 12, 32);
        const slotMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
        const slotMesh = new THREE.Mesh(slotGeo, slotMat);
        slotMesh.position.copy(slotPos);
        slotMesh.rotation.x = Math.PI / 2;
        slotMesh.userData = {
            colorId: level.colors[i].id,
            occupied: false,
            position: slotPos.clone()
        };
        levelGroup.add(slotMesh);
        activeSlots.push(slotMesh);
    }

    const spawnStart = new THREE.Vector3(-0.6, 1.1, -0.6);
    const spawnGap = 0.25;
    const sphereGeo = new THREE.SphereGeometry(0.06, 24, 24);

    level.colors.forEach((color, i) => {
        const mat = new THREE.MeshStandardMaterial({
            color: color.value,
            emissive: new THREE.Color(0x000000),
            roughness: 0.3,
            metalness: 0.1
        });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.position.set(
            spawnStart.x + i * spawnGap,
            spawnStart.y,
            spawnStart.z
        );
        mesh.userData = {
            colorId: color.id,
            spawnPosition: mesh.position.clone(),
            placed: false
        };
        interactableObjects.add(mesh);
        activePieces.push(mesh);
    });

    levelStarted = true;
    timer = currentMode === MODE.HARD ? timeLimits[index] : 0;
    updateLabels();
}

// ===== Controller Handling =====
function onSelectStart(event) {
    initAudio();
    if (!levelStarted) return;
    const controller = event.target;
    const intersections = getIntersections(controller);

    if (intersections.length > 0) {
        const intersection = intersections[0];
        const object = intersection.object;
        if (object.userData.placed) return;

        object.material.emissive.b = 0.5;
        controller.attach(object);
        controller.userData.selected = object;
        playSfx('grab');
    }
}

function onSelectEnd(event) {
    const controller = event.target;
    if (!levelStarted) return;
    if (controller.userData.selected !== undefined) {
        const object = controller.userData.selected;
        object.material.emissive.b = 0;
        scene.attach(object);
        controller.userData.selected = undefined;

        const target = getNearestSlot(object.position);
        if (target && target.userData.colorId === object.userData.colorId && !target.userData.occupied) {
            object.position.copy(target.userData.position);
            object.userData.placed = true;
            target.userData.occupied = true;
            playSfx('correct');
            checkLevelComplete();
        } else {
            object.position.copy(object.userData.spawnPosition);
            playSfx('wrong');
        }
    }
}

function getNearestSlot(position) {
    let nearest = null;
    let minDist = Infinity;
    for (const slot of activeSlots) {
        const dist = slot.position.distanceTo(position);
        if (dist < minDist) {
            minDist = dist;
            nearest = slot;
        }
    }
    if (minDist <= snapDistance) return nearest;
    return null;
}

function checkLevelComplete() {
    const allPlaced = activePieces.every((p) => p.userData.placed);
    if (!allPlaced) return;

    playSfx('level');
    if (currentLevelIndex < LEVELS.length - 1) {
        currentLevelIndex += 1;
        buildLevel(currentLevelIndex);
        setStatus(`Level ${currentLevelIndex} hoàn thành! Mở khóa level tiếp theo.`);
    } else {
        levelStarted = false;
        setStatus('Chiến thắng! Bạn đã hoàn thành Level 3.');
        playSfx('win');
    }
    updateLabels();
}

function getIntersections(controller) {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    return raycaster.intersectObjects(interactableObjects.children, false);
}

function intersectObjects(controller) {
    if (controller.userData.selected !== undefined) return;

    const line = controller.getObjectByName('line');
    const intersections = getIntersections(controller);

    if (intersections.length > 0) {
        const intersection = intersections[0];
        const object = intersection.object;

        object.material.emissive.r = 0.3;
        intersected.push(object);
        line.scale.z = intersection.distance / 5;
    } else {
        line.scale.z = 1;
    }
}

function cleanIntersected() {
    while (intersected.length) {
        const object = intersected.pop();
        object.material.emissive.r = 0;
    }
}

// Controller setup
controller1 = renderer.xr.getController(0);
controller1.addEventListener('selectstart', onSelectStart);
controller1.addEventListener('selectend', onSelectEnd);
scene.add(controller1);

controller2 = renderer.xr.getController(1);
controller2.addEventListener('selectstart', onSelectStart);
controller2.addEventListener('selectend', onSelectEnd);
scene.add(controller2);

const controllerModelFactory = new XRControllerModelFactory();

controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
scene.add(controllerGrip1);

controllerGrip2 = renderer.xr.getControllerGrip(1);
controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
scene.add(controllerGrip2);

const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -5)
]);
const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
});
const line = new THREE.Line(geometry, material);
line.name = 'line';
controller1.add(line.clone());
controller2.add(line.clone());

// Resize
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Game Loop
renderer.setAnimationLoop(function () {
    const now = performance.now();
    const delta = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    if (levelStarted && currentMode === MODE.HARD) {
        timer -= delta;
        if (timer <= 0) {
            timer = 0;
            levelStarted = false;
            setStatus('Hết giờ! Nhấn Restart để thử lại.');
            playSfx('wrong');
        }
    }

    updateLabels();
    cleanIntersected();
    intersectObjects(controller1);
    intersectObjects(controller2);
    renderer.render(scene, camera);
});