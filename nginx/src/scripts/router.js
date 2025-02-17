routes = {
  "/achievements": "/achievements.html",
  "/dashboard": "/dashboard.html",
  "/friends": "/friends.html",
  "/leaderboards": "/leaderboards.html",
  "/profile": "/profile.html",
  "/404": "/404.html",
  "/verify": "/2fa.html",
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

function isNumeric(str) {
  if (typeof str != "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
}

async function changeRoute() {
  let path = window.location.pathname;
  let personNumber = null;
  let array = path.split("/");

  const app = document.getElementById("app");

  if (path == "/verify") {
    const html = await fetch(routes["/verify"]).then((response) =>
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
  if (!(await checkLogin()) || !(await check2fa())) {
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

  if (array.length == 3 && array[1] == "profile") {
    if (isNumeric(array[2])) {
      path = "/profile";
      personNumber = array[2];
    }
  }
  if (routes[path] == undefined) path = "/404";

  const html = await fetch(routes[path])
    .then((response) => response.text())
    .catch((err) => err);

  if (path == "/login") {
    app.innerHTML = html;
    return;
  }

  let main = document.getElementById("main");
  if (!main) {
    let info = await fetch("/index.html").then((response) => response.text());
    app.innerHTML = info;
    main = document.getElementById("main");
  }
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
  } else if (personNumber != null) {
    fillData("");
    profileFillData(personNumber);
  } else fillData(path);
}

window.addEventListener("click", (e) => {
  if (e.target.tagName == "INPUT") return;
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

async function verify2fa() {
  // send verification code to backend
  const email = document.getElementById("email");
  const code = document.getElementById("code");

  let info = await fetch("https://localhost/api/verify/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.value,
      code: code.value,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return err;
    });

  if (info.success) {
    window.history.pushState({}, "", "/dashboard");
    changeRoute();
  }
}

async function check2fa() {
  // check if user is verified
  let info = await fetch("https://localhost/api/verify/check", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return err;
    });

  return info["success"];
}

async function testApi(params) {
  let info = await fetch("https://localhost/api/users", {
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
