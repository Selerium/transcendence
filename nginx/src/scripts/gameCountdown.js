import { startGame } from "../scripts/startGame.js";
import { waitForCanvasAndStartTrophy } from "../scripts/GameTrophy.js";


let mode;
let scene, camera, renderer;
let textMesh;
let matchTextMesh;
let playerTextMesh; 

let fontLoader = new THREE.FontLoader();
let textMaterial;
let light, shadowLight;
let countdownNumber = 4;
let countdownInterval;
let rotation = false;
let animationId = null;

export async function gameCountdown() {
    const checkInterval = setInterval(async () => { 
        const countdownCanvas = document.getElementById("gameCountdown");
        if (countdownCanvas) {
            clearInterval(checkInterval);

            try {
                let info = await fetch("http://localhost:8080/api/me", {
                    method: "GET",
                    credentials: "include",
                })
                    .then((response) => response.json())
                    .catch((err) => {
                        return null;
                    });

                let defaultPlayer = info?.data?.username || "Guest";

                const urlParams = new URLSearchParams(window.location.search);
                mode = urlParams.get("mode") || "1v1-ai"; 
                const players = [
                    urlParams.get("player1") || defaultPlayer,
                    urlParams.get("player2") || "AI",
                    urlParams.get("player3") || null,
                    urlParams.get("player4") || null
                ];

                if (mode === "tournament") {
                    runTournament(players); 
                } else {
                    initCountDown(() => startGame(mode, players[0], players[1], null));
                }

            } catch (error) {
                console.error("Unexpected error:", error);
            }
        }
    }, 100);
}


function runTournament(players) {
    let tournamentResults = {};

    function playMatch(matchNumber, playerA, playerB, nextMatchCallback) {

        initMatchLabel(matchNumber, playerA, playerB, () => {
            initCountDown(() => {
                startGame(mode, playerA, playerB, (winner, loser, scoreA, scoreB) => {
                    tournamentResults[`match${matchNumber}`] = {
                        player1: playerA,
                        player1Score: scoreA,
                        player2: playerB,
                        player2Score: scoreB,
                        winner: winner
                    };

                    if (nextMatchCallback) {
                        nextMatchCallback(winner);
                    } else
                        waitForCanvasAndStartTrophy(mode, tournamentResults);
                });
            });
        });
    }

    playMatch(1, players[0], players[1], (winner1) => { 
        playMatch(2, players[2], players[3], (winner2) => { 
            playMatch(3, winner1, winner2, null); 
        });
    });
}

function resetCountdownVariables() {
    if (typeof countdownInterval !== "undefined") {
        clearInterval(countdownInterval);
    }

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    scene = null;
    camera = null;
    renderer = null;
    textMesh = null;
    matchTextMesh = null; 
    countdownNumber = 4;
    rotation = false;
}

function initCountDown(callback) {
    resetCountdownVariables();
    const canvas = document.getElementById("gameCountdown");
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        return;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    textMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.1,
    });

    shadowLight = new THREE.SpotLight(0x150E32, 2);
    shadowLight.position.set(0, 5, 5);
    shadowLight.castShadow = true;
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
    scene.add(shadowLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    fontLoader.load(
        "../styles/fonts/electrolize/Electrolize_Regular.json",
        function (font) {
            startCountdown(font, callback);
        }
    );

    animate();
}

function initMatchLabel(matchNumber, player1, player2, callback) {
    resetCountdownVariables();

    const canvas = document.getElementById("gameCountdown");
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        return;
    }

    const canvasWidth = canvas.clientWidth || window.innerWidth;
    const canvasHeight = canvas.clientHeight || window.innerHeight;
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.shadowMap.enabled = true;

    textMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0c419,
        roughness: 0.3,
        metalness: 0.1,
    });


    let textMaterial2 = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.1,
    });

    shadowLight = new THREE.SpotLight(0x150E32, 2);
    shadowLight.position.set(0, 5, 5);
    shadowLight.castShadow = true;
    scene.add(shadowLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    

    fontLoader.load(
        "../styles/fonts/electrolize/Electrolize_Regular.json",
        function (font) {
            let matchText = matchNumber === 1 ? "Match 1" : matchNumber === 2 ? "Match 2" : "Final Match";
            let playersText = `${player1} vs ${player2}`;


            let textSize = Math.max(1, canvasWidth * 0.0011); 
            let playersTextSize = Math.max(0.5, canvasWidth * 0.0005); 


            let textGeometry = new THREE.TextGeometry(matchText, {
                font: font,
                size: textSize, 
                height: textSize * 0.1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: textSize * 0.07,
                bevelSize: textSize * 0.03,
                bevelSegments: 5,
            });

            let playersGeometry = new THREE.TextGeometry(playersText, {
                font: font,
                size: playersTextSize,
                height: playersTextSize * 0.1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: playersTextSize * 0.07,
                bevelSize: playersTextSize * 0.03,
                bevelSegments: 5,
            });

            textGeometry.center();
            playersGeometry.center();


            matchTextMesh = new THREE.Mesh(textGeometry, textMaterial);
            matchTextMesh.position.set(0, 1, 0); 

            playerTextMesh = new THREE.Mesh(playersGeometry, textMaterial2);
            playerTextMesh.position.set(0, -0.5, 0); 

            scene.add(matchTextMesh);
            scene.add(playerTextMesh);


            animate();

            setTimeout(() => {
                scene.remove(matchTextMesh);
                matchTextMesh.geometry.dispose();
                matchTextMesh = null;
                callback(); 
            }, 4000);
        }
    );
}


function createCountdownText(font, text) {
    if (textMesh) {
        scene.remove(textMesh);
        textMesh.geometry.dispose();
    }

    let textGeometry = new THREE.TextGeometry(text, {
        font: font,
        size: 2,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.05,
        bevelSegments: 5,
    });

    textGeometry.center();

    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    scene.add(textMesh);
}

function startCountdown(font, callback) {
    countdownNumber = 4;
    rotation = false;
    countdownInterval = setInterval(() => {
        countdownNumber--;

        if (countdownNumber > 0) {
            createCountdownText(font, countdownNumber.toString());
            rotation = true;
        } else {
            clearInterval(countdownInterval);
            createCountdownText(font, "Go!");
            rotation = false;

            setTimeout(() => {
                scene.remove(textMesh);
                textMesh.geometry.dispose();
                textMesh = null;
                if (callback) callback();
            }, 1000);
        }
    }, 1000);
}

function animate() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    function loop() {
        animationId = requestAnimationFrame(loop);
        if (textMesh && rotation) {
            textMesh.rotation.y += 0.06;
        }
        renderer.render(scene, camera);
    }

    loop();
}
