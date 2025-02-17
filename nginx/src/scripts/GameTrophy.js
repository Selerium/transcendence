let scene, camera, renderer, trophyGroup,  textWinner, textScore;
let text = null;

let trophyLoopId;


export function waitForCanvasAndStartTrophy(mode , tournamentResults) {
    const checkInterval = setInterval(() => {
        const canvas = document.getElementById("gameTrophy");
        if (canvas) {
            clearInterval(checkInterval);
            initTrophy(canvas,mode , tournamentResults); 
        }
        else 
        {
        cancelAnimationFrame(trophyLoopId);
        }
    }, 100);
}

function initTrophy(canvas, mode , tournamentResults) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const material = new THREE.MeshStandardMaterial({
        color: 0xf0c419,
        metalness: 0.7,
        roughness: 0.4,
    });

    // Create Trophy Parts
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, 1, 32), material);
    base.position.y = -5.75;

    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 5, 32), material);
    body.position.y = 3 - 5.75;

    const top = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 1, 32), material);
    top.position.y = 6 - 5.75;

    const ball = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 32, 32), material);
    ball.position.y = 6.5 - 5.75;

    // Paddle Head & Handle
    const paddleHeadGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    paddleHeadGeometry.scale(0.8, 0.9, 0.16);
    const paddleHead = new THREE.Mesh(paddleHeadGeometry, material);
    paddleHead.position.y = 2;

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4, 32), material);
    handle.position.set(0, 0, 0);

    const paddleGroup = new THREE.Group();
    paddleGroup.add(paddleHead);
    paddleGroup.add(handle);
    paddleGroup.rotation.z = Math.PI / 3;
    paddleGroup.position.y = 13 - 5.75;

    // Rings
    const ringGeometry = new THREE.TorusGeometry(3, 0.3, 20, 100);
    const ring1 = new THREE.Mesh(ringGeometry, material);
    const ring2 = new THREE.Mesh(ringGeometry, material);
    ring1.scale.set(0.6, 1, 1);
    ring2.scale.set(0.6, 1, 1);
    ring1.position.y = 8.3 - 5.75;
    ring2.position.y = 8.3 - 5.75;
    ring2.rotation.y = Math.PI / 2;

    const top3 = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.6, 32), material);
    top3.position.y = 11.5 - 5.75;

    // Assemble Trophy
    trophyGroup = new THREE.Group();
    trophyGroup.add(base, body, top, ball, ring1, ring2, top3, paddleGroup);
    trophyGroup.scale.set(1.3, 1.3, 1.3);


    trophyGroup.position.y = 1;


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
        text.position.set(0, 9.2 - 5.75, 0);
        trophyGroup.add(text);

let winnerName;

if (mode === "tournament") 
    winnerName = tournamentResults["match3"].player1Score > tournamentResults["match3"].player2Score ? tournamentResults["match3"].player1 : tournamentResults["match3"].player2;
else 
    winnerName = tournamentResults["match1"].player1Score > tournamentResults["match1"].player2Score ? tournamentResults["match1"].player1 : tournamentResults["match1"].player2;

const winnerTextDiv = document.createElement("div");
winnerTextDiv.id = "winnerText";

if (mode === "tournament" && tournamentResults["match3"].player1Score === tournamentResults["match3"].player2Score || tournamentResults["match1"].player1Score === tournamentResults["match1"].player2Score)
    winnerTextDiv.innerText = "LOSERS BUT HERE IS A TROPHY!";
    else 
    winnerTextDiv.innerText = winnerName + " is the Winner!";


const gameHolder = document.getElementById("game-holder");
gameHolder.appendChild(winnerTextDiv);

const allWinners = document.createElement("div");
allWinners.id = "allWinners";

function createMatchContainer(matchTitle, player1, player1Score, player2, player2Score) {
    const matchContainer = document.createElement("div");
    matchContainer.classList.add("winnerContainer"); 

        const isDraw = player1Score === player2Score;
        const isPlayer1Winner = player1Score > player2Score;
        const player1Class = isDraw ? "" : isPlayer1Winner ? "highlight-green" : "";
        const player2Class = isDraw ? "" : !isPlayer1Winner ? "highlight-green" : "";


    const playerScore1 = document.createElement("div");
    playerScore1.classList.add("playerScore");
    playerScore1.innerHTML = `
        <span class="highlight">${matchTitle}</span> 
        <span class="${player1Class}">${player1} Score: ${player1Score}</span>`;

    const playerScore2 = document.createElement("div");
    playerScore2.classList.add("playerScore");
    playerScore2.innerHTML = `
        <span class="highlight">&nbsp;</span> 
        <span class="${player2Class}">${player2} Score: ${player2Score}</span>`;

    matchContainer.appendChild(playerScore1);
    matchContainer.appendChild(playerScore2);

    return matchContainer;
}

allWinners.appendChild(createMatchContainer("Match 1", tournamentResults["match1"].player1Nickname, tournamentResults["match1"].player1Score, tournamentResults["match1"].player2, tournamentResults["match1"].player2Score));
if (mode === "tournament") 
{
    allWinners.appendChild(createMatchContainer("Match 2", tournamentResults["match2"].player1Nickname, tournamentResults["match2"].player1Score, tournamentResults["match2"].player2Nickname, tournamentResults["match2"].player2Score));
    allWinners.appendChild(createMatchContainer("Final Match", tournamentResults["match3"].player1Nickname, tournamentResults["match3"].player1Score, tournamentResults["match3"].player2Nickname, tournamentResults["match3"].player2Score));
}

gameHolder.appendChild(allWinners);

    });
    

    scene.add(trophyGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 10, 5);
    scene.add(pointLight);

    camera.position.set(0, 5, 25);
    camera.lookAt(0, 5, 0);

    document.addEventListener('mousemove', (event) => {
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        trophyGroup.rotation.z = THREE.MathUtils.lerp(trophyGroup.rotation.z, (mouseX * Math.PI) / 10, 0.1);
        trophyGroup.rotation.x = THREE.MathUtils.lerp(trophyGroup.rotation.x, (mouseY * Math.PI) / 10, 0.1);
        
    });


    animate();
}

function animate() {
    trophyLoopId = requestAnimationFrame(animate);
    if (trophyGroup) trophyGroup.rotation.y += 0.01;
    renderer.render(scene, camera);
}
