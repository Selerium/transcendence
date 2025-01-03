/**
 * Represents the HTML canvas element used for rendering graphics.
 * The canvas is typically used as the rendering surface for 2D or 3D graphics.
 *
 * Assigned to the HTML element with the ID 'gameCanvas'.
 * Commonly used in games or graphical applications for drawing shapes, images, or animations.
 *
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById('gameCanvas');
/**
 * Represents the rendering context for a 2D drawing surface of a canvas element.
 * Provides methods and properties to draw and manipulate graphics and images.
 *
 * This context is configured with alpha transparency enabled.
 *
 * @type {CanvasRenderingContext2D}
 */
const ctx = canvas.getContext('2d',{alpha: true});
import {animate} from "./GameTraphy.js";
//3d testing:

/**
 * Defines the width of the paddle in a game or application context.
 * This variable determines the size of the paddle along its horizontal axis.
 * It is used for rendering, collision detection, or any functionality
 * that relies on the paddle's dimensions.
 */
const paddleWidth = 10, paddleHeight = 100;
/**
 * Represents the size of the ball.
 * The value is typically a numerical representation of the ball's diameter or radius.
 * It can be used in calculations related to the ball's movement, rendering, or physical properties.
 *
 * @type {number}
 */
const ballSize = 10;
/**
 * Represents the initial speed of the ball in the game.
 *
 * This variable sets the starting velocity of the ball, which
 * can be used to determine its movement dynamics upon game
 * initiation. It is critical for defining the baseline speed
 * and adjusting gameplay difficulty.
 *
 * @type {number}
 */
const paddleSpeed = 4, initialBallSpeed = 5;
/**
 * The interval, in milliseconds, at which the AI system updates its state or performs certain actions.
 * This variable determines the frequency of AI processing and can be adjusted to optimize performance or responsiveness.
 * A lower value increases the update frequency, while a higher value reduces it.
 */
const aiUpdateInterval = 1000;

/**
 * Represents the vertical position of the left paddle on the canvas.
 *
 * This variable determines the starting Y-coordinate for drawing the left paddle,
 * placing it vertically centered within the canvas. The value is calculated based
 * on the canvas height and paddle height to ensure the paddle aligns properly within the game's play area.
 *
 * It is typically used to update and render the position of the left paddle during gameplay.
 */
let leftPaddleY = ((canvas.height - paddleHeight) / 2 );
/**
 * Represents the vertical position of the right paddle on the canvas.
 * The value is calculated to initially center the paddle vertically
 * within the canvas. It is determined as the difference between the
 * canvas height and the paddle height, divided by 2.
 *
 * @type {number}
 */
let rightPaddleY = (canvas.height - paddleHeight) / 2;
/**
 * Represents the x-coordinate of the ball on the canvas.
 * This value is calculated as half the width of the canvas,
 * placing the ball horizontally at the center of the canvas.
 *
 * @type {number}
 */
let ballX = (canvas.width / 2);
/**
 * Represents the vertical position of the ball on the canvas.
 * It is initialized to be at the center of the canvas height.
 *
 * @type {number}
 */
let ballY = (canvas.height / 2);
/**
 * Represents the speed of a ball in a given context, such as a game or simulation.
 * The value is initialized with an initial speed and can be modified as required.
 *
 * This variable is intended to track how fast the ball is moving, which might be
 * used for calculating physics, rendering animations, or determining collision behavior.
 */
let ballSpeed = initialBallSpeed;
/**
 * Represents the horizontal velocity of a ball in motion.
 * This variable determines the speed of the ball along the X-axis
 * and is typically initialized with the value of the ball's initial speed.
 *
 * @type {number}
 */
let ballVelocityX = initialBallSpeed;
/**
 * The vertical component of the ball's velocity.
 * Represents the speed and direction of the ball's movement along the Y-axis.
 * This value is initialized to the `initialBallSpeed`.
 *
 * @type {number}
 */
