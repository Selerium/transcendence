routes = {
  "/achievements": "/achievements.html",
  "/dashboard": "/dashboard.html",
  "/friends": "/friends.html",
  "/leaderboards": "/leaderboards.html",
  "/": "/login.html",
  "/profile": "/profile.html",
};

// to write the 404 condition here
async function changeRoute() {
  const path = window.location.pathname;

  const main = document.getElementById("main");
  const html = await fetch(routes[path]).then((response) => response.text());

  main.style.transform = "translateX(25%)";
  main.style.opacity = 0;
  main.style.filter = "blur(16px)";

  setTimeout(() => {
    main.innerHTML = html;
    main.style.transform = "translateX(0%)";
    main.style.opacity = 1;
    main.style.filter = "";
  }, 200);
}

window.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.tagName != "A") return;

  window.history.pushState({}, "", e.target.getAttribute("href"));
  changeRoute(e.target.getAttribute("href"));
});

function checkLogin() {
  // if authenticated, go to "/dashboard"
  // else, go to "/login"
}

window.onpopstate = changeRoute();
changeRoute();
