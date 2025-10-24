// Global variables
let canvas;
let engine;
let scene;
let camera;
let mainMesh;
let currentFaceIndex = 0;
let targetRotation = 0;
let currentRotation = 0;
let rotationVelocity = 0;
let isRotating = false;

// Define the 4 faces and their rotation angles (in radians)
const faces = [
    { index: 0, rotation: 0, label: '3D Modelling' },
    { index: 1, rotation: Math.PI / 2, label: 'Architecture Visualisation' },
    { index: 2, rotation: Math.PI, label: 'Web Design' },
    { index: 3, rotation: (Math.PI * 3) / 2, label: 'Animation' }
];

// Initialize the scene
function init() {
    canvas = document.getElementById('renderCanvas');
    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, alpha: true });

    createScene();
    
    // Run the render loop
    engine.runRenderLoop(() => {
        // Animation with anticipation and follow-through
        if (mainMesh) {
            const diff = targetRotation - currentRotation;
            const absDiff = Math.abs(diff);
            
            if (absDiff > 0.001) {
                // Anticipation: slight reverse motion at start
                if (absDiff > 1.3 && !isRotating) {
                    isRotating = true;
                    // Small backward motion (anticipation)
                    const anticipation = -Math.sign(diff) * 0.05;
                    currentRotation += anticipation;
                }
                
                // Main rotation with acceleration (slower)
                const acceleration = diff * 0.06;
                rotationVelocity += acceleration;
                rotationVelocity *= 0.88; // Damping
                currentRotation += rotationVelocity;
                
                // Follow-through: overshoot and settle
                if (absDiff < 0.1) {
                    rotationVelocity *= 0.75; // Stronger damping near target
                }
            } else {
                // Settle to exact position
                currentRotation = targetRotation;
                rotationVelocity = 0;
                isRotating = false;
            }
            
            mainMesh.rotation.y = currentRotation;
        }
        
        scene.render();
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        engine.resize();
    });
    
    // Setup scroll behavior
    setupScrollControl();
}

// Create the Babylon.js scene
function createScene() {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // Transparent background
    
    // Create camera with angled perspective (matching Blender view)
    camera = new BABYLON.ArcRotateCamera(
        'camera',
        -Math.PI / 6,  // Alpha: ~60 degrees to the side (not exactly 45)
        Math.PI / 3,   // Beta: lower angle (~45 degrees) - cube faces point upward
        7,
        new BABYLON.Vector3(0, 0, 0),
        scene
    );
    camera.attachControl(canvas, false);
    
    // Disable camera controls (we control rotation via scroll)
    camera.inputs.clear();
    
    // Add lights
    const hemisphericLight = new BABYLON.HemisphericLight(
        'hemiLight',
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    hemisphericLight.intensity = 0.6;
    
    const directionalLight = new BABYLON.DirectionalLight(
        'dirLight',
        new BABYLON.Vector3(-1, -2, -1),
        scene
    );
    directionalLight.position = new BABYLON.Vector3(20, 40, 20);
    directionalLight.intensity = 0.8;
    
    // Create a placeholder 3D model (you can replace this with your own model)
    createPlaceholderModel();
    
    // Optional: Load your own 3D model
    // loadCustomModel();
}

// Create a placeholder 3D cube model with text on each face
function createPlaceholderModel() {
    // Create the main cube
    mainMesh = BABYLON.MeshBuilder.CreateBox('cube', { size: 3 }, scene);
    
    // Create a multi-material for different faces
    const multiMat = new BABYLON.MultiMaterial('multi', scene);
    
    const faceColors = [
        new BABYLON.Color3(0.8, 0.3, 0.3),   // Face 0 - Red (3D Art)
        new BABYLON.Color3(0.3, 0.8, 0.3),   // Face 1 - Green (Web)
        new BABYLON.Color3(0.3, 0.3, 0.8),   // Face 2 - Blue (Arc Vis)
        new BABYLON.Color3(0.8, 0.8, 0.3),   // Face 3 - Yellow (Projects)
        new BABYLON.Color3(0.5, 0.5, 0.5),   // Top
        new BABYLON.Color3(0.5, 0.5, 0.5)    // Bottom
    ];
    
    // Create materials for each face
    for (let i = 0; i < 6; i++) {
        const mat = new BABYLON.StandardMaterial(`mat${i}`, scene);
        mat.diffuseColor = faceColors[i];
        mat.emissiveColor = faceColors[i].scale(0.2);
        mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        multiMat.subMaterials.push(mat);
    }
    
    mainMesh.material = multiMat;
    
    // Set the submesh for each face of the cube
    mainMesh.subMeshes = [];
    const verticesCount = mainMesh.getTotalVertices();
    mainMesh.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 0, 6, mainMesh));
    mainMesh.subMeshes.push(new BABYLON.SubMesh(1, 0, verticesCount, 6, 6, mainMesh));
    mainMesh.subMeshes.push(new BABYLON.SubMesh(2, 0, verticesCount, 12, 6, mainMesh));
    mainMesh.subMeshes.push(new BABYLON.SubMesh(3, 0, verticesCount, 18, 6, mainMesh));
    mainMesh.subMeshes.push(new BABYLON.SubMesh(4, 0, verticesCount, 24, 6, mainMesh));
    mainMesh.subMeshes.push(new BABYLON.SubMesh(5, 0, verticesCount, 30, 6, mainMesh));
    
    // Add subtle floating animation
    let time = 0;
    scene.registerBeforeRender(() => {
        time += 0.01;
        mainMesh.position.y = Math.sin(time) * 0.15;
    });
}