let ballVelocityY = initialBallSpeed;
/**
 * Tracks the timestamp of the last paddle update.
 *
 * This variable is used to store the time, in milliseconds, when the paddle was last updated.
 * It helps in synchronizing paddle movements or related computations over time.
 *
 * @type {number}
 */
let lastPaddleUpdateTime = 0;
/**
 * Represents the score of Player 1 in a game.
 * This variable keeps track of the points accumulated by Player 1.
 * It is initialized to zero and can be updated as the game progresses.
 *
 * @type {number}
 */
let player1Score = 0;
/**
 * Represents the score of player 2 in a game.
 *
 * This variable tracks and stores the current score of the second player.
 * It is typically updated during gameplay to reflect changes based on the player's actions or game events.
 *
 * Initial value is set to 0.
 */
let player2Score = 0;
/**
 * A list that holds spark objects or data related to sparks.
 * This array is typically used to manage or store elements corresponding
 * to dynamic or animated visual effects, events, or components designed
 * as "sparks".
 *
 * This variable is initialized as an empty array and can be updated
 * dynamically within the program's lifecycle.
 *
 * Note that the nature or structure of the items that will populate this
 * array depends on the specific implementation or intended use case.
 */
let sparks = [];
/**
 * A variable to store the identifier for the game loop.
 *
 * This ID is typically returned by functions such as `setInterval` or `requestAnimationFrame`,
 * and can be used to cancel the recurring or scheduled operation associated with
 * the game loop.
 *
 * Initially set to `null` and updated when the game loop is initiated.
 */
let gameLoopId = null;
/**
 * Represents the interval identifier for the AI control mechanism.
 * This variable is intended to store a reference to a timer or interval
 * object used to manage recurring AI operations. It is initialized to null
 * and should be assigned a value when the interval is set.
 *
 * @type {null|number}
 */
let aiControlInterval = null;


/**
 * Renders the entire game canvas by clearing the previous frame
 * and sequentially drawing all game elements such as the background,
 * paddles, center line, ball, score, and particle effects.
 *
 * @return {void} Does not return a value.
 */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    drawPaddles();
    drawCenterLine();

    drawBall();
    drawScore(player1Score, player2Score);
    drawSparks();
}

/**
 * Renders the scores of two players on the canvas.
 *
 * @param {number} player1Score - The score of the first player to be displayed on the canvas.
 * @param {number} player2Score - The score of the second player to be displayed on the canvas.
 * @return {void} This function does not return any value.
 */
function drawScore(player1Score, player2Score) {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#D1C4E9';
    ctx.fillText(player1Score, canvas.width / 4, 50);
    ctx.fillText(player2Score, (canvas.width / 4) * 3, 50);
}


/**
 * Renders the paddles on a canvas for a game. The method draws two paddles with specific styles
 * and positions them based on predefined variables, such as paddle dimensions and their y-coordinates.
 *
 * @return {void} Does not return a value. The function modifies the canvas by drawing the paddles directly on it.
 */
function drawPaddles() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#C287F7';
    ctx.fillStyle = '#E1BEE7';
    ctx.fillRect(0 + 10, leftPaddleY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth - 10, rightPaddleY, paddleWidth, paddleHeight);
}


/**
 * Draws a gradient background on the canvas using a linear gradient
 * that transitions from one color to another.
 *
 * @return {void} This method does not return any value.
 */
function drawBackground() {
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#150E32');
    gradient.addColorStop(1, '#2A1057');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


/**
 * Draws a vertical, white, centered line on a canvas representing the middle divider.
 * The line is rendered with a shadow effect for enhanced visibility.
 *
 * @return {void} Does not return any value.
 */
function drawCenterLine() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'white';
    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width / 2 - paddleWidth / 2, 10 , paddleWidth - 5 , canvas.height -2 * 10);
}


