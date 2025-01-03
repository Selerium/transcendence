const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const material = new THREE.MeshStandardMaterial({
    color: 0xf0c419, // Gold-like color
    metalness: 0.7,
    roughness: 0.4,
});


const paddleHeadGeometry = new THREE.SphereGeometry(2.5, 32, 32);
paddleHeadGeometry.scale(0.8, 0.9, 0.16); // Flatten along Z-axis
const paddleHead = new THREE.Mesh(paddleHeadGeometry, material);
paddleHead.position.y = 2; // Adjusted for better alignment


const handleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 32); // Shortened handle
const handle = new THREE.Mesh(handleGeometry, material);
handle.position.set(0, 0, 0); // Align with the paddle head


const paddleGroup = new THREE.Group();
paddleGroup.add(paddleHead);
paddleGroup.add(handle);


paddleGroup.rotation.z = Math.PI / 3; // Tilt 45 degrees around Z-axis
// paddleGroup.rotation.x = Math.PI / 8; // Slight tilt along X-axis


paddleGroup.position.y = 13-5.75;


const baseGeometry = new THREE.CylinderGeometry(2, 3, 1, 32);
const base = new THREE.Mesh(baseGeometry, material);
base.position.y = -5.75;

const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.5, 5, 32);
const body = new THREE.Mesh(bodyGeometry, material);
body.position.y = 3-5.75;

const topGeometry = new THREE.CylinderGeometry(2, 2, 1, 32);
const top = new THREE.Mesh(topGeometry, material);
top.position.y = 6-5.75;

const ballGeometry = new THREE.DodecahedronGeometry(1.5,32,32);
const ball = new THREE.Mesh(ballGeometry, material);
ball.position.y = 6.5-5.75;

const topGeometry2 = new THREE.TorusGeometry(3, 0.3, 20, 100);
const top2 = new THREE.Mesh(topGeometry2, material);
const top2_2 = new THREE.Mesh(topGeometry2, material);
top2.scale.set(0.6, 1, 1);
top2_2.scale.set(0.6, 1, 1);
top2.position.y = 8.3-5.75;
top2_2.position.y = 8.3-5.75;
top2_2.rotation.y = Math.PI / 2;

const topGeometry3 =  new THREE.CylinderGeometry(1.5, 1.5, 0.6, 32);
const top3 = new THREE.Mesh(topGeometry3, material);
top3.position.y = 11.5-5.75;

let text = null; // Declare text mesh


const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('42', {
        font: font,
        size: 2,
        height: 0.6,
    });


    textGeometry.computeBoundingBox();
    const bbox = textGeometry.boundingBox;
    const centerOffsetX = (bbox.max.x + bbox.min.x) / 2;
    const centerOffsetY = (bbox.max.y + bbox.min.y) / 2;

    textGeometry.translate(-centerOffsetX, -centerOffsetY, 0);

    text = new THREE.Mesh(textGeometry, material);
    text.position.set(0, 9.2-5.75, 0); // Position the text above the paddle head
    trophyGroup.add(text);
});


const trophyGroup = new THREE.Group();
trophyGroup.add(base);
trophyGroup.add(body);
trophyGroup.add(top);
trophyGroup.add(ball);
trophyGroup.add(top2);
trophyGroup.add(top2_2);
trophyGroup.add(top3);
trophyGroup.add(paddleGroup); // Add the paddle group to the trophy


scene.add(trophyGroup)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 10, 5);
scene.add(pointLight);


camera.position.set(0, 10, 25);
camera.lookAt(0, 5, 0);


let mouse = {
    x:0,
    y:0
};
document.addEventListener('mousemove', (event) => {
event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
})

// trophyGroup.rotation.y = THREE.MathUtils.lerp(trophyGroup.rotation.y, (mouse.x * Math.PI) / 10, 0.1)
// trophyGroup.rotation.x = THREE.MathUtils.lerp(trophyGroup.rotation.x, (mouse.y * Math.PI) / 10, 0.1)


export function animate() {
    requestAnimationFrame(animate);
    trophyGroup.rotation.z = THREE.MathUtils.lerp(trophyGroup.rotation.z, (mouse.x * Math.PI) / 10, 0.1)
    trophyGroup.rotation.x = THREE.MathUtils.lerp(trophyGroup.rotation.x, (mouse.y * Math.PI) / 10, 0.1)
    trophyGroup.rotation.y += 0.01; // Rotate around Y-axis

    renderer.render(scene, camera);
}

