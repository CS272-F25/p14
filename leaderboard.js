function renderLeaderboard() {
    for (let i = 1; i <= 3; i++) {
        const gameID = `game${i}`;

        // Get top scores from database
        fetch("https://firestore.googleapis.com/v1/projects/lis-472-leaderboard/databases/(default)/documents:runQuery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body:
                JSON.stringify({ // SQL equivalent: SELECT * FROM scores WHERE gameID = ${gameID} ORDER BY score DESC LIMIT 10;
                    structuredQuery: {
                        from: [{ collectionId: "scores" }],
                        where: {
                            fieldFilter: {
                                field: { fieldPath: "gameID" },
                                op: "EQUAL",
                                value: { stringValue: gameID }
                            }
                        },
                        orderBy: [{
                            field: { fieldPath: "score" },
                            direction: "DESCENDING"
                        }],
                        limit: 10
                    }
                })
        }).then(res => {
            if (!res.ok) { // log error in console and return
                console.error(res.text())
                return;
            } else {
                return res.json();
            }
        }).then(rows => {
            const scores = (rows || []).filter(row => row.document && row.document.fields).map(row => {
                const field = row.document.fields;
                return {
                    name: field.username?.stringValue ?? "Anonymous",
                    score: Number(field.score?.doubleValue ?? 0),
                    date: field.createdAt?.timestampValue ?? null
                };
            });

            const topScores = [...scores]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            const topList = document.getElementById(`top-scores-${gameID}`);
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
        })

        // Recent scores
        fetch("https://firestore.googleapis.com/v1/projects/lis-472-leaderboard/databases/(default)/documents:runQuery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body:
                JSON.stringify({ // SQL equivalent: SELECT * FROM scores WHERE gameID = ${gameID} ORDER BY createdAt DESC LIMIT 10;
                    structuredQuery: {
                        from: [{ collectionId: "scores" }],
                        where: {
                            fieldFilter: {
                                field: { fieldPath: "gameID" },
                                op: "EQUAL",
                                value: { stringValue: gameID }
                            }
                        },
                        orderBy: [{
                            field: { fieldPath: "createdAt" },
                            direction: "DESCENDING"
                        }],
                        limit: 10
                    }
                })
        }).then(res => {
            if (!res.ok) { // log error in console and return
                console.error(res.text())
                return;
            } else {
                return res.json();
            }
        }).then(rows => {
            const scores = (rows || []).filter(row => row.document && row.document.fields).map(row => {
                const field = row.document.fields;
                return {
                    name: field.username?.stringValue ?? "Anonymous",
                    score: Number(field.score?.doubleValue ?? 0),
                    date: field.createdAt?.timestampValue ?? null
                };
            });

            // ===== RECENT SCORES =====
            const recentList = document.getElementById(`recent-scores-${gameID}`);
            recentList.innerHTML = "";

            if (scores.length === 0) {
                const li = document.createElement("li");
                li.textContent = "No recent scores!";
                recentList.appendChild(li);
            } else {
                scores.forEach((entry) => {
                    const li = document.createElement("li");
                    li.textContent = `${entry.name} - ${entry.score}`;
                    recentList.appendChild(li);
                });
            }
        })
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderLeaderboard();
});
