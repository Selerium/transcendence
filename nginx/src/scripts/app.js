let loggedIn = false;
let username;

async function fillData(str) {
  if (!loggedIn) {
    loggedIn = true;
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

    username = info["data"]["username"];
    let image_url = info["data"]["profile_pic"];

    const doc_nav_username = document.getElementById("nav-profile");
    const doc_nav_image = document.getElementById("nav-image");
    doc_nav_username.innerHTML = username;
    doc_nav_image.src = image_url;
  }
  if (str == "/profile") {
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

    let username = info["data"]["username"];
    let image_url = info["data"]["profile_pic"];

    const doc_username = document.getElementById("profile-username");
    const doc_role = document.getElementById("profile-role");
    const doc_image = document.getElementById("profile-image");
    doc_username.innerHTML = username;
    doc_role.innerHTML = "student";
    doc_image.src = image_url;
  }
  if (str == "/friends") {
    let friendsListInfo = await fetch("http://localhost:8080/api/friends", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        return err;
      });

    let friendsHolder = document.getElementById("friends-friends");
    if (friendsListInfo["data"].length > 0) {
      friendsListInfo["data"].forEach((friend) => {
        const friendDiv = document.createElement("div");

        friendDiv.classList.add(
          "box",
          "inner-box",
          "p-2",
          "d-flex",
          "justify-content-start",
          "align-items-center",
          "gap-4",
          "h-fit",
          "w-100",
          "clickable"
        );

        friendDiv.innerHTML = `
			<img width="64" height="64" style="object-fit: cover; border-radius: 32px" src="${friend.profile_pic}" />
			<p>${friend.username}</p>
		`;

        friendsHolder.appendChild(friendDiv);
      });
    }
    console.log(friendsListInfo);
  }
  if (str == "/dashboard") {
    console.log('bhai kyu nahi chal raha');
    let friendRequestInfo = await fetch(
      "http://localhost:8080/api/friends/requests",
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        return err;
      });

    let requestsHolder = document.getElementById("dashboard-friend-requests");
    if (friendRequestInfo["data"].length > 0) {
      friendRequestInfo["data"].forEach((request) => {
        const userDiv = document.createElement("div");

        userDiv.classList.add(
          "custom-border",
          "d-flex",
          "align-items-center",
          "justify-content-between",
          "py-2",
          "px-4",
          "gap-2",
          "w-100"
        );
        userDiv.innerHTML = `
            <img width="32" height="32" src="${
              request.other_user.profile_pic
            }" style="object-fit: cover; border-radius: 32px" />
            <h3 class="w-100 text-center">${request.other_user.username}</h3>
            <button onclick="resolveFriend(${true}, ${
          request.id
        })" class="clickable btn small-btn">accept</button>
            <button onclick="resolveFriend(${false}, ${
          request.id
        })" class="clickable btn small-btn">decline</button>
          `;

        requestsHolder.appendChild(userDiv);
      });
    } else {
      const noDataHeading = document.createElement("h3");
      const noDataMessage = document.createElement("p");

      noDataHeading.classList.add("text-center", "bold");
      noDataMessage.classList.add("text-center", "small");
      noDataHeading.innerHTML = "no data to show!";
      noDataMessage.innerHTML =
        "requests don't just show up y'know. make small talk?";
      requestsHolder.appendChild(noDataHeading);
      requestsHolder.appendChild(noDataMessage);
      requestsHolder.classList.add("justify-content-center");
      requestsHolder.classList.remove("justify-content-start");
    }
    let matchHistoryInfo = await fetch("http://localhost:8080/api/matches/", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        return err;
      });
    console.log(matchHistoryInfo);
    let historyHolder = document.getElementById("dashboard-match-history");
    if (matchHistoryInfo["data"].length > 0) {
      matchHistoryInfo["data"].forEach((match) => {
        const matchDiv = document.createElement("div");
        matchDiv.classList.add(
          "custom-border",
          "d-flex",
          "align-items-center",
          "justify-content-between",
          "py-2",
          "px-4",
          "gap-6",
          "w-100"
        );
        let result, boxClass;
        if (match.player_one_score > match.player_two_score) {
          result = "WIN";
          boxClass = "win-box";
        } else if (match.player_two_score > match.player_one_score) {
          result = "LOSS";
          boxClass = "loss-box";
        } else {
          result = "DRAW";
          boxClass = "draw-box";
        }
        matchDiv.innerHTML = `
        <h3 class= "player_1 bold">${match.player_one.username}</h3>
        <h3 class= "electrolize text-center bold ${boxClass}"> ${result}</h3>
        <h3 class="player_2 bold">${match.player_two.username}</h3>
      </div>
        `;
        historyHolder.appendChild(matchDiv);
      });
    } else {
      const noDataHeading = document.createElement("h3");
      const noDataMessage = document.createElement("p");

      noDataHeading.classList.add("text-center", "bold");
      noDataMessage.classList.add("text-center", "small");
      noDataHeading.innerHTML = "no data to show!";
      noDataMessage.innerHTML = "this is rather sad looking - play a bit more?";
      historyHolder.appendChild(noDataHeading);
      historyHolder.appendChild(noDataMessage);
      historyHolder.classList.add("justify-content-center");
      historyHolder.classList.remove("justify-content-start");
    }
  }
}
// }