/**
 * Renders a ball on the canvas with a radial gradient and shadow effects.
 *
 * @return {void} This function does not return a value.
 */
function drawBall() {
    let gradient = ctx.createRadialGradient(ballX, ballY, ballSize / 4, ballX, ballY, ballSize);
    gradient.addColorStop(0, '#9C27B0');
    gradient.addColorStop(1, '#FF80AB');

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FF80AB';
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

/**
 * Generates multiple spark objects with randomized properties and adds them to the sparks array.
 *
 * @param {number} x - The x-coordinate where the sparks will be generated.
 * @param {number} y - The y-coordinate where the sparks will be generated.
 * @return {void} This function does not return a value.
 */
function generateSparks(x, y) {
    for (let i = 0; i < 20; i++) {
        sparks.push({
            x: x,
            y: y,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 5,
            speedY: (Math.random() - 0.5) * 5,
            life: Math.random() * 10 + 5
        });
    }
}
/**
 * Draws all sparks currently in the `sparks` array on the canvas, updates their position,
 * and removes any sparks that have expired.
 *
 * @return {void} This method does not return a value.
 */
function drawSparks() {
    for (let i = sparks.length - 1; i >= 0; i--) {
        let spark = sparks[i];
        ctx.fillStyle = 'silver';
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fill();

        spark.x += spark.speedX;
        spark.y += spark.speedY;
        spark.life--;

        if (spark.life <= 0) {
            sparks.splice(i, 1);
        }
    }
}

/**
 * Increases the speed of the ball and adjusts the ball's velocity.
 * The ball's speed is incremented by a fixed value, and the velocity
 * is updated to reflect the new speed while retaining the original
 * direction (positive or negative).
 *
 * @return {void} Does not return any value.
 */
function IncreseBallSpeed() {
    ballSpeed += 0.6;
    ballVelocityX = ballVelocityX > 0 ? ballSpeed : -ballSpeed;
    ballVelocityY = ballVelocityY > 0 ? ballSpeed : -ballSpeed;
}

/**
 * Updates the position of the ball and handles the interactions with the paddles, walls, and scoring logic.
 * Adjusts ball velocity upon collision, manages scoring, and handles ball resets.
 *
 * @return {void} Does not return a value.
 */
function update() {
    ballX += ballVelocityX;
    ballY += ballVelocityY;

    if (ballY - ballSize < 0 || ballY + ballSize > canvas.height)
        ballVelocityY = -ballVelocityY;

    if (ballX - ballSize < paddleWidth + 10 && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight)
    {
        ballVelocityX = -ballVelocityX;
        IncreseBallSpeed();
        generateSparks(ballX, ballY);
    }
    else if (ballX + ballSize > canvas.width - paddleWidth - 10 && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) {
        ballVelocityX = -ballVelocityX;
        IncreseBallSpeed();
        generateSparks(ballX, ballY);
    }

    if (ballX - ballSize < 0 ){
        player2Score++;
        checkWinner();
        ResetBall();
    } else if (ballX + ballSize > canvas.width) {
        player1Score++;
        checkWinner();
        ResetBall();
    }
}


/**
 * Resets the ball's position to the center of the canvas and initializes its speed and velocity.
 *
 * @return {void} Does not return a value.
 */
function ResetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeed = initialBallSpeed;
    ballVelocityX = ballVelocityX > 0 ? -initialBallSpeed : initialBallSpeed;
    ballVelocityY = ballVelocityY > 0 ? initialBallSpeed : -initialBallSpeed;
}


/**
 * Handles keyboard input for controlling the left paddle in a game.
 * Listens for 'keydown' events and adjusts the paddle's position based on
 * the key pressed ('w' for up, 's' for down).
 *
 * @return {void} Does not return a value; updates left paddle position directly.
 */
