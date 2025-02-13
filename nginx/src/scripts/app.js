// import { showBckground } from "/scripts/backgroundEffects";
// import { gameCountdown } from "/scripts/gameCountdown";

let loggedIn = false;
let my_username = null;
let my_id;
const defaultImageURL = '/styles/images/profile-pic-sample.png';

async function fillData(str) {
  if (currentChatUser) currentChatUser = null;
  if (chatLoaded) chatLoaded = null;
  if (chatLength) chatLength = null;

  if (window.intervalId) clearInterval(window.intervalId);

  if (!loggedIn) {
    loggedIn = true;
    let info = await fetch("https://localhost/api/me", {
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
    id = info["data"]["id"];
    let image_url = info["data"]["profile_pic"];
    if (image_url == null)
      image_url = defaultImageURL;

    const doc_nav_username = document.getElementById("nav-profile");
    const doc_nav_image = document.getElementById("nav-image");
    doc_nav_username.innerHTML = info["data"]["alias"];
    doc_nav_image.src = image_url;
  }

  if (my_username == null) {
    let meInfo = await fetch("https://localhost/api/me", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        return err;
      });

    my_id = meInfo["data"]["id"];
    my_username = meInfo["data"]["username"];
  }

  if (str == "/profile") {
    let meInfo = await fetch("https://localhost/api/me", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        return err;
      });

    let role = meInfo["data"]["role"] == 0 ? "STUDENT" : "STAFF";
    let username = meInfo["data"]["username"];
    let image_url = meInfo["data"]["profile_pic"];
    if (image_url == null)
      image_url = defaultImageURL;

    const editProfileButton = document.getElementById("edit-profile");
    editProfileButton.style.display = "block";

    const doc_username = document.getElementById("profile-username");
    const doc_alias = document.getElementById("profile-alias");
    const doc_role_holder = document.getElementById("profile-role-holder");
    const doc_role = document.getElementById("profile-role");
    const doc_image = document.getElementById("profile-image");
    doc_alias.innerHTML = meInfo["data"]["alias"];
    doc_username.innerHTML = `(intra: ${username})`;
    if (role == "STUDENT") doc_role_holder.classList.toggle("win-box");
    else doc_role_holder.classList.toggle("loss-box");
    doc_role.innerHTML = role;
    doc_image.src = image_url;

    pullMatchHistory("profile", my_id);

    setTimeout(() => {
      pullAchievements("profile", my_id);
    }, 1000);

    let leaderboardsInfo = await fetch(
      "https://localhost/api/matches/leaderboards",
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

    let globalLeaderboards = document.getElementById("leaderboards-global");
    if (leaderboardsInfo["data"].length > 0) {
      leaderboardsInfo["data"].forEach((item, index) => {
        if (item["user-id"] == my_id) {
          let rankHolder = document.getElementById("profile-rank");
          rankHolder.innerHTML = `#${index + 1}`;
        }
      });
    }
  } else if (str == "/friends") {
    let friendsListInfo = await fetch("https://localhost/api/friends", {
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
    friendsHolder.innerHTML = "";
    const sendChatButton = document.getElementById("friends-send-chat");
    const chatTextArea = document.getElementById("friends-message-input");
    sendChatButton.disabled = true;
    chatTextArea.disabled = true;
    let selectedUserId = null;

    const blockButton = document.getElementById("friends-block-button");
    const chatInput = document.getElementById("friends-message-input");
    const chatSend = document.getElementById("friends-send-chat");

    if (friendsListInfo["data"].length > 0) {
      friendsListInfo["data"].forEach((friend) => {
        const friendDiv = document.createElement("button");
        async function clicked() {
          if (window.intervalId != null) clearInterval(window.intervalId);

          let chatHolder = document.getElementById("friends-chat");
          chatHolder.innerHTML = "";
          if (friend.blockedBy) blockButton.disabled = false;
          else blockButton.disabled = true;

          if (friend.friend_status == "1") {
            blockButton.innerHTML = "BLOCK";
            blockButton.onclick = helper;

            chatInput.disabled = false;
            chatSend.disabled = false;
          } else if ((friend.friend_status = "3")) {
            blockButton.innerHTML = "UNBLOCK";
            blockButton.onclick = helper2;

            chatInput.disabled = true;
            chatSend.disabled = true;
          }

          if (friend.username == "SYSTEM") {
            blockButton.disabled = true;
            chatInput.disabled = true;
            chatSend.disabled = true;
          }

          console.log(friend);
          window.intervalId = setInterval(() => {
            pullChats(friend);
          }, 1000);
        }
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
          <img width="64" height="64" style="object-fit: cover; border-radius: 32px" src="${friend.profile_pic}" onerror="this.src='/styles/images/profile-pic-sample.png'"/>
          <p>${friend.alias}</p>
        `;

        friendDiv.onclick = clicked;
        friendsHolder.appendChild(friendDiv);

        async function helper() {
          blockFriend(friend.request_id);
        }

        async function helper2() {
          unblockFriend(friend.request_id);
        }
        blockButton.onclick = helper;
      });
    } else {
      friendsHolder.innerHTML = `
        <h3 class="bold text-center h-100">you don't have any friends!</h3>
        <p class="text-center h-100">...unsurprising, and disappointing.</p>
      `;
    }
    console.log(friendsListInfo);
  } else if (str == "/dashboard") {
    let friendRequestInfo = await fetch(
      "https://localhost/api/friends/requests",
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
    requestsHolder.innerHTML = "";
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
            }" style="object-fit: cover; border-radius: 32px" onerror="this.src='/styles/images/profile-pic-sample.png'" />
            <h3 class="w-100 text-center">${request.other_user.alias} [${request.other_user.username}]</h3>
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
    // calling the match history
    pullMatchHistory("dashboard", my_id);
  } else if (str == "/achievements") {
    pullAchievements("achievements", my_id);
  } else if (str == "/leaderboards") {
    let leaderboardsInfo = await fetch(
      "https://localhost/api/matches/leaderboards",
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

    let globalLeaderboards = document.getElementById("leaderboards-global");
    if (leaderboardsInfo["data"].length > 0) {
      leaderboardsInfo["data"].forEach((item, index) => {
        const recordHolder = document.createElement("div");

        recordHolder.classList.add(
          "w-100",
          "box",
          "inner-box",
          "d-flex",
          "justify-content-between",
          "align-items-center",
          "gap-4",
          "p-4"
        );

        recordHolder.innerHTML = `
        <p class="ps-5">${index + 1}</p>
        <p class="bold">${item["alias"]} [${item["user"]}]</p>
        <p>${item["alias"]} wins</p>
        `;

        globalLeaderboards.appendChild(recordHolder);
      });
    }

    let friendsLeaderboardsInfo = await fetch(
      "https://localhost/api/matches/leaderboards/friends",
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

    let friendsLeaderboard = document.getElementById("leaderboards-friends");
    if (friendsLeaderboardsInfo["data"].length > 0) {
      friendsLeaderboardsInfo["data"].forEach((item, index) => {
        const recordHolder = document.createElement("div");

        recordHolder.classList.add(
          "w-100",
          "box",
          "inner-box",
          "d-flex",
          "justify-content-between",
          "align-items-center",
          "gap-4",
          "p-4"
        );

        recordHolder.innerHTML = `
        <p class="ps-5">${index + 1}</p>
        <p class="bold">${item["alias"]} [${item["user"]}]</p>
        <p>${item["alias"]} wins</p>
        `;

        friendsLeaderboard.appendChild(recordHolder);
      });
    }
  }
}

async function blockFriend(userid) {
  const blockButton = document.getElementById("friends-block-button");
  const chatInput = document.getElementById("friends-message-input");
  const chatSend = document.getElementById("friends-send-chat");
  let blockInfo = await fetch(`https://localhost/api/friends/${userid}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ friend_status: "3", blockedBy: "1" }),
  })
    .then(async (response) => {
      let answer = await response.json();

      if (answer["success"] == true) {
        blockButton.innerHTML = "UNBLOCK";
        blockButton.onclick = helper;
        chatInput.disabled = true;
        chatSend.disabled = true;
      }

      return response.json();
    })
    .catch((err) => err);

  async function helper() {
    unblockFriend(userid);
  }
}

async function unblockFriend(userid) {
  const blockButton = document.getElementById("friends-block-button");
  const chatInput = document.getElementById("friends-message-input");
  const chatSend = document.getElementById("friends-send-chat");

  let blockInfo = await fetch(`https://localhost/api/friends/${userid}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ friend_status: "1", blockedBy: "0" }),
  })
    .then(async (response) => {
      let answer = await response.json();

      if (answer["success"] == true) {
        blockButton.innerHTML = "BLOCK";
        blockButton.onclick = helper;
        chatInput.disabled = false;
        chatSend.disabled = false;
      }
      return response.json();
    })
    .catch((err) => err);

  async function helper() {
    blockFriend(userid);
  }
}

async function pullAchievements(str, id) {
  let achievementsInfo = await fetch(
    `https://localhost/api/achievements/${id}`,
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

  console.log(achievementsInfo);
  let achievementsHolder;
  if (str == "achievements")
    achievementsHolder = document.getElementById("achievements-holder");
  else {
    achievementsHolder = document.getElementById("profile-achievements-holder");
    achievementsHolder.classList.toggle("gap-4");
    achievementsHolder.classList.toggle("justify-content-between");

    document.getElementById("profile-achievements").innerHTML =
      achievementsInfo["data"].length;
  }
  console.log(achievementsHolder);
  if (achievementsInfo["data"].length > 0) {
    achievementsInfo["data"].forEach((item, index) => {
      if (str == "achievements" || (str == "profile" && index < 4)) {
        const achievementDivHolder = document.createElement("div");
        const achievementDiv = document.createElement("div");

        if (str == "achievements") achievementDivHolder.classList.add("col-4");
        else achievementDivHolder.classList.add("flex-grow-1", "max-w-quarter");

        achievementDiv.classList.add(
          "flex-grow-1",
          "m-1",
          "p-2",
          "h-fit",
          "box",
          "d-flex",
          "justify-content-start",
          "align-items-center",
          "gap-4"
        );

        achievementDiv.innerHTML = `
        <img
        width="64"
        height="64"
        class="mt-2"
        src="${item["icon"]}"
        />
        <div class="d-flex flex-column justify-content-center align-items-start">
        <p class="bold">${item["name"]}</p>
        <p class="description-text ${
          str == "profile" ? "disabled-element" : ""
        }">${item["description"]}</p>
        </div>
        `;
        achievementDivHolder.appendChild(achievementDiv);
        achievementsHolder.appendChild(achievementDivHolder);
      }
    });
  } else {
    achievementsHolder.classList.remove("justify-content-start");
    achievementsHolder.classList.remove("justify-content-between");
    achievementsHolder.classList.add("justify-content-center");
    achievementsHolder.classList.remove("align-items-start");
    achievementsHolder.classList.remove("align-content-start");
    achievementsHolder.classList.add("align-content-center");
    achievementsHolder.classList.add("align-items-center");
    achievementsHolder.classList.remove("h-fit");
    if (str == "achievements") achievementsHolder.classList.add("h-75");
    else achievementsHolder.classList.add("h-fit");
    achievementsHolder.classList.add("flex-column");
    achievementsHolder.classList.add("gap-2");
    achievementsHolder.innerHTML = `
    ${str == "profile" ? `<h3 class="w-100">RECENT ACHIEVEMENTS</h3>` : ``}
    <h3 class="text-center bold">accomplished...nothing?</h3>
    <p class="text-center small">your parents must be real proud.</p>
    `;
  }
}

async function pullMatchHistory(str, id) {
  let matchHistoryInfo = await fetch(
    `https://localhost/api/matches?id=${id}`,
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

  let historyHolder;
  let wins = 0,
    losses = 0,
    gametime = 0;
  if (str == "dashboard")
    historyHolder = document.getElementById("dashboard-match-history");
  else historyHolder = document.getElementById("profile-match-history");
  historyHolder.innerHTML = "";
  if (matchHistoryInfo["data"].length > 0) {
    matchHistoryInfo["data"].forEach((match) => {
      const matchDiv = document.createElement("div");
      matchDiv.classList.add(
        "custom-border",
        "d-flex",
        "align-items-center",
        "justify-content-evenly",
        "py-2",
        "px-4",
        "gap-2",
        "w-100",
        "clickable",
        "btn",

      );
      matchDiv.onclick = () => openMatchDetails(match.match_id);
      let result, boxClass;
      console.log(match);
      if (
        (match.player_one.id == id &&
          match.player_one_score > match.player_two_score) ||
        (match.player_two.id == id &&
          match.player_one_score < match.player_two_score)
      ) {
        result = "WIN";
        boxClass = "win-box";
        wins++;
      } else if ((String(match.player_two_score) === "0" && String(match.player_one_score) === "0") || match.player_two_score == match.player_one_score) {
        result = "DRAW";
        boxClass = "draw-box";
      } else {
        result = "LOSS";
        boxClass = "loss-box";
        losses++;
      }

      matchDiv.innerHTML = `
      <h3 class= "player_1 bold">${match.player_one.alias}</h3>
      <h3 class="electrolize text-center bold ${boxClass}"> ${result}</h3>
      <h3 class="player_2 bold">${match.player_two.alias}</h3>
    </div>
      `;
      historyHolder.appendChild(matchDiv);

      let startTime = new Date(match.start_time);
      let endTime = new Date(match.end_time);
      gametime += (endTime.getTime() - startTime.getTime()) / 60000;
    });

    if (str == "profile") {
      let winsHolder = document.getElementById("profile-wins");
      let lossesHolder = document.getElementById("profile-losses");
      let rankHolder = document.getElementById("profile-rank");
      let ratioHolder = document.getElementById("profile-ratio");
      let gametimeHolder = document.getElementById("profile-gametime");
      let chartHolder = document.getElementById("profile-chart");
      const ctx = chartHolder.getContext("2d");

      winsHolder.innerHTML = wins;
      lossesHolder.innerHTML = losses;
      ratioHolder.innerHTML = (wins / (losses == 0 ? 1 : losses)).toFixed(2);
      gametimeHolder.innerHTML = (
        gametime / matchHistoryInfo["data"].length
      ).toFixed(2);

      const total = wins + losses;
      const winsAngle = (wins / total) * 2 * Math.PI;
      const lossesAngle = (losses / total) * 2 * Math.PI;
      const centerX = chartHolder.width / 2;
      const centerY = chartHolder.height / 2;
      const radius = Math.min(centerX, centerY);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, 0, winsAngle);
      ctx.closePath();
      ctx.fillStyle = "#2B5E42"; // color for wins
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, winsAngle, winsAngle + lossesAngle);
      ctx.closePath();
      ctx.fillStyle = "#703738"; // color for losses
      ctx.fill();
    }
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

async function openModal(str) {
  let modalHolder = document.getElementById("modal");
  let modalInfo = document.getElementById("info-modal");
  modalInfo.innerHTML = `
        <h1 id="modal-heading" class="w-100"></h1>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="ionicon"
          viewBox="0 0 512 512"
          onclick="openModal('close')"
        >
          <path
            d="M400 145.49L366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49z"
          />
        </svg>`;
  let modalHeading = document.getElementById("modal-heading");

  if (str == "open-friend") {
    modalHeading.innerHTML = "ADD FRIEND";
    let apiInfo = await fetch("https://localhost/api/users/new", {
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
            <img width="64" height="64" src="${user.profile_pic}" style="object-fit: cover; border-radius: 64px" onerror="this.src='/styles/images/profile-pic-sample.png'" />
            <h3 class="w-25 text-center">${user.alias} [${user.username}]</h3>
            <button onclick="addFriend(${user.id}, this)" class="clickable btn small-btn">add friend</button>
          `;

          userContainer.appendChild(userDiv);
        }
      });
    } else {
      userContainer.innerHTML = `
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
      <div id="play-btn" onclick="createMatch('1v1-ai')" class="box select-box h-100 flex-fill d-flex flex-column gap-3 align-items-center justify-content-center clickable">
        <img src="styles/images/1v1.png" />
        <h3>1V1 AI</h3>
      </div>
    `;
    modalInfo.appendChild(userContainer);
    return;
  }
  if (str == "1v1-player") {
    console.log("enter player 2");
    modalHeading.innerHTML = "ENTER PLAYER NAME";

    modalHolder.style.zIndex = 100;
    modalHolder.style.opacity = 1;

    const userContainer = document.createElement("div");
    userContainer.classList.add(
      "d-flex",
      "flex-column",
      "gap-4",
      "h-75",
      "w-100",
      "justify-content-center",
      "align-items-center"
    );
    userContainer.innerHTML = `
    <label class="electrolize text-center">Enter player 2: </label>  
    <input id="player2" class="electrolize" type="text" required />
    <button id="play-btn" onclick=createMatch('1v1-player') class="btn small-btn">PLAY</button>
    `;
    modalInfo.appendChild(userContainer);
    return;
  }
  if (str == "tournament") {
    modalHeading.innerHTML = "ENTER PLAYER NAME";

    modalHolder.style.zIndex = 100;
    modalHolder.style.opacity = 1;


    for (let i = 2; i <= 4; i++) {
      const userContainer = document.createElement("div");
      userContainer.classList.add(
        "d-flex",
        "flex-column",
        "gap-4",
        "w-50",
        "justify-content-center",
        "align-items-center"
      );
      userContainer.innerHTML = `
      <label class="electrolize text-center">Enter player ${i}: </label>  
      <input id="player${i}" class="electrolize" type="text" required />     
      <input id="nickname${i}" class="electrolize" type="text" placeholder="Enter Nickname" required/>
      `;
      if (i == 4) {
        userContainer.style.margin = "10px 0px";
        userContainer.classList.toggle("w-50");
        userContainer.classList.toggle("w-100");
      }
      modalInfo.appendChild(userContainer);
    }
    const userButton = document.createElement("div");
    userButton.classList.add(
      "w-100",
      "h-25",
      "d-flex",
      "justify-content-center",
      "align-items-center"
    );
    userButton.innerHTML = `
    <div style="display: flex; flex-direction: row; gap: 4rem;">
      <input id="nickname1" class="electrolize" type="text" placeholder="Enter your Nickname" required/>
      <button id="play-btn" onclick=createMatch('tournament') class="btn small-btn">PLAY</button>
      <div>
    `;
    modalInfo.appendChild(userButton);
    modalInfo.classList.toggle("gap-4");
    return;
  }
  if (str == "edit-profile") {
    console.log("editing profile");
    modalHeading.innerHTML = "EDIT PROFILE";

    modalHolder.style.zIndex = 100;
    modalHolder.style.opacity = 1;

    const userContainer = document.createElement("div");
    userContainer.classList.add(
      "d-flex",
      "flex-column",
      "w-100",
      "align-items-center",
      "justify-content-center",
      "gap-2"
    );
    userContainer.innerHTML = `
    <label class="electrolize text-center w-50">RENAME ALIAS:</label>
    <input id="alias" class="w-50 text-center electrolize" type="text" required />
    <button onclick="submitEdits('alias')" class="mt-2 btn small-btn">
      SUBMIT
    </button>
    <label for="profile_pic" class="mt-2 electrolize text-center w-50">CHANGE AVATAR:</label>
    <input type="file" id="avatar" name="avatar" >
    <button onclick="submitEdits('avatar')" class="mt-2 btn small-btn">
      SUBMIT
    </button>
    `;
    modalInfo.appendChild(userContainer);
    return;
  }
  modalHolder.style.zIndex = -100;
  modalHolder.style.opacity = 0;
}

async function clickFileUpload() {
  let input = document.getElementById('avatar');
  console.log(input.onclick);
  input.click();
}

async function openMatchDetails(matchId) {
  let modalHolder = document.getElementById("modal");
  let modalInfo = document.getElementById("info-modal");
  let modalHeading = document.getElementById("modal-heading");

  modalHeading.innerHTML = "MATCH DASHBOARD";

  let matchDetail = await fetch(`https://localhost/api/matches/${matchId}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .catch((err) => err);

  console.log("Match Detail:", matchDetail);
  const matchData = matchDetail.data;

  modalHolder.style.zIndex = 100;
  modalHolder.style.opacity = 1;

  let startTime = new Date(matchData.start_time);
  let endTime = new Date(matchData.end_time);
  let startFormatted = startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  let endFormatted = endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const userContainer = document.createElement("div");
  userContainer.classList.add("h-75", "w-100", "d-flex", "flex-column", "gap-4" ,"align-items-center", "justify-content-evenly");

  let playersContainer = document.createElement("div");
  playersContainer.classList.add("d-flex", "w-50", "h-50", "gap-4");
  
  let player1Container = document.createElement("div");
  let timeContainer = document.createElement("div");
  let player2Container = document.createElement("div");
  player1Container.classList.add("d-flex", "flex-column", "inner-box", "w-50", "h-100", "p-4", "align-items-center", "justify-content-center", "text-center", "custom-border", "electrolize", "bold");
  player2Container.classList.add("d-flex", "flex-column", "inner-box", "w-50", "h-100", "p-4", "text-center", "align-items-center", "justify-content-center", "custom-border", "electrolize", "bold");
  timeContainer.classList.add("d-flex", "flex-column", "inner-box", "w-50", "h-50", "p-4", "text-center", "custom-border", "electrolize", "bold", "align-items-center", "justify-content-center");
  
  player1Container.innerHTML = `
  <h3>${matchData.player_one.username}</h3>
  <h3>SCORE</h3>
    <h3>${matchData.player_one_score}</h3>
  `;

  player2Container.innerHTML = `
    <h3>${matchData.player_two.username}</h3>
    <h3>SCORE</h3>
    <h3>${matchData.player_two_score}</h3>
  `;
  timeContainer.innerHTML = `
  <h3>Start Time</h3>
  <h3> ${startFormatted}</h3>
    <h3>End Time<h3>
    <h3> ${endFormatted}</h3>
    `;
    playersContainer.appendChild(player1Container);
    playersContainer.appendChild(player2Container);
  userContainer.appendChild(playersContainer);
  userContainer.appendChild(timeContainer);  
  modalInfo.appendChild(userContainer);
}

      
async function addFriend(id, t) {
  let apiInfo = await fetch("https://localhost/api/friends/", {
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
  openModal("close");
}

async function resolveFriend(answer, reqId) {
  let apiInfo = await fetch(`https://localhost/api/friends/${reqId}`, {
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

let chatLength = null;
let currentChatUser = null;
let chatLoaded = false;

async function pullChats(friend) {
  // Set chatLoaded to False if the receipient changes
  if (currentChatUser !== friend.username) {
    chatLoaded = false;
  }

  let chatInfo = await fetch(
    `https://localhost/api/msgs?friend_id=${friend.id}`,
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

  const chatHolder = document.getElementById("friends-chat");
  const chatTitle = document.getElementById("friends-username");
  chatTitle.innerHTML = `${friend.alias} [${friend.username}]`;
  chatTitle.href = `profile/${friend.id}`;

  let newChatLength = chatInfo["data"].length;
  let currentChatHeight = chatHolder.scrollHeight;

  if (chatInfo["data"].length > 0) {
    chatLength = chatInfo["data"].length;
    currentChatUser = friend.username;
    chatHolder.innerHTML = "";

    chatInfo["data"].forEach((message) => {
      const messageDiv = document.createElement("div");

      messageDiv.classList.add(
        "d-flex",
        "gap-2",
        "w-100",
        "align-content-start"
      );

      if (message.sender == friend.id)
        messageDiv.classList.add("friend-message", "justify-content-start");
      else messageDiv.classList.add("my-message", "justify-content-end");
      messageDiv.innerHTML = `
      <p>
      ${message.content}
      </p>
      `;
      chatHolder.appendChild(messageDiv);
    });
  } else {
    chatHolder.innerHTML = `
    <p class="w-100 text-center">(no chats yet. start something new with a message!)</p>
    `;
  }

  // If chat hasn't been loaded OR there's a new message, scroll to top
  if (!chatLoaded || currentChatHeight != chatHolder.scrollHeight) {
    chatHolder.scrollTop = chatHolder.scrollHeight;
    chatLoaded = true;
  }

  const sendChatButton = document.getElementById("friends-send-chat");
  const startGameButton = document.getElementById("friends-start-game");
  const chatTextArea = document.getElementById("friends-message-input");
  startGameButton.disabled = false;

  function clicked() {
    sendChat(friend);
  }
  function makeFriendGame() {
    if (friend.username == 'SYSTEM')
      createMatch('1v1-ai');
    else {
      let queryParams = `mode=1v1-player&player1=${encodeURIComponent(
        my_username
      )}&player2=${encodeURIComponent(friend.username)}`;
      window.history.pushState({}, "", `/play?${queryParams}`);
      changeRoute();
      showBckground();
      gameCountdown();
    }
  }
  sendChatButton.onclick = clicked;
  startGameButton.onclick = makeFriendGame;
}

async function sendChat(friend) {
  const messageInput = document.getElementById("friends-message-input");
  console.log(messageInput.value);

  let sendInfo = await fetch(`https://localhost/api/msgs/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      receiver: friend.id,
      content: messageInput.value,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return err;
    });

  messageInput.value = "";
}

async function profileFillData(number) {
  let userInfo = await fetch(`https://localhost/api/users/${number}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return err;
    });

  let role = userInfo["data"]["role"] == 0 ? "STUDENT" : "STAFF";
  let username = userInfo["data"]["username"];
  let image_url = userInfo["data"]["profile_pic"];
  if (image_url == null)
    image_url = defaultImageURL;

  const doc_username = document.getElementById("profile-username");
  const doc_role_holder = document.getElementById("profile-role-holder");
  const doc_role = document.getElementById("profile-role");
  const doc_image = document.getElementById("profile-image");
  doc_username.innerHTML = username;
  if (role == "STUDENT") doc_role_holder.classList.toggle("win-box");
  else doc_role_holder.classList.toggle("loss-box");
  doc_role.innerHTML = role;
  doc_image.src = image_url;

  pullMatchHistory("profile", number);

  setTimeout(() => {
    pullAchievements("profile", number);
  }, 1000);

  let leaderboardsInfo = await fetch(
    "https://localhost/api/matches/leaderboards",
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

  let globalLeaderboards = document.getElementById("leaderboards-global");
  if (leaderboardsInfo["data"].length > 0) {
    leaderboardsInfo["data"].forEach((item, index) => {
      if (item["user-id"] == number) {
        let rankHolder = document.getElementById("profile-rank");
        rankHolder.innerHTML = `#${index + 1}`;
      }
    });
  }
}

async function submitEdits(str) {
  const alias = document.getElementById("alias");
  const profile_pic = document.getElementById("avatar");

  console.log(str);
  
  if (str == "alias") {
    if (!alias.value || alias.value == "") {
      return;
    }

    console.log(alias.value);

    let info = await fetch(
      `https://localhost/api/users/update/alias`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alias: alias.value,
        })
      }
    )
      .then((response) => response.json())
      .catch((err) => err);

    console.log(info);
  }
  else if (str = "avatar") {
    if (profile_pic.files.length == 0) {
      return;
    }

    let formData = new FormData();
    formData.append('profile_pic', profile_pic.files[0]);

    let info = await fetch(
      `https://localhost/api/users/update/profile`,
      {
        method: "PUT",
        credentials: "include",
        body: formData
      }
    )
      .then((response) => response.json())
      .catch((err) => err);

    console.log(info);
  }
}
