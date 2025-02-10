
let lup;
let ldown;
let rup;
let rdown;

const canvas = document.getElementById('gameCanvas');

const ctx = canvas.getContext('2d',{alpha: true});
import {animate} from "./GameTraphy.js";
//3d testing:

const paddleWidth = 10, paddleHeight = 100;
const ballSize = 10;
const paddleSpeed = 150, initialBallSpeed = 5;
const aiUpdateInterval = 1000;

let leftPaddleY = (canvas.height - paddleHeight) / 2;
let rightPaddleY = (canvas.height - paddleHeight) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeed = initialBallSpeed;
let ballVelocityX = initialBallSpeed;
let ballVelocityY = initialBallSpeed;
let lastPaddleUpdateTime = 0;
let player1Score = 0;
let player2Score = 0;
let sparks = [];
let gameLoopId = null;
let aiControlInterval = null;


var timepast = Date.now();
var timenow;

var leftrelativeIntersectY;
var rightrelativeIntersectY;

var normalizedRelativeIntersectionY;
var bounceAngle;

var ballVx;
var ballVy;

var l_point;
var r_point;

var begin = 0;
var pointleft = 0;
var pointright = 0;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    drawPaddles();
    drawCenterLine();

    drawBall();
    drawScore(player1Score, player2Score);
    drawSparks();
}




function drawScore(player1Score, player2Score) {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#D1C4E9';
    ctx.fillText(player1Score, canvas.width / 4, 50);
    ctx.fillText(player2Score, (canvas.width / 4) * 3, 50);
}



function drawPaddles() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#C287F7';
    ctx.fillStyle = '#E1BEE7';
    ctx.fillRect(0 + 10, leftPaddleY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth - 10, rightPaddleY, paddleWidth, paddleHeight);
}


function drawBackground() {
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#150E32');
    gradient.addColorStop(1, '#2A1057');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function drawCenterLine() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'white';
    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width / 2 - paddleWidth / 2, 10 , paddleWidth - 5 , canvas.height -2 * 10);
}


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

function IncreseBallSpeed() {
	ballSpeed += 0.6;
}


function update() {
	ballX += ballVelocityX;
	ballY += ballVelocityY;
	timenow = (Date.now() - timepast) / 1000;
	timepast = Date.now();

	if (ballY - ballSize < 0 || ballY + ballSize > canvas.height)
		ballVelocityY = -ballVelocityY;

	if (ballX - ballSize < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) {

		leftrelativeIntersectY = ((paddleHeight / 10) / 2) - ((ballY - leftPaddleY) / 10);

		normalizedRelativeIntersectionY = (leftrelativeIntersectY/((paddleHeight / 10)/2));
		bounceAngle = normalizedRelativeIntersectionY * 1.1;
		IncreseBallSpeed();
        // generateSparks(ballX, ballY);
		ballVelocityX = ballSpeed * Math.cos(bounceAngle);
		ballVelocityY = ballSpeed * -Math.sin(bounceAngle);
		if (ballVelocityX < 0)
			ballVelocityX *= -1;
	}
	else if (ballX + ballSize > canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) {

		rightrelativeIntersectY = ((paddleHeight / 10) / 2) - ((ballY - rightPaddleY) / 10);

		normalizedRelativeIntersectionY = (rightrelativeIntersectY/((paddleHeight / 10)/2));
		bounceAngle = normalizedRelativeIntersectionY * 1.1;
		IncreseBallSpeed();
        // generateSparks(ballX, ballY);
		ballVelocityX = ballSpeed * Math.cos(bounceAngle);
		ballVelocityY = ballSpeed * -Math.sin(bounceAngle);
		if (ballVelocityX > 0)
			ballVelocityX *= -1;
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
    calculate();
}

function ResetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeed = initialBallSpeed;
    ballVelocityX = ballVelocityX > 0 ? -initialBallSpeed : initialBallSpeed;
    ballVelocityY = ballVelocityY > 0 ? initialBallSpeed : -initialBallSpeed;
}


function handleInput() {
	document.addEventListener('keydown', (e) => {
		switch (e.key) {
			case 'w':
				lup = true;
				break;
			case 's':
				ldown = true;
				break;
			case 'ArrowUp':
				rup = true;
				break;
			case 'ArrowDown':
				rdown = true;
				break;
		}
	});
	document.addEventListener('keyup', (e) => {
		switch (e.key) {
			case 'w':
				lup = false;
				break;
			case 's':
				ldown = false;
				break;
			case 'ArrowUp':
				rup = false;
				break;
			case 'ArrowDown':
				rdown = false;
				break;
		}
	});
}

function calculate() {
	if (lup == true && leftPaddleY > 0)
		leftPaddleY -= (leftPaddleY + paddleSpeed) * timenow;
	if (ldown == true && leftPaddleY < canvas.height - paddleHeight)
		leftPaddleY += (leftPaddleY + paddleSpeed) * timenow;
	if (rup == true && rightPaddleY > 0)
		rightPaddleY -= (rightPaddleY + paddleSpeed) * timenow;
	if (rdown == true && rightPaddleY < canvas.height - paddleHeight)
		rightPaddleY += (rightPaddleY + paddleSpeed) * timenow;
}


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

let gameFinish = 0;


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


function gameLoop()
{
    update();
    drawSparks();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}


export function startGame() {
    handleInput();
    // aiControlInterval=setInterval(ai_control_paddle, aiUpdateInterval);
    gameLoop();

}

// startGame();
