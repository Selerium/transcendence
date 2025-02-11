import { gameCountdown } from "../scripts/gameCountdown.js";

let hasGameCountdownRun = false;

export function showBckground() {
    let stars = [];

    function createBackgroundStars() {
        const backgroundStars = document.getElementById("background-stars");
        if (!backgroundStars) return;

        backgroundStars.innerHTML = "";
        stars = [];

        const starCount = Math.floor((window.innerWidth * window.innerHeight) / 5000); 

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement("div");
            star.style.position = "absolute";
            star.style.backgroundColor = "white";
            star.style.borderRadius = "50%";
            star.style.width = Math.random() * 2 + "px";
            star.style.height = star.style.width;

            const starObj = {
                element: star,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                speed: Math.random() * 0.2 + 0.05,
            };

            star.style.top = `${starObj.y}px`;
            star.style.left = `${starObj.x}px`;

            backgroundStars.appendChild(star);
            stars.push(starObj);
        }
    }

    function animateStars() {
        stars.forEach((star) => {
            star.y += star.speed;
            if (star.y > window.innerHeight) {
                star.y = 0;
                star.x = Math.random() * window.innerWidth;
            }
            star.element.style.top = `${star.y}px`;
            star.element.style.left = `${star.x}px`;
        });
        requestAnimationFrame(animateStars);
    }

    function handleResize() {
        createBackgroundStars(); 
    }

    const checkInterval = setInterval(() => {
        const backgroundStars = document.getElementById("background-stars");
        if (backgroundStars) {
            clearInterval(checkInterval);
            createBackgroundStars();
            animateStars();
        }
    }, 100);

    window.addEventListener("resize", handleResize);
}

if (!hasGameCountdownRun) {
    hasGameCountdownRun = true;
    showBckground();
    gameCountdown();
}
