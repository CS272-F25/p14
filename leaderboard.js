function renderLeaderboard() {
    // Get scores from localStorage
    const scores = JSON.parse(localStorage.getItem("allScores")) || [];

    for (let i = 1; i <= 3; i++) {
        // ===== TOP SCORES =====
        const topScores = [...scores]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        const topList = document.getElementById(`top-scores-game${i}`);
        topList.innerHTML = "";

        if (topScores.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No scores yet!";
            topList.appendChild(li);
        } else {
            topScores.forEach((entry, index) => {
                const li = document.createElement("li");
                li.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
                topList.appendChild(li);
            });
        }

        // ===== RECENT SCORES =====
        const recentList = document.getElementById(`recent-scores-game${i}`);
        recentList.innerHTML = "";

        const recentScores = [...scores]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10); // show last 10
        if (recentScores.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No recent scores!";
            recentList.appendChild(li);
        } else {
            recentScores.forEach((entry) => {
                const li = document.createElement("li");
                li.textContent = `${entry.name} - ${entry.score}`;
                recentList.appendChild(li);
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderLeaderboard();
});
