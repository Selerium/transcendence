async function createMatch(mode) {
    if (mode == '1v1-player') {
        const player2 = document.getElementById("player2").value;

        // api call to create a match with player2
        // returns to frontend a match ID

        console.log(player2);
        // use match ID to get player1, player2 and start
        // every score, send an API call to update score
        // if browser closed for whatever reason, end game on that score
        // when game ends, update on API
        // send user to dashboard again
    }
    else if (mode == '2v2-player') {
        const player2 = document.getElementById("player2").value;
        const player3 = document.getElementById("player3").value;
        const player4 = document.getElementById("player4").value;

        // api call to create a match with player2
        // returns to frontend a match ID

        console.log(player2);
        console.log(player3);
        console.log(player4);
        // use match ID to get player1, player2 and start
        // every score, send an API call to update score
        // if browser closed for whatever reason, end game on that score
        // when game ends, update on API
        // send user to dashboard again
    }
    else if (mode == '1v1-ai') {
        // conditions for player vs AI 
    }
    else {
        // conditions for player and AI vs 2 AIs
    }

    // changes screen to the new screen
    window.history.pushState({}, "", '/play');
    changeRoute();
    openModal('close');

    // this is the element that should be filled with the game canvas
    const gameHolder = document.getElementById('game-holder');
    // something like:
    // gameHolder.innerHTML = theGameCanvasElement;
}