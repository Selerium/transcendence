import { waitForCanvasAndStartTrophy } from "../scripts/GameTrophy.js";

let thisMatch_id;

async function initGame(
  player_one,
  player_two,
  player_one_score,
  player_two_score,
  is_ai_opponent
) {
  let apiInfo = await fetch("https://localhost/api/matches/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      player_one: player_one,
      player_two: player_two,
      player_one_score: player_one_score,
      player_two_score: player_two_score,
      is_ai_opponent: is_ai_opponent,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      thisMatch_id = data.data.match_id;
    })
    .catch((err) => {
      return err;
    });

  return thisMatch_id;
}

async function initGame2(matchidd, player_one_score, player_two_score) {
  let apiInfo = await fetch("https://localhost/api/matches/", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      match_id: matchidd,
      player_one_score: player_one_score,
      player_two_score: player_two_score,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return err;
    });
}

export async function startGame(
  mode,
  nickname1,
  nickname2,
  player1,
  player2,
  matchEndCallback
) {
  const canvas = document.getElementById("startGame");
  let matchId = await initGame(
    player1,
    player2,
    null,
    null,
    mode === "1v1-ai" ? true : false
  );

  let ctx;
  if (canvas) ctx = canvas.getContext("2d");
  else return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let angle = Math.random() * Math.PI * 2;
  let initialSpeed = 8;
  let speedIncrease = 1.2;

  let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    speed: 8,
    radius: Math.min(canvas.width, canvas.height) * 0.02,
  };
  let paddleWidth = canvas.width * 0.02;
  let paddleHeight = canvas.height * 0.3;

  let player1Paddle = {
    x: 40,
    y: (canvas.height - paddleHeight) / 2,
    width: paddleWidth,
    height: paddleHeight,
  };
  let player2Paddle = {
    x: canvas.width - 50,
    y: (canvas.height - paddleHeight) / 2,
    width: paddleWidth,
    height: paddleHeight,
  };

  let targetPaddleY = player2Paddle.y;

  let wPressed = false;
  let sPressed = false;
  let upPressed = false;
  let downPressed = false;

  let player1Score = 0;
  let player2Score = 0;
  let gameOver = false;
  let gameLoopId = null;

  //recently added:
  var leftrelativeIntersectY;
  var rightrelativeIntersectY;
  var normalizedRelativeIntersectionY;
  var bounceAngle;
  //}

  const aiUpdateInterval = 1000;
  let aiControlInterval = null;
  let gameTimer = 120;
  let timerInterval = null;

  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  function keyDownHandler(e) {
    if (e.key === "w") {
      wPressed = true;
    } else if (e.key === "s") {
      sPressed = true;
    } else if (e.key === "ArrowUp") {
      upPressed = true;
    } else if (e.key === "ArrowDown") {
      downPressed = true;
    }
  }

  function keyUpHandler(e) {
    if (e.key === "w") {
      wPressed = false;
    } else if (e.key === "s") {
      sPressed = false;
    } else if (e.key === "ArrowUp") {
      upPressed = false;
    } else if (e.key === "ArrowDown") {
      downPressed = false;
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function checkPaddleCollision(ball, paddle) {
    const closestX = clamp(ball.x, paddle.x, paddle.x + paddle.width);
    const closestY = clamp(ball.y, paddle.y, paddle.y + paddle.height);

    const distX = ball.x - closestX;
    const distY = ball.y - closestY;
    const distSquared = distX * distX + distY * distY;
    const radiusSquared = ball.radius * ball.radius;

    if (distSquared < radiusSquared) {
      return "hit";
    } else if (Math.abs(distSquared - radiusSquared) < 0.0001) {
      return "corner";
    } else {
      return "none";
    }
  }

  function update() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
      ball.dy *= -1;
    }

    const collisionLeft = checkPaddleCollision(ball, player1Paddle);
    if (collisionLeft === "hit") {
      leftrelativeIntersectY =
        paddleHeight / 10 / 2 - (ball.y - player1Paddle.y) / 10;
      normalizedRelativeIntersectionY =
        leftrelativeIntersectY / (paddleHeight / 10 / 2);
      bounceAngle = normalizedRelativeIntersectionY * 1.1;
      ball.speed += 1;
      ball.dx = ball.speed * Math.cos(bounceAngle);
      ball.dy = ball.speed * -Math.sin(bounceAngle);
      // ball.x = player1Paddle.x + player1Paddle.width + ball.radius;
      if (ball.dx < 0) ball.dx *= -1;
    } else if (collisionLeft === "corner") {
      player2Score++;
      resetBall();
      return;
    }

    const collisionRight = checkPaddleCollision(ball, player2Paddle);
    if (collisionRight === "hit") {
      leftrelativeIntersectY =
        paddleHeight / 10 / 2 - (ball.y - player2Paddle.y) / 10;
      normalizedRelativeIntersectionY =
        leftrelativeIntersectY / (paddleHeight / 10 / 2);
      bounceAngle = normalizedRelativeIntersectionY * 1.1;
      ball.speed += 1;
      ball.dx = ball.speed * Math.cos(bounceAngle);
      ball.dy = ball.speed * -Math.sin(bounceAngle);
      // ball.x = player2Paddle.x + player2Paddle.width + ball.radius;
      if (ball.dx > 0) ball.dx *= -1;
    } else if (collisionRight === "corner") {
      player1Score++;
      resetBall();
      return;
    }

    if (wPressed && player1Paddle.y > 0) {
      player1Paddle.y -= 7;
    } else if (sPressed && player1Paddle.y < canvas.height - paddleHeight) {
      player1Paddle.y += 7;
    }

    if (mode !== "1v1-ai") {
      if (upPressed && player2Paddle.y > 0) {
        player2Paddle.y -= 7;
      } else if (
        downPressed &&
        player2Paddle.y < canvas.height - paddleHeight
      ) {
        player2Paddle.y += 7;
      }
    } else {
      const AI_SPEED = 7;
      if (player2Paddle.y < targetPaddleY) {
        player2Paddle.y += Math.min(AI_SPEED, targetPaddleY - player2Paddle.y);
      } else if (player2Paddle.y > targetPaddleY) {
        player2Paddle.y -= Math.min(AI_SPEED, player2Paddle.y - targetPaddleY);
      }
    }
    player2Paddle.y = clamp(player2Paddle.y, 0, canvas.height - paddleHeight);

    if (ball.x - ball.radius < 0) {
      player2Score++;
      resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
      player1Score++;
      resetBall();
    }
  }

  function predict_ball_position() {
    let predictedBallY = ball.y;
    let predictedVelocityY = ball.dy;

    const distanceToRightPaddle = player2Paddle.x - ball.x;
    const timeToRightPaddle =
      distanceToRightPaddle > 0 ? distanceToRightPaddle / Math.abs(ball.dx) : 0;

    predictedBallY += predictedVelocityY * timeToRightPaddle;

    if (predictedBallY - ball.radius < 0) {
      predictedBallY = ball.radius;
    } else if (predictedBallY + ball.radius > canvas.height) {
      predictedBallY = canvas.height - ball.radius;
    }

    return { y: predictedBallY };
  }

  function ai_control_paddle() {
    if (ball.dx > 0) {
      const prediction = predict_ball_position();

      const variability = Math.random() * 10;
      const reactionDelay = Math.random() * 0.2;
      const randomMissChance = Math.random();

      let desiredY = prediction.y - player2Paddle.height / 2;
      desiredY += variability;

      if (randomMissChance < 0.1) {
        desiredY += Math.random() > 0.5 ? 30 : -30;
      }

      setTimeout(() => {
        targetPaddleY = clamp(desiredY, 0, canvas.height - paddleHeight);
      }, reactionDelay * 1000);
    } else {
      targetPaddleY = (canvas.height - paddleHeight) / 2;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddles();
    drawCenterLine();
    drawBall();
    drawScore();
    if (mode !== "tournament")
      drawTimer();
  }

  function drawPaddles() {
    ctx.shadowBlur = 10;
    ctx.shadowColor = "white";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

    ctx.beginPath();
    ctx.roundRect(
      player1Paddle.x,
      player1Paddle.y,
      player1Paddle.width,
      player1Paddle.height,
      player1Paddle.height
    );
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(
      player2Paddle.x,
      player2Paddle.y,
      player2Paddle.width,
      player2Paddle.height,
      player2Paddle.height
    );
    ctx.fill();
  }

  function drawCenterLine() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = "white";
    ctx.fillStyle = "white";
    ctx.fillRect(canvas.width / 2 - 2, 80, 4, canvas.height - 80);
  }

  function drawBall() {
    let gradient = ctx.createRadialGradient(
      ball.x,
      ball.x,
      ball.radius / 4,
      ball.x,
      ball.x,
      ball.radius
    );
    gradient.addColorStop(0, "#9C27B0");
    gradient.addColorStop(1, "#FF80AB");

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#FF80AB";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  function drawScore() {
    let fontSize = Math.max(40, canvas.width * 0.015);
    ctx.font = `bold ${fontSize}px electrolize`;
    ctx.fillStyle = "#bbb5f1";
    ctx.textAlign = "center";
    ctx.shadowColor = "#6d4b77";
    ctx.shadowBlur = 20;

    ctx.fillText(
      `${player1} ${player1Score}`,
      canvas.width * 0.25,
      canvas.height * 0.08
    );
    ctx.fillText(
      `${player2} ${player2Score}`,
      canvas.width * 0.75,
      canvas.height * 0.08
    );
  }

  function drawTimer() {
    let timerX = canvas.width / 2;
    let timerY = 60;
    let fontSize = Math.max(40, canvas.width * 0.015);
    ctx.shadowColor = "transparent";

    ctx.font =
      gameTimer <= 10
        ? `bold ${fontSize + Math.sin(Date.now() / 100) * 5}px electrolize`
        : `bold ${fontSize}px electrolize`; // Pulse effect
    ctx.fillStyle = gameTimer <= 10 ? "red" : "#00c851";
    ctx.textAlign = "center"; // Center horizontally
    ctx.textBaseline = "bottom"; // Ensures it stays above the line

    ctx.fillText(`${formatTime(gameTimer)}`, timerX, timerY);
  }

  function gameLoop() {
    if (gameOver) return;
    update();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
  }

  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    let angle = Math.random() * Math.PI * 2;
    let speed = initialSpeed;

    ball.dx = speed * Math.cos(angle);
    ball.dy = speed * Math.sin(angle);

    if (Math.abs(ball.dx) < 2) ball.dx = ball.dx > 0 ? 2 : -2;
    if (Math.abs(ball.dy) < 2) ball.dy = ball.dy > 0 ? 2 : -2;
    ball.speed = 8;
    checkWinner();
  }

  function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      if (gameTimer > 0) {
        gameTimer--;
      } else {
        gameOver = true;
        checkWinner();
      }
    }, 1000);
  }

  function checkWinner() {
    if (player1Score === 5 || player2Score === 5 || gameOver == true) {
      cancelAnimationFrame(gameLoopId);
      clearInterval(aiControlInterval);
      clearInterval(timerInterval);
      gameOver = true;
      const winner = player1Score > player2Score ? player1 : player2;
      const loser = player1Score > player2Score ? player2 : player1;
      const winnerNickname =
        player1Score > player2Score ? nickname1 : nickname2;
      let matchResults = {
        match1: {
          player1: player1,
          player1Score: player1Score,
          player2: player2,
          player2Score: player2Score,
          player1Nickname: player1,
          player2Nickname: player2,
        },
      };
      setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (matchEndCallback) {
          initGame2(thisMatch_id, player1Score, player2Score, false);
          matchEndCallback(
            winner,
            loser,
            player1Score,
            player2Score,
            winnerNickname
          );
        } else {
          waitForCanvasAndStartTrophy(mode, matchResults);
          if (mode === "1v1-ai") {
            initGame2(thisMatch_id, player1Score, player2Score, true);
          } else {
            initGame2(thisMatch_id, player1Score, player2Score, false);
          }
        }
      }, 500);
    }
  }

  if (mode !== "tournament")
    startTimer();

  gameLoop();

  if (mode === "1v1-ai") {
    aiControlInterval = setInterval(ai_control_paddle, aiUpdateInterval);
  }

  function checkAndClearCanvas() {
    if (document.getElementById("startGame")) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cancelAnimationFrame(gameLoopId);
    clearInterval(aiControlInterval);
    clearInterval(timerInterval);
  }
  setInterval(checkAndClearCanvas, 100);
}
