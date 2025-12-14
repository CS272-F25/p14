//
//   SPACE DODGE GAME
//

// Images
const bgImage = new Image();
bgImage.src = "images/Space.jpg";

const enemyImage = new Image();
enemyImage.src = "images/enemyShip.png";

const playerImg = new Image();
playerImg.src = "images/playerShip.png";

// Music
const bgMusic = new Audio("sounds/space.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.2;

window.onload = () => {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let running = false;
    let balls = [];
    let startTime = 0;
    const scoreDisplay = document.getElementById("score");

    // Countdown element
    const countdownEl = document.getElementById("countdown");
    countdownEl.style.position = "absolute";
    countdownEl.style.zIndex = "20";
    countdownEl.style.fontSize = "4rem";
    countdownEl.style.fontWeight = "bold";
    countdownEl.style.fontFamily = "'Audiowide', cursive";
    countdownEl.style.color = "white";
    countdownEl.style.textAlign = "center";
    countdownEl.style.textShadow = "0 0 10px white, 0 0 20px #8e44ad, 0 0 30px #8e44ad";
    countdownEl.style.display = "none";

    // Player
    const player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: 15,
        speed: 4,
        angle: 0
    };

    // Key input to prevent scrolling
    const keys = {};
    document.addEventListener("keydown", e => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
        keys[e.key] = true;
    });
    document.addEventListener("keyup", e => keys[e.key] = false);

    // START GAME BUTTON
    const startBtn = document.createElement("button");
    startBtn.innerText = "Start Game";
    Object.assign(startBtn.style, {
        position: "absolute",
        top: canvas.offsetTop + canvas.height / 2 + "px",
        left: canvas.offsetLeft + canvas.width / 2 + "px",
        transform: "translate(-50%, -50%)",
        padding: "15px 30px",
        fontSize: "1.5rem",
        zIndex: "10",
        backgroundColor: "#8e44ad",
        color: "white",
        border: "none",
        outline: "none",
        cursor: "pointer",
        boxShadow: "0 0 15px rgba(142, 68, 173, 0.7)",
        transition: "0.3s",
        fontFamily: "'Audiowide', cursive"
    });
    document.body.appendChild(startBtn);
    startBtn.addEventListener("mouseover", () => startBtn.style.boxShadow = "0 0 25px rgba(142, 68, 173, 1)");
    startBtn.addEventListener("mouseout", () => startBtn.style.boxShadow = "0 0 15px rgba(142, 68, 173, 0.7)");

    // RETRY BUTTON
    const retryBtn = document.createElement("button");
    retryBtn.innerText = "Try Again";
    Object.assign(retryBtn.style, {
        position: "absolute",
        top: canvas.offsetTop + canvas.height / 2 + "px",
        left: canvas.offsetLeft + canvas.width / 2 + "px",
        transform: "translate(-50%, -50%)",
        padding: "15px 30px",
        fontSize: "1.5rem",
        zIndex: "10",
        backgroundColor: "#e74c3c",
        color: "white",
        border: "none",
        outline: "none",
        cursor: "pointer",
        boxShadow: "0 0 15px rgb(255, 0, 0)",
        transition: "0.3s",
        display: "none",
        fontFamily: "'Audiowide', cursive"
    });
    document.body.appendChild(retryBtn);
    retryBtn.addEventListener("mouseover", () => retryBtn.style.boxShadow = "0 0 25px rgb(255, 0, 0)");
    retryBtn.addEventListener("mouseout", () => retryBtn.style.boxShadow = "0 0 15px rgb(255, 0, 0)");
    retryBtn.addEventListener("click", () => location.reload());

    // Create enemies
    function createBalls() {
        balls = [];
        for (let i = 0; i < 6; i++) {
            const dx = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2);
            const dy = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2);
            balls.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: 15,
                dx: dx,
                dy: dy,
                angle: dx > 0 ? Math.PI / 2 : -Math.PI / 2
            });
        }
    }

    // Countdown
    function countdown(callback) {
        let counter = 3;
        countdownEl.style.display = "block";
        countdownEl.style.top = canvas.offsetTop + canvas.height / 2 + "px";
        countdownEl.style.left = canvas.offsetLeft + canvas.width / 2 + "px";

        const interval = setInterval(() => {
            countdownEl.textContent = counter > 0 ? counter : "Go!";
            counter--;
            if (counter < -1) {
                clearInterval(interval);
                countdownEl.style.display = "none";
                callback();
            }
        }, 667);
    }

    // Save score helper
    function saveScore(playerName, score) {
        const newScore = {
            name: playerName || "Player",
            score: score,
            date: new Date()
        };
        const allScores = JSON.parse(localStorage.getItem("allScores")) || [];
        allScores.push(newScore);
        localStorage.setItem("allScores", JSON.stringify(allScores));
    }

    // Start Game
    startBtn.addEventListener("click", () => {
        startBtn.style.display = "none";
        createBalls();
        countdown(() => {
            startTime = Date.now();
            running = true;
            bgMusic.play();
        });
    });

    // Update game
    function update() {
        if (!running) return;

        // Player movement & rotation
        if (keys["ArrowUp"]) player.y -= player.speed, player.angle = 0;
        if (keys["ArrowDown"]) player.y += player.speed, player.angle = Math.PI;
        if (keys["ArrowLeft"]) player.x -= player.speed, player.angle = -Math.PI / 2;
        if (keys["ArrowRight"]) player.x += player.speed, player.angle = Math.PI / 2;

        // Boundaries
        player.x = Math.max(player.r, Math.min(canvas.width - player.r, player.x));
        player.y = Math.max(player.r, Math.min(canvas.height - player.r, player.y));

        // Move enemies & flip on wall
        balls.forEach(b => {
            b.x += b.dx;
            b.y += b.dy;

            if (b.x - b.r < 0) { b.dx *= -1; b.angle = Math.PI / 2; }
            if (b.x + b.r > canvas.width) { b.dx *= -1; b.angle = -Math.PI / 2; }
            if (b.y - b.r < 0) { b.dy *= -1; b.angle = 0; }
            if (b.y + b.r > canvas.height) { b.dy *= -1; b.angle = Math.PI; }

            // Collision with player
            const dist = Math.hypot(player.x - b.x, player.y - b.y);
            if (dist < player.r + b.r) gameOver();
        });

        // Score update
        const survival = ((Date.now() - startTime) / 1000).toFixed(1);
        scoreDisplay.textContent = `Score: ${survival} seconds`;
    }

    // Draw everything
    function draw() {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        // Player
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);
        ctx.drawImage(playerImg, -player.r * 1.5, -player.r * 1.5, player.r * 3, player.r * 3);
        ctx.restore();

        // Enemies
        balls.forEach(b => {
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.angle);
            ctx.drawImage(enemyImage, -b.r * 1.5, -b.r * 1.5, b.r * 3, b.r * 3);
            ctx.restore();
        });
    }

    // Game over
    function gameOver() {
        running = false;
        bgMusic.pause();
        bgMusic.currentTime = 0;

        // Final score
        const finalScore = ((Date.now() - startTime) / 1000).toFixed(1);

        // Prompt for player name
        const playerName = prompt("Game Over! Enter your name for the leaderboard:", "Player");

        // Save score to localStorage
        saveScore(playerName, finalScore);

        // Show retry button
        retryBtn.style.display = "block";

        // Update score display
        scoreDisplay.textContent = `Score: ${finalScore} seconds`;
    }

    // Game loop
    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    loop();
};
