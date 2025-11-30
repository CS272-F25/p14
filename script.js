//
//   YOUR DARK MODE TOGGLE
// 
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("theme-toggle");

    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
        });
    }
});

// 
//   BOUNCE DODGE GAME CODE
// 
window.onload = () => {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return; // Do nothing if not on game page

    const ctx = canvas.getContext("2d");

    // Create Try Again button (hidden by default)
    const retryBtn = document.createElement("button");
    retryBtn.innerText = "Try Again";
    retryBtn.style.position = "absolute";
    retryBtn.style.top = "50%";
    retryBtn.style.left = "50%";
    retryBtn.style.transform = "translate(-50%, -50%)";
    retryBtn.style.padding = "15px 30px";
    retryBtn.style.fontSize = "1.5rem";
    retryBtn.style.display = "none";
    retryBtn.style.zIndex = "10";
    retryBtn.classList.add("btn", "btn-danger");  
    document.body.appendChild(retryBtn);

    retryBtn.addEventListener("click", () => {
        location.reload(); // resets game cleanly
    });

    // Player
    const player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: 12,
        speed: 4
    };

    // Key Input
    const keys = {};
    document.addEventListener("keydown", (e) => keys[e.key] = true);
    document.addEventListener("keyup", (e) => keys[e.key] = false);

    // Red Balls (enemies)
    let balls = [];
    for (let i = 0; i < 6; i++) {
        balls.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: 15,
            dx: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2),
            dy: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2)
        });
    }

    // Score
    let startTime = Date.now();
    const scoreDisplay = document.getElementById("score");

    let running = true;

    // UPDATE FUNCTION
    function update() {
        if (!running) return;

        // Player Movement
        if (keys["ArrowUp"]) player.y -= player.speed;
        if (keys["ArrowDown"]) player.y += player.speed;
        if (keys["ArrowLeft"]) player.x -= player.speed;
        if (keys["ArrowRight"]) player.x += player.speed;

        // Keep player inside bounds
        player.x = Math.max(player.r, Math.min(canvas.width - player.r, player.x));
        player.y = Math.max(player.r, Math.min(canvas.height - player.r, player.y));

        // Move balls
        balls.forEach(b => {
            b.x += b.dx;
            b.y += b.dy;

            // Bounce off walls
            if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.dx *= -1;
            if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.dy *= -1;

            // Collision check
            const dist = Math.hypot(player.x - b.x, player.y - b.y);
            if (dist < player.r + b.r) {
                gameOver();
            }
        });

        // Update score
        const survivalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        if (scoreDisplay) scoreDisplay.textContent = `Score: ${survivalTime}`;
    }

    // DRAW FUNCTION
    function draw() {
        if (!running) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw player
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
        ctx.fillStyle = "blue";
        ctx.fill();

        // Draw balls
        balls.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = "red";
            ctx.fill();
        });
    }

    // GAME OVER
    function gameOver() {
        running = false;

        retryBtn.style.display = "block";
    }

    // GAME LOOP
    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    loop();
};