async function openModal(str) {
  let modalHolder = document.getElementById("modal");
  let modalInfo = document.getElementById("info-modal");
  modalInfo.innerHTML = '<h1 id="modal-heading" class="w-100"></h1>';
  let modalHeading = document.getElementById("modal-heading");

  if (str == "open-friend") {
    modalHeading.innerHTML = "ADD FRIEND";
    let apiInfo = await fetch("http://localhost:8080/api/users", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        return err;
      });

    modalHolder.style.zIndex = 100;
    modalHolder.style.opacity = 1;

    const userContainer = document.createElement("div");
    userContainer.classList.add("w-100", "grid-2");
    if (apiInfo["data"].length > 0) {
      apiInfo["data"].forEach((user) => {
        if (username != user.username) {
          const userDiv = document.createElement("div");

          userDiv.classList.add(
            "custom-border",
            "d-flex",
            "align-items-center",
            "justify-content-between",
            "py-2",
            "px-4",
            "gap-2",
            "min-w-half"
          );
          userDiv.innerHTML = `
            <img width="64" height="64" src="${user.profile_pic}" style="object-fit: cover; border-radius: 64px" />
            <h3 class="w-25 text-center">${user.username}</h3>
            <button onclick="addFriend(${user.id}, this)" class="clickable btn small-btn">add friend</button>
          `;

          userContainer.appendChild(userDiv);
        }
      });
    } else {
      userContainer.innerHTML = `
        <h1 class="w-100">ADD FRIENDS</h1>
        <p class="flex-grow-1 h-100">no one to add yet!</p>
      `;
    }
    modalInfo.appendChild(userContainer);
    return;
  }
  if (str == "send-request") {
  }
  if (str == "1v1") {
    modalHeading.innerHTML = "1V1";

    modalHolder.style.zIndex = 100;
    modalHolder.style.opacity = 1;

    const userContainer = document.createElement("div");
    userContainer.classList.add(
      "w-100",
      "h-75",
      "d-flex",
      "justify-content-center",
      "align-items-center",
      "gap-4"
    );
    userContainer.innerHTML = `
      <div onclick="openModal('1v1-player')" class="box select-box h-100 flex-fill d-flex flex-column gap-3 align-items-center justify-content-center clickable">
        <img src="styles/images/1v1.png" />
        <h3>1V1 PLAYER</h3>
      </div>
      <div onclick="openModal('1v1-ai')" class="box select-box h-100 flex-fill d-flex flex-column gap-3 align-items-center justify-content-center clickable">
        <img src="styles/images/1v1.png" />
        <h3>1V1 AI</h3>
      </div>
    `;
    modalInfo.appendChild(userContainer);
    return;
  }
  if (str == "2v2") {
    modalHeading.innerHTML = "2v2";

    modalHolder.style.zIndex = 100;
    modalHolder.style.opacity = 1;

    const userContainer = document.createElement("div");
    userContainer.classList.add(
      "w-100",
      "h-75",
      "d-flex",
      "justify-content-center",
      "align-items-center",
      "gap-4"
    );
    userContainer.innerHTML = `
      <div onclick="openModal('2v2-player')" class="box select-box h-100 flex-fill d-flex flex-column gap-3 align-items-center justify-content-center clickable">
        <img src="styles/images/2v2.png" />
        <h3>2V2 PLAYER</h3>
      </div>
      <div onclick="openModal('2v2-ai')" class="box select-box h-100 flex-fill d-flex flex-column gap-3 align-items-center justify-content-center clickable">
        <img src="styles/images/2v2.png" />
        <h3>2V2 AI</h3>
      </div>
    `;
    modalInfo.appendChild(userContainer);
    return;
  }
  modalHolder.style.zIndex = -100;
  modalHolder.style.opacity = 0;
}

async function addFriend(id, t) {
  let apiInfo = await fetch("http://localhost:8080/api/friends/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      friend: id,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return err;
    });

  console.log(apiInfo);
}

async function resolveFriend(answer, reqId) {
  let apiInfo = await fetch(`http://localhost:8080/api/friends/${reqId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      friend_status: answer ? "1" : "2",
    }),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return err;
    });

  console.log(apiInfo);
  fillData("/dashboard");
}
