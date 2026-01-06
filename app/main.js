// app/main.js

import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

let camera, scene, renderer, effect;
let textMesh;
let container;

// NEU: Variablen für die Drag-Logik
let isDragging = false;
const previousMousePosition = {
    x: 0,
    y: 0
};

function init() {
    container = document.getElementById('ascii-container');

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.z = 200;

    scene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const fontLoader = new FontLoader();
    fontLoader.load(
        'https://unpkg.com/three@0.158.0/examples/fonts/helvetiker_regular.typeface.json',
        (font) => {
            const textGeometry = new TextGeometry('Stormatt', {
                font: font,
                size: 80,
                height: 10,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 1,
                bevelOffset: 0,
                bevelSegments: 5
            });
            textGeometry.center();
            const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
            textMesh = new THREE.Mesh(textGeometry, textMaterial);
            scene.add(textMesh);
        }
    );

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);

    effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: false });
    effect.setSize(container.clientWidth, container.clientHeight);
    effect.domElement.style.color = 'black';
    effect.domElement.style.backgroundColor = 'transparent';

    container.appendChild(effect.domElement);

    // NEU: Die Event Listener werden auf den Container angewendet
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    // Wir hören auf 'mouseup' und 'mouseleave' am ganzen Fenster,
    // damit der Drag auch endet, wenn man die Maus außerhalb loslässt.
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mouseleave', onMouseUp);

    window.addEventListener('resize', onWindowResize);
    
    tick();
}

// NEU: Event-Handler für den Start des Drags
function onMouseDown(event) {
    isDragging = true;
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
}

// NEU: Event-Handler für das Ende des Drags
function onMouseUp() {
    isDragging = false;
}

// NEU: Event-Handler für die Bewegung während des Drags
function onMouseMove(event) {
    // Führe nichts aus, wenn nicht gedraggt wird
    if (!isDragging || !textMesh) {
        return;
    }

    // Berechne die Differenz zur letzten Mausposition
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;

    // Addiere die Differenz zur aktuellen Rotation
    // Der Faktor steuert die Empfindlichkeit der Drehung
    textMesh.rotation.y += deltaX * 0.0025;
    textMesh.rotation.x += deltaY * 0.0025;

    // Speichere die aktuelle Position für die nächste Berechnung
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
}

function onWindowResize() {
    // ... (Diese Funktion bleibt unverändert)
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    effect.setSize(width, height);
}

// Die Animationsschleife ('tick') ist jetzt viel einfacher
function tick() {
    requestAnimationFrame(tick);
    // Es gibt keine aktive Animation mehr, wir rendern nur die Szene.
    // Die Rotation wird durch die Maus-Events direkt verändert.
    render();
}

function render() {
    effect.render(scene, camera);
}

init();
