routes = {
  "/achievements": "/achievements.html",
  "/dashboard": "/dashboard.html",
  "/friends": "/friends.html",
  "/leaderboards": "/leaderboards.html",
  "/profile": "/profile.html",
  "/404": "/404.html",
  "/": "/dashboard.html",
};

// to write the 404 condition here
async function changeRoute() {
  let path = window.location.pathname;
  if (routes[path] == undefined)
    path = '/404' ;

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

async function testApi(params) {
  const info = await fetch('http://localhost:8080/api/users', {}).then(response => response.json()).catch(err => err);
  console.log(info);
}

testApi();