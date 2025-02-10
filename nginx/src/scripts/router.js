routes = {
  "/achievements": "/achievements.html",
  "/dashboard": "/dashboard.html",
  "/friends": "/friends.html",
  "/leaderboards": "/leaderboards.html",
  "/profile": "/profile.html",
  "/404": "/404.html",
  "/login": "/login.html",
  "/": "/dashboard.html",
  "/not-allowed": "/not-allowed.html",
  "/play": "/game.html",
};

navbarIds = {
  "/achievements": "nav-achievements",
  "/dashboard": "nav-dashboard",
  "/": "nav-dashboard",
  "/friends": "nav-friends",
  "/leaderboards": "nav-leaderboards",
  "/profile": "nav-profile",
};

// to write the 404 condition here
async function changeRoute() {
  let path = window.location.pathname;
  const app = document.getElementById("app");

  console.log("checking");
  if (!(await checkLogin())) {
    console.log("failed auth");
    const html = await fetch(routes["/login"]).then((response) =>
      response.text()
    );
    app.style.opacity = 0;
    app.style.filter = "blur(16px)";
    app.innerHTML = html;

    setTimeout(() => {
      app.style.opacity = 1;
      app.style.filter = "";
    }, 200);
    return;
  }
  console.log("passed auth");

  if (routes[path] == undefined) path = "/404";

  const html = await fetch(routes[path])
    .then((response) => response.text())
    .catch((err) => err);

  const main = document.getElementById("main");
  main.innerHTML = "";
  main.style.transform = "translateX(25%)";
  main.style.opacity = 0;
  main.style.filter = "blur(16px)";

  setTimeout(() => {
    main.innerHTML = html;
    main.style.transform = "translateX(0%)";
    main.style.opacity = 1;
    main.style.filter = "";
  }, 200);

  // resetting the navbar link colors and font weight
  let list = document.getElementsByClassName("link");
  for (let i = 0; i < list.length; i++) {
    list[i].style.fontWeight = "normal";
    list[i].style.color = "var(--border)";
  }

  // setting the active link color and font weight
  const navElement = document.getElementById(navbarIds[path]);
  if (navElement != null || navElement != undefined) {
    navElement.style.fontWeight = "bold";
    navElement.style.color = "var(--accent)";
  }

  if (path == "/") {
    fillData("/dashboard");
  } else fillData(path);
}

window.addEventListener("click", (e) => {
  if (e.target.getAttribute("href") != "/api/oauth") {
    e.preventDefault();
    if (e.target.tagName != "A") return;

    window.history.pushState({}, "", e.target.getAttribute("href"));
    changeRoute(e.target.getAttribute("href"));
  }
});

async function checkLogin() {
  let response = await testApi();
  return response["success"];
}

async function testApi(params) {
  let info = await fetch("http://localhost:8080/api/users", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return err;
    });
  return info;
}

window.onpopstate = changeRoute;
changeRoute();
