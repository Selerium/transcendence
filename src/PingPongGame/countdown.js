import { startGame } from "./Game.js";

/**
 * Represents a camera object that is typically used to capture or display visual data.
 * This object may be utilized in various contexts such as rendering scenes,
 * taking photographs, or streaming video.
 *
 * The camera object can hold properties and functionalities like position, orientation,
 * and settings (e.g., field of view, zoom, resolution). It may also interact with other
 * components, such as scenes or image processors, to facilitate its usage within an application.
 */
let scene, camera, renderer;
/**
 * Represents a text mesh object used for displaying and rendering text in a 3D environment.
 * Typically used in 3D graphics frameworks or libraries to add text to scenes.
 * Can include properties for managing its material, geometry, position, scaling, and text content.
 */
let textMesh;
/**
 * The `fontLoader` variable is an instance of `THREE.FontLoader` from the Three.js library.
 * It is used to load font files in various formats, enabling the creation of text geometry
 * for use in 3D scenes. By loading a font, you can define and display 3D text objects.
 */
let fontLoader = new THREE.FontLoader();
/**
 * Represents a material configuration for rendering text in a graphical environment.
 * This variable typically contains properties for defining the appearance of text,
 * such as color, font style, size, texture, and other visual attributes.
 * Used commonly in 2D/3D rendering contexts to define text aesthetics.
 */
let textMaterial;

// Initialize the Three.js Scene
/**
 * Initializes the countdown by setting up the Three.js scene, camera, and renderer.
 * Also loads the font and initiates the countdown process.
 *
 * @return {void} No return value.
 */
function initCountDown() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('threeCanvas'),  alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.position.z = 5;

    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });  
        startCountdown(font);
    });

    animate();
}


/**
 * Creates and displays a countdown text in the scene using the specified font and text.
 *
 * @param {THREE.Font} font - The font to be used for rendering the countdown text.
 * @param {string} text - The content of the countdown text to display.
 * @return {void} This function does not return a value.
 */
function createCountdownText(font, text) {

    if (textMesh) {
        scene.remove(textMesh);
    }
    let textGeometry = new THREE.TextGeometry(text, {
        font: font,
        size: 1,
        height: 0.2,
        curveSegments: 12,
    });

    textGeometry.center(); // Center the text geometry

    // Create a new text mesh and add it to the scene
    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    scene.add(textMesh);
}

/**
 * Represents the starting number for a countdown sequence.
 * This variable holds the initial integer from which a countdown begins.
 * Typically, it is decremented over time until reaching 0 or a specified endpoint.
 *
 * @type {number}
 */
let countdownNumber = 4; // Starting number of the countdown
/**
 * Represents the time interval in milliseconds for a countdown timer.
 * This variable defines the duration between each tick or step of the timer.
 * Useful for implementing countdown functionalities or periodic actions.
 *
 * @type {number}
 */
let countdownInterval;
/**
 * Indicates whether rotation is enabled or disabled.
 *
 * This boolean variable determines the state of a feature related to rotation.
 * If set to `true`, rotation is active; if set to `false`, rotation is inactive.
 */
let rotation = false;

/**
 * Initiates a countdown timer, rendering 3D text for each countdown value and starting the game upon completion.
 *
 * @param {Object} font - A THREE.Font object used to create the 3D countdown text.
 * @return {void} This method does not return anything.
 */
function startCountdown(font) {
    // Set up the countdown timer that updates every second
    countdownInterval = setInterval(() => {
        countdownNumber--; // Decrement the countdown

        if (countdownNumber > 0) {
            // Update the 3D text to show the new countdown number
            createCountdownText(font, countdownNumber.toString());
			rotation = true;
        } else {
            clearInterval(countdownInterval); // Stop the interval once countdown reaches 0

            // Display "Go!" when the countdown finishes
            createCountdownText(font, 'Go!');
			rotation = false;
			setTimeout(() => {
                if (textMesh) {
                    scene.remove(textMesh); // Remove the text from the scene
                    textMesh.geometry.dispose(); // Clean up memory
                    textMesh = null; // Set textMesh to null to ensure it's cleared
                }
                startGame(); // Start the game
            }, 1000); // Remove after 1 second (1000ms)
        }
    }, 1000); // Countdown changes every second (1000ms)
	scene.remove(textMesh);
}


// Animation loop
/**
 * Continuously updates the animation frame, rotates the text mesh if applicable,
 * and renders the scene using the renderer and camera.
 *
 * @return {void} Does not return a value.
 */
function animate() {
    requestAnimationFrame(animate);
    if (textMesh && rotation===true) textMesh.rotation.y += 0.06;
    renderer.render(scene, camera);
}

initCountDown();