function handleInput() {
    document.addEventListener('keydown', (e) =>
    {
        switch (e.key) {
            case 'w':
                if (leftPaddleY > 0) leftPaddleY -= paddleSpeed;
                break;
            case 's':
                if (leftPaddleY < canvas.height - paddleHeight) leftPaddleY += paddleSpeed;
                break;
        }
    });
}

/**
 * Predicts the future Y-coordinate position of the ball on the canvas based on its current position, velocity, and time to reach the right paddle.
 *
 * @return {Object} An object containing the predicted Y-coordinate of the ball ({ y: number }).
 */
function predict_ball_position() {
    let predictedBallY = ballY;
    let predictedVelocityY = ballVelocityY;

    const timeToRightPaddle = (canvas.width - paddleWidth - ballX) / ballVelocityX;

    predictedBallY += predictedVelocityY * timeToRightPaddle;

    if (predictedBallY - ballSize < 0 || predictedBallY + ballSize > canvas.height)
    {
        predictedVelocityY = -predictedVelocityY;
        predictedBallY = predictedBallY < 0 ? ballSize : canvas.height - ballSize;
    }

    return { y: predictedBallY };
}

/**
 * Controls the movement of the AI paddle in a game based on the predicted position of the ball.
 * This function incorporates some variability and a chance of error to simulate human-like behavior.
 *
 * The AI calculates the target position for the paddle, adjusts based on reaction time
 * and random variability, and then moves the paddle accordingly within the allowed bounds.
 *
 * @return {void} Does not return a value. Changes the position of the AI-controlled paddle directly.
 */
function ai_control_paddle() {
    const predictedPosition = predict_ball_position();
    const targetPaddleY = predictedPosition.y - paddleHeight / 2;
    const marginOfError = 10;

    const variability = Math.random() * 10;
    const reactionDelay = Math.random() * 0.2;
    const randomMissChance = Math.random();

    const actualTargetPaddleY = targetPaddleY + variability;
    const moveSpeed = paddleSpeed * (1 - reactionDelay);


    if (randomMissChance > 0.1)
    {
        if (actualTargetPaddleY < rightPaddleY - marginOfError) {
            rightPaddleY -= Math.min(moveSpeed, rightPaddleY - actualTargetPaddleY);
        } else if (actualTargetPaddleY > rightPaddleY + marginOfError) {
            rightPaddleY += Math.min(moveSpeed, actualTargetPaddleY - rightPaddleY);
        }
    }

    rightPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddleY));
}
/**
 * Represents the state of the game to determine if it has finished.
 * A value of 0 typically indicates that the game is not yet finished.
 * This variable is expected to be updated during the game's lifecycle.
 *
 * @type {number}
 */
let gameFinish = 0;

/**
 * Checks if there is a winner based on the players' scores. If a player's score
 * reaches 3, it stops the game, clears resources, and triggers the end-of-game
 * animation. The check is delayed by 1 second.
 * @return {void} This function does not return a value.
 */
function checkWinner() {
    setTimeout(() => {
    if (player1Score === 3 || player2Score === 3) {
        cancelAnimationFrame(gameLoopId);
        clearInterval(aiControlInterval);
        canvas.parentNode.removeChild(canvas);
        gameFinish = 1;
    }
    if (gameFinish === 1)
    {
        animate();
    }
    }, 1000);
}

/**
 * The main game loop function responsible for updating game state and rendering frames.
 * This function recursively calls itself using requestAnimationFrame to maintain a
 * consistent game animation and logic cycle.
 *
 * @return {void} This function does not return any value.
 */
function gameLoop()
{
    update();
    drawSparks();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}


/**
 * Starts the game by initializing necessary components and triggering the main game loop.
 * This includes handling user input, setting up AI control for the paddle, and starting the game logic.
 *
 * @return {void} Does not return a value.
 */
export function startGame() {
    handleInput();
    aiControlInterval=setInterval(ai_control_paddle, aiUpdateInterval);
    gameLoop();

}

// startGame();
