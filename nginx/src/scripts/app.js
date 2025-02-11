let loggedIn = false;
let my_username = null;
let my_id;

async function fillData(str) {
  if (currentChatUser) currentChatUser = null;
  if (chatLoaded) chatLoaded = null;
  if (chatLength) chatLength = null;

  if (window.intervalId) clearInterval(window.intervalId);

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
    id = info["data"]["id"];
    let image_url = info["data"]["profile_pic"];

    const doc_nav_username = document.getElementById("nav-profile");
    const doc_nav_image = document.getElementById("nav-image");
    doc_nav_username.innerHTML = username;
    doc_nav_image.src = image_url;
  }

  if (my_username == null) {
    let meInfo = await fetch("http://localhost:8080/api/me", {
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
    let meInfo = await fetch("http://localhost:8080/api/me", {
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

    const doc_username = document.getElementById("profile-username");
    const doc_role_holder = document.getElementById("profile-role-holder");
    const doc_role = document.getElementById("profile-role");
    const doc_image = document.getElementById("profile-image");
    doc_username.innerHTML = username;
    if (role == "STUDENT") doc_role_holder.classList.toggle("win-box");
    else doc_role_holder.classList.toggle("loss-box");
    doc_role.innerHTML = role;
    doc_image.src = image_url;

    pullMatchHistory("profile");

    setTimeout(() => {
      pullAchievements("profile");
    }, 1000);

    let leaderboardsInfo = await fetch(
      "http://localhost:8080/api/matches/leaderboards",
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
    friendsHolder.innerHTML = "";
    const sendChatButton = document.getElementById("friends-send-chat");
    const chatTextArea = document.getElementById("friends-message-input");
    sendChatButton.disabled = true;
    chatTextArea.disabled = true;
    let selectedUserId = null;

    const blockButton = document.getElementById("friends-block-button");
    if (friendsListInfo["data"].length > 0) {
      friendsListInfo["data"].forEach((friend) => {
        const friendDiv = document.createElement("button");
        function clicked() {
          if (window.intervalId != null) clearInterval(window.intervalId);

          let chatHolder = document.getElementById("friends-chat");
          chatHolder.innerHTML = "";

          blockButton.disabled = false;

          if (friend.friend_status == '1') {
            blockButton.innerHTML = "BLOCK";
            blockButton.onclick = helper;
          }
          else if (friend.friend_status = '3') {
            blockButton.innerHTML = "UNBLOCK";
            blockButton.onclick = helper2;
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
          <img width="64" height="64" style="object-fit: cover; border-radius: 32px" src="${friend.profile_pic}" />
          <p>${friend.username}</p>
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
      
    }
    else {
      friendsHolder.innerHTML = `
        <h3 class="bold text-center h-100">you don't have any friends!</h3>
        <p class="text-center h-100">...unsurprising, and disappointing.</p>
      `;
    }
    console.log(friendsListInfo);
  } else if (str == "/dashboard") {
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
    // calling the match history
    pullMatchHistory("dashboard");
  } else if (str == "/achievements") {
    pullAchievements("achievements");
  } else if (str == "/leaderboards") {
    let leaderboardsInfo = await fetch(
      "http://localhost:8080/api/matches/leaderboards",
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
        <p class="bold">${item["user"]}</p>
        <p>${item["wins"]} wins</p>
        `;

        globalLeaderboards.appendChild(recordHolder);
      });
    }

    let friendsLeaderboardsInfo = await fetch(
      "http://localhost:8080/api/matches/leaderboards/friends",
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
        <p class="bold">${item["user"]}</p>
        <p>${item["wins"]} wins</p>
        `;

        friendsLeaderboard.appendChild(recordHolder);
      });
    }
  }
}

async function blockFriend(userid) {
  const blockButton = document.getElementById('friends-block-button');
  let blockInfo = await fetch(`http://localhost:8080/api/friends/${userid}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ friend_status: "3" }),
  })
    .then((response) => {
      blockButton.innerHTML = 'UNBLOCK';
      blockButton.onclick = helper;
      return response.json();
    })
    .catch((err) => err);

  async function helper() {
    unblockFriend(userid);
  }

  console.log(blockInfo); // Debugging
  // return blockInfo;
}

async function unblockFriend(userid) {
  const blockButton = document.getElementById('friends-block-button');
  let blockInfo = await fetch(`http://localhost:8080/api/friends/${userid}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ friend_status: "1" }),
  })
    .then((response) => {
      blockButton.innerHTML = 'BLOCK';
      blockButton.onclick = helper;
      return response.json();
    })
    .catch((err) => err);

    async function helper() {
      blockFriend(userid);
    }

  console.log(blockInfo); // Debugging
  // return blockInfo;
}

async function pullAchievements(str) {
  let achievementsInfo = await fetch("http://localhost:8080/api/achievements", {
    method: "GET",
    credentials: "include",
  })
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
    achievementsHolder.classList.add("align-items-center");
    achievementsHolder.classList.remove("h-fit");
    if (str == "achievements") achievementsHolder.classList.add("h-75");
    else achievementsHolder.classList.add("h-fit");
    achievementsHolder.classList.add("flex-column");
    achievementsHolder.classList.add("gap-2");
    achievementsHolder.innerHTML = `
    <h3 class="w-100">RECENT ACHIEVEMENTS</h3>
    <h3 class="text-center bold">accomplished...nothing?</h3>
    <p class="text-center small">your parents must be real proud.</p>
    `;
  }
}

async function pullMatchHistory(str) {
  let matchHistoryInfo = await fetch(
    `http://localhost:8080/api/matches?id=${my_id}`,
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
        "w-100"
      );
      let result, boxClass;
      if (match.player_one_score > match.player_two_score) {
        result = "WIN";
        boxClass = "win-box";
        wins++;
      } else if (match.player_two_score > match.player_one_score) {
        result = "LOSS";
        boxClass = "loss-box";
        losses++;
      } else {
        result = "DRAW";
        boxClass = "draw-box";
      }
      matchDiv.innerHTML = `
      <h3 class= "player_1 bold">${match.player_one.username}</h3>
      <h3 class="electrolize text-center bold ${boxClass}"> ${result}</h3>
      <h3 class="player_2 bold">${match.player_two.username}</h3>
    </div>
      `;
      historyHolder.appendChild(matchDiv);

      let startTime = new Date(match.start_time);
      let endTime = new Date(match.end_time);
      gametime += (startTime.getTime() - endTime.getTime()) / 60000;
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
    let apiInfo = await fetch("http://localhost:8080/api/users/new", {
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
      <div onclick="createMatch('1v1-ai')" class="box select-box h-100 flex-fill d-flex flex-column gap-3 align-items-center justify-content-center clickable">
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
    <button onclick=createMatch('1v1-player') class="btn small-btn">PLAY</button>
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
        "h-25",
        "gap-4",
        "w-50",
        "justify-content-center",
        "align-items-center"
      );
      userContainer.innerHTML = `
      <label class="electrolize text-center">Enter player ${i}: </label>  
      <input id="player${i}" class="electrolize" type="text" required />
      `;
      if (i == 4) {
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
      <button onclick=createMatch('tournament') class="btn small-btn">PLAY</button>
    `;
    modalInfo.appendChild(userButton);
    modalInfo.classList.toggle("gap-4");
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
  openModal("close");
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

let chatLength = null;
let currentChatUser = null;
let chatLoaded = false;

async function pullChats(friend) {
  // Set chatLoaded to False if the receipient changes
  if (currentChatUser !== friend.username) {
    chatLoaded = false;
  }

  let chatInfo = await fetch(
    `http://localhost:8080/api/msgs?friend_id=${friend.id}`,
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
  chatTitle.innerHTML = friend.username;

  let newChatLength = chatInfo["data"].length;
  let currentChatHeight = chatHolder.scrollHeight;
  // if ((chatLength != null && newChatLength == chatLength) || (currentChatUser != null && currentChatUser == friend.username))
  //   return ;
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

      // <img
      //   width="32"
      //   height="32"
      //   style="object-fit: cover; border-radius: 16px"
      //   src="${friend.profile_pic}"
      // />
      messageDiv.innerHTML = `
      <p>
      ${message.content}
      </p>
      `;
      chatHolder.appendChild(messageDiv);
    });
  }
  else {
    chatHolder.innerHTML = `
    <p class="w-100 text-center">(no chats yet. start something new with a message!)</p>
    `
  }

  // If chat hasn't been loaded OR there's a new message, scroll to top
  if (!chatLoaded || currentChatHeight != chatHolder.scrollHeight) {
    chatHolder.scrollTop = chatHolder.scrollHeight;
    chatLoaded = true;
  }

  const sendChatButton = document.getElementById("friends-send-chat");
  const chatTextArea = document.getElementById("friends-message-input");
  sendChatButton.disabled = false;
  chatTextArea.disabled = false;
  function clicked() {
    sendChat(friend);
  }
  sendChatButton.onclick = clicked;
}

async function sendChat(friend) {
  const messageInput = document.getElementById("friends-message-input");
  console.log(messageInput.value);

  let sendInfo = await fetch(`http://localhost:8080/api/msgs/`, {
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
