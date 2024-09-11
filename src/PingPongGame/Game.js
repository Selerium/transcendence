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
    ballVelocityX = ballVelocityX > 0 ? ballSpeed : -ballSpeed;
    ballVelocityY = ballVelocityY > 0 ? ballSpeed : -ballSpeed;
}


function update() {
   
    ballX += ballVelocityX;
    ballY += ballVelocityY;

    if (ballY - ballSize < 0 || ballY + ballSize > canvas.height) 
        ballVelocityY = -ballVelocityY;
    
    if (ballX - ballSize < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) 
    {
        ballVelocityX = -ballVelocityX;
        IncreseBallSpeed();

    }
    else if (ballX + ballSize > canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) 
    {
        ballVelocityX = -ballVelocityX;
        IncreseBallSpeed();
    }

    if (ballX - ballSize < 0 || ballX + ballSize > canvas.width) {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeed = initialBallSpeed;
        ballVelocityX = ballVelocityX > 0 ? -initialBallSpeed : initialBallSpeed;
        ballVelocityY = ballVelocityY > 0 ? initialBallSpeed : -initialBallSpeed;
    }
}


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
            case 'ArrowUp':
                if (rightPaddleY > 0) rightPaddleY -= paddleSpeed;
                break;
            case 'ArrowDown':
                if (rightPaddleY < canvas.height - paddleHeight) rightPaddleY += paddleSpeed;
                break;
        }
    });
}


function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

handleInput();
gameLoop();