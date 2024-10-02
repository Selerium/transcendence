let lup;
let ldown;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddleWidth = 10, paddleHeight = 100;
const ballSize = 10;
const paddleSpeed = 4, initialBallSpeed = 5;

let leftPaddleY = (canvas.height - paddleHeight) / 2;
let rightPaddleY = (canvas.height - paddleHeight) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeed = initialBallSpeed;
let ballVelocityX = initialBallSpeed;
let ballVelocityY = initialBallSpeed;

var leftrelativeIntersectY;
var rightrelativeIntersectY;

var normalizedRelativeIntersectionY;
var bounceAngle;

var ballVx;
var ballVy;


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

function qwe() {
	const elemental = document.getElementById("as");
	console.error(math.unit(180, 'deg'));
}

function IncreseBallSpeed() {
    ballSpeed += 0.6;
    // ballVelocityX = ballVelocityX > 0 ? ballSpeed : -ballSpeed;
    // ballVelocityY = ballVelocityY > 0 ? ballSpeed : -ballSpeed;
}


function update() {
    ballX += ballVelocityX;
    ballY += ballVelocityY;


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
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeed = initialBallSpeed;
        ballVelocityX = ballVelocityX > 0 ? -initialBallSpeed : initialBallSpeed;
        ballVelocityY = ballVelocityY > 0 ? initialBallSpeed : -initialBallSpeed;
    }
	MoveAI()
}

function MoveAI() {
	if (rightPaddleY + 50 < ballY)
		rightPaddleY += paddleSpeed;
	else if(rightPaddleY + 50 > ballY && rightPaddleY > 0)
		rightPaddleY -= paddleSpeed;
}

function handleInput() {
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'w':
                lup = true;
				calculate();
                break;
            case 's':
                ldown = true;
				calculate();
                break;
			case 'ArrowUp':
				lup = true;
				calculate();
				break;
			case 'ArrowDown':
				ldown = true;
				calculate();
				break;
        }
    });
	document.addEventListener('keyup', (e) => {
		switch (e.key) {
			case 'w':
				lup = false;
				calculate();
				break;
			case 's':
				ldown = false;
				calculate();
				break;
			case 'ArrowUp':
				lup = false;
				calculate();
				break;
			case 'ArrowDown':
				ldown = false;
				calculate();
				break;
		}
	});
}

function calculate() {
	if (lup == true && leftPaddleY > 0)
		leftPaddleY -= paddleSpeed;
	if (ldown == true && leftPaddleY < canvas.height - paddleHeight)
		leftPaddleY += paddleSpeed;
	// if (rup == true && rightPaddleY > 0)
	// 	rightPaddleY -= paddleSpeed;
	// if (rdown == true && rightPaddleY < canvas.height - paddleHeight)
	// 	rightPaddleY += paddleSpeed;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// function gameStart() {
// 	if (start = 0) {
// 		wait(3);
// 		start = 1;
// 	}
// }

handleInput();
// gameStart();
gameLoop();