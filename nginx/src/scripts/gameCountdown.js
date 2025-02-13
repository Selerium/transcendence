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

let matchIds = {
    match1: { matchid: null },
    match2: { matchid: null },
    match3: { matchid: null }
};
async function initGame2(matchIds, tournamentResults) {
    for (const matchKey of Object.keys(matchIds)) {
        let matchData = tournamentResults[matchKey];

        if (matchIds[matchKey].matchid && matchData?.player1Score !== undefined && matchData?.player2Score !== undefined) {
            
            try {
                let response = await fetch("https://localhost/api/matches/", {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        match_id: matchIds[matchKey].matchid,
                        player_one_score: matchData.player1Score,
                        player_two_score: matchData.player2Score,
                    }),
                });

                let apiInfo = await response.json();
                console.log(`Updated ${matchKey}:`, apiInfo);
            } catch (err) {
                console.error(`Error updating ${matchKey}:`, err);
            }
        } else {
            console.warn(`Skipping ${matchKey}: Missing match ID or scores`);
        }
    }
}


export async function gameCountdown() {
    const checkInterval = setInterval(async () => { 
        const countdownCanvas = document.getElementById("gameCountdown");
        if (countdownCanvas) {
            clearInterval(checkInterval);

            try {
                let info = await fetch("https://localhost/api/me", {
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

                const nicknames = [
                    urlParams.get("nickname1") || players[0],
                    urlParams.get("nickname2") || players[1],
                    urlParams.get("nickname3") || players[2],
                    urlParams.get("nickname4") || players[3]
                ];

                if (mode === "tournament") {
                    runTournament(players, nicknames); 
                } else {
                    initCountDown(() => startGame(mode, nicknames[0], nicknames[1], players[0], players[1], null));
                }

            } catch (error) {
                console.error("Unexpected error:", error);
            }
        }
    }, 100);
}

window.gameCountdown = gameCountdown;

function sendMatchStartNotification(matchNumber, playerA, playerB, receiver) {
    return fetch(`https://localhost/api/msgs/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sender: '1',
            receiver: receiver,
            content: `Match ${matchNumber} is about to start: ${playerA} vs ${playerB}`
        })
    })
    .then(response => response.json())
    .catch(error => console.error('Error sending match start notification:', error));
}

function runTournament(players, nicknames) {
    let tournamentResults = {};

    function playMatch(matchNumber, playerA, playerB, nickname1, nickname2, nextMatchCallback) {
        initMatchLabel(matchNumber, nickname1, nickname2, () => {
            sendMatchStartNotification(matchNumber, playerA, playerB, playerA);
            sendMatchStartNotification(matchNumber, playerB, playerA, playerB);
            initCountDown(() => {
                startGame(mode, nickname1, nickname2, playerA, playerB, (winner, loser, scoreA, scoreB, winnerNickname) => {
                    tournamentResults[`match${matchNumber}`] = {
                        player1: playerA,
                        player1Nickname: nickname1,
                        player1Score: scoreA,
                        player2: playerB,
                        player2Nickname: nickname2,
                        player2Score: scoreB,
                        winner: winner,
                        winnerNickname: winnerNickname
                    };

                    if (nextMatchCallback) {
                        nextMatchCallback(winner, winnerNickname);
                    } else {
                        // Update all matches in the
                        // initGame2(matchIds, tournamentResults);
                        waitForCanvasAndStartTrophy(mode, tournamentResults);
                    }
                });
            });
        });
    }

    playMatch(1, players[0], players[1], nicknames[0], nicknames[1], (winner1, winner1Nickname) => { 
        playMatch(2, players[2], players[3], nicknames[2], nicknames[3], (winner2, winner2Nickname) => { 
            playMatch(3, winner1, winner2, winner1Nickname, winner2Nickname, null); 
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
                // matchTextMesh.geometry.dispose();
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