// Optional: Load your own 3D model (uncomment and modify as needed)
function loadCustomModel() {
    // Example: Load a .glb or .babylon file
    BABYLON.SceneLoader.ImportMesh(
        '',
        'models/',  // folder path
        'your-model.glb',  // filename
        scene,
        (meshes) => {
            mainMesh = meshes[0];
            mainMesh.position = new BABYLON.Vector3(0, 0, 0);
            
            // Optional: scale the model
            mainMesh.scaling = new BABYLON.Vector3(1, 1, 1);
        },
        null,
        (scene, message) => {
            console.error('Error loading model:', message);
            // Fallback to placeholder
            createPlaceholderModel();
        }
    );
}

// Setup scroll control to snap rotate the model between fixed positions
function setupScrollControl() {
    const scrollIndicator = document.getElementById('scroll-indicator');
    let hasScrolled = false;
    let scrollDebounceTimer = null;
    
    // Prevent default scroll behavior and handle discrete face changes
    window.addEventListener('wheel', (event) => {
        event.preventDefault();
        
        // Hide scroll indicator after first scroll
        if (!hasScrolled) {
            hasScrolled = true;
            scrollIndicator.classList.add('hidden');
        }
        
        // Debounce scrolling to prevent rapid changes
        clearTimeout(scrollDebounceTimer);
        scrollDebounceTimer = setTimeout(() => {
            // Determine scroll direction
            if (event.deltaY > 0) {
                // Scroll down - next face (continuous rotation)
                currentFaceIndex = (currentFaceIndex + 1) % faces.length;
                targetRotation += Math.PI / 2; // Add 90 degrees continuously
            } else {
                // Scroll up - previous face (continuous rotation)
                currentFaceIndex = (currentFaceIndex - 1 + faces.length) % faces.length;
                targetRotation -= Math.PI / 2; // Subtract 90 degrees continuously
            }
            
            // Update content panel
            updateContentPanel();
        }, 50);
        
    }, { passive: false });
    
    // Touch support for mobile
    let touchStartY = 0;
    let touchMoved = false;
    
    canvas.addEventListener('touchstart', (event) => {
        touchStartY = event.touches[0].clientY;
        touchMoved = false;
    });
    
    canvas.addEventListener('touchmove', (event) => {
        touchMoved = true;
    });
    
    canvas.addEventListener('touchend', (event) => {
        if (!touchMoved) return;
        
        const touchEndY = event.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;
        
        if (!hasScrolled) {
            hasScrolled = true;
            scrollIndicator.classList.add('hidden');
        }
        
        // Threshold for changing face (at least 30px swipe)
        if (Math.abs(deltaY) > 30) {
            if (deltaY > 0) {
                // Swipe up - next face (continuous rotation)
                currentFaceIndex = (currentFaceIndex + 1) % faces.length;
                targetRotation += Math.PI / 2;
            } else {
                // Swipe down - previous face (continuous rotation)
                currentFaceIndex = (currentFaceIndex - 1 + faces.length) % faces.length;
                targetRotation -= Math.PI / 2;
            }
            
            updateContentPanel();
        }
    });
}

// Update content panel visibility based on current face
function updateContentPanel() {
    const panels = document.querySelectorAll('.content-panel');
    
    panels.forEach(panel => {
        const panelFace = parseInt(panel.dataset.face);
        if (panelFace === currentFaceIndex) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the 3D scene
    init();
    
    // Set initial content panel
    updateContentPanel();
    
    // Add keyboard navigation (optional - arrow keys)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            currentFaceIndex = (currentFaceIndex + 1) % faces.length;
            targetRotation += Math.PI / 2; // Continuous rotation
            updateContentPanel();
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            currentFaceIndex = (currentFaceIndex - 1 + faces.length) % faces.length;
            targetRotation -= Math.PI / 2; // Continuous rotation
            updateContentPanel();
        }
    });
});
