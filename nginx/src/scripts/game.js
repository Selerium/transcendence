import { showBckground } from "../scripts/backgroundEffects.js";
import { gameCountdown } from "../scripts/gameCountdown.js";

export async function createMatch(mode) {

    let player1, player2, player3, player4;
    let info = await fetch("http://localhost:8080/api/me", {
        method: "GET",
        credentials: "include",
      })
        .then((response) => {
          return response.json();
        })
        .catch((err) => {
          return err;
        });

    player1 = info["data"]["username"];

    if (mode === '1v1-player') {
        player2 = document.getElementById("player2").value;

    }
    else if (mode === 'tournament') {
        player2 = document.getElementById("player2").value;
        player3 = document.getElementById("player3").value;
        player4 = document.getElementById("player4").value;
    }


    let queryParams = `mode=${mode}&player1=${encodeURIComponent(player1)}`;
    if (player2) queryParams += `&player2=${encodeURIComponent(player2)}`;
    if (player3) queryParams += `&player3=${encodeURIComponent(player3)}`;
    if (player4) queryParams += `&player4=${encodeURIComponent(player4)}`;

    window.history.pushState({}, "", `/play?${queryParams}`);
    changeRoute();
    openModal('close');

    showBckground();
    gameCountdown();

}

window.createMatch = createMatch;



