let lup;
let ldown;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddleWidth = 10, paddleHeight = 100;
const ballSize = 10;
const paddleSpeed = 150, initialBallSpeed = 5;

let leftPaddleY = (canvas.height - paddleHeight) / 2;
let rightPaddleY = (canvas.height - paddleHeight) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeed = initialBallSpeed;
let ballVelocityX = initialBallSpeed;
let ballVelocityY = initialBallSpeed;

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

	ctx.fillStyle = 'blue';
	ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
	ctx.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);

	ctx.fillStyle = 'red';
	ctx.beginPath();
	ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();

}

function IncreseBallSpeed() {
	ballSpeed += 0.6;
	// ballVelocityX = ballVelocityX > 0 ? ballSpeed : -ballSpeed;
	// ballVelocityY = ballVelocityY > 0 ? ballSpeed : -ballSpeed;
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
		ballVelocityX = ballSpeed * Math.cos(bounceAngle);
		ballVelocityY = ballSpeed * -Math.sin(bounceAngle);
		if (ballVelocityX > 0)
			ballVelocityX *= -1;
	}

	if (ballX - ballSize < 0 || ballX + ballSize > canvas.width) {
		if (ballX - ballSize < 0)
			l_point++;
		if (ballX - ballSize > canvas.width)
			r_point++;
		ballX = canvas.width / 2;
		ballY = canvas.height / 2;
		ballSpeed = initialBallSpeed;
		ballVelocityX = ballVelocityX > 0 ? -initialBallSpeed : initialBallSpeed;
		ballVelocityY = ballVelocityY > 0 ? initialBallSpeed : -initialBallSpeed;
	}
	calculate();
	MoveAI();
}

function MoveAI() {
	if (rightPaddleY + 40 < ballY && rightPaddleY < 300)
		rightPaddleY += (rightPaddleY + paddleSpeed) * timenow;
	else if(rightPaddleY + 30 > ballY && rightPaddleY > 0)
		rightPaddleY -= (rightPaddleY + paddleSpeed) * timenow;
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
				lup = true;
				break;
			case 'ArrowDown':
				ldown = true;
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
				lup = false;
				break;
			case 'ArrowDown':
				ldown = false;
				break;
		}
	});
}

function calculate() {
	if (lup == true && leftPaddleY > 0)
		leftPaddleY -= (leftPaddleY + paddleSpeed) * timenow;
	if (ldown == true && leftPaddleY < canvas.height - paddleHeight)
		leftPaddleY += (leftPaddleY + paddleSpeed) * timenow;

	// if (lup == true && leftPaddleY > 0)
	// 	leftPaddleY -= paddleSpeed;
	// 	leftPaddleY -= paddleSpeed;
	// if (ldown == true && leftPaddleY < canvas.height - paddleHeight)
	// 	leftPaddleY += paddleSpeed;
	// 	leftPaddleY += paddleSpeed;


	// if (rup == true && rightPaddleY > 0)
	// 	rightPaddleY -= paddleSpeed;
	// if (rdown == true && rightPaddleY < canvas.height - paddleHeight)
	// 	rightPaddleY += paddleSpeed;
}

// function sleep(ms) {
// 	return new Promise(resolve => setTimeout(resolve, ms));
// }


function gameLoop() {
	update();
	draw();
	requestAnimationFrame(gameLoop);
}

handleInput();
gameLoop();