import { showBckground } from "../scripts/backgroundEffects.js";
import { gameCountdown } from "../scripts/gameCountdown.js";

export async function createMatch(mode) {
    document.getElementById("play-btn").style.display = "none";
    let player1, player2, player3, player4;
    let player1nickname, player2nickname, player3nickname, player4nickname;

    let info = await fetch("http://localhost:8080/api/me", {
        method: "GET",
        credentials: "include",
    })
    .then((response) => response.json())
    .catch((err) => {
        console.error("Error fetching current user:", err);
        return null;
    });

    if (!info || !info["data"] || !info["data"]["username"]) {
        document.getElementById("play-btn").style.display = "block";
        console.error("Failed to fetch the current user.");
        return;
    }

    player1 = info["data"]["username"];

    if (mode === '1v1-player') {
        player2 = document.getElementById("player2").value;
        
    } 
    else if (mode === 'tournament') {
        player2 = document.getElementById("player2").value;
        player3 = document.getElementById("player3").value;
        player4 = document.getElementById("player4").value;

        player1nickname = document.getElementById("nickname1").value;
        player2nickname = document.getElementById("nickname2").value;
        player3nickname = document.getElementById("nickname3").value;
        player4nickname = document.getElementById("nickname4").value;
    }

    let selectedPlayers = [player1, player2]; // Default for 1v1-player
    let selectedNicknames = []; // Default for 1v1-player (no nicknames required)
    
    if (mode === "tournament") {
        selectedPlayers = [player1, player2, player3, player4]; // ✅ All required players for tournament
        selectedNicknames = [player1nickname, player2nickname, player3nickname, player4nickname]; // ✅ All nicknames
    }
    if (mode === "1v1-ai") {
        selectedPlayers = [player1]; // ✅ All required players for tournament
        selectedNicknames = []; // ✅ All nicknames
    }
    clearErrorMessages();


    let emptyPlayers = selectedPlayers.some(selectedPlayers => !selectedPlayers);
    let emptyNicknames = selectedNicknames.some(selectedNicknames => !selectedNicknames);
    if (emptyNicknames || emptyPlayers) {
        document.getElementById("play-btn").style.display = "block";
        return;
    }

    let duplicatePlayers = findDuplicates(selectedPlayers);
    let duplicateNicknames = findDuplicates(selectedNicknames);
    if (duplicatePlayers.length > 0 || duplicateNicknames.length > 0) {
        duplicatePlayers.forEach(player => showErrorMessage(player, "Cloning detected!"));
        duplicateNicknames.forEach(nickname => showErrorMessage(nickname, "Pick a new nickname!"));
        document.getElementById("play-btn").style.display = "block";
        return;
    }

    let users = await fetchAllUsers();
    if (!users) {
        document.getElementById("play-btn").style.display = "block";
        return;
    }

    let userSet = new Set(users.map(user => user.username));
    let nonExistingPlayers = selectedPlayers.filter(player => !userSet.has(player));

    if (nonExistingPlayers.length > 0) {
        document.getElementById("play-btn").style.display = "block";
        nonExistingPlayers.forEach(player => showErrorMessage(player, `"${player}" is a ghost! 👻`));
        return;
    }

    let queryParams = `mode=${mode}&player1=${encodeURIComponent(player1)}`;
    if (player1nickname) queryParams += `&nickname1=${encodeURIComponent(player1nickname)}`;
    if (player2) {
        queryParams += `&player2=${encodeURIComponent(player2)}`;
        if (player2nickname) queryParams += `&nickname2=${encodeURIComponent(player2nickname)}`;
    }
    if (player3) {
        queryParams += `&player3=${encodeURIComponent(player3)}`;
        if (player3nickname) queryParams += `&nickname3=${encodeURIComponent(player3nickname)}`;
    }
    if (player4) {
        queryParams += `&player4=${encodeURIComponent(player4)}`;
        if (player4nickname) queryParams += `&nickname4=${encodeURIComponent(player4nickname)}`;
    }
    
    window.history.pushState({}, "", `/play?${queryParams}`);
    changeRoute();
    openModal('close');

    showBckground();
    gameCountdown();
}

window.createMatch = createMatch;

async function fetchAllUsers() {
    try {
        const response = await fetch('/api/users/', {
            method: 'GET',
            credentials: 'include', // Ensures cookies (JWT) are sent
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        return data.data; // Returns an array of user objects
    } catch (error) {
        console.error('Error fetching users:', error);
        return null;
    }
}

function findDuplicates(players) {
    let seen = new Set();
    let duplicates = [];
    for (let player of players) {
        if (seen.has(player)) {
            duplicates.push(player);
        } else {
            seen.add(player);
        }
    }
    return duplicates;
}

function showErrorMessage(playerName, message) {
    let inputElement = getInputElementByPlayerName(playerName);
    if (inputElement) {
        let errorSpan = inputElement.nextElementSibling;
        if (!errorSpan || !errorSpan.classList.contains("error-message")) {
            errorSpan = document.createElement("span");
            errorSpan.classList.add("error-message");
            inputElement.parentNode.appendChild(errorSpan);
        }
        errorSpan.textContent = message;
        errorSpan.style.color = "red";
        errorSpan.style.fontSize = "calc(10px + 0.2em + 0.2vw)";
    }
}

function clearErrorMessages() {
    document.querySelectorAll(".error-message").forEach(el => el.remove());
}

function getInputElementByPlayerName(playerName) {
    let allInputs = document.querySelectorAll("input[type='text']");
    for (let input of allInputs) {
        if (input.value.trim() === playerName) {
            return input;
        }
    }
    return null;
}
