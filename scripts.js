import { clueLog } from "./clues.js";
import { generatePuzzle } from "./lib/puzzleGenerator.js";

window.addEventListener("load", async() => {
    let solutionSet = [];
    let audioCtx = null;
    const digitDisplays = [];
    const digitButtons = [];
    const digitValues = [];

    async function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioCtx.state === "suspended") {
            await audioCtx.resume();
        }
    }

    async function playCorrectSound() {
        await initAudio();

        const now = audioCtx.currentTime;

        const notes = [
            { frequency: 523.25, start: 0.00, duration: 0.12, volume: 0.10 }, // C5 - TA
            { frequency: 659.25, start: 0.10, duration: 0.12, volume: 0.11 }, // E5
            { frequency: 783.99, start: 0.20, duration: 0.35, volume: 0.16 }  // G5 - DA!
        ];

        notes.forEach(note => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = "triangle";
            osc.frequency.setValueAtTime(note.frequency, now + note.start);

            const start = now + note.start;
            const end = start + note.duration;

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(note.volume, start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, end);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(start);
            osc.stop(end);
        });
    }

    async function playIncorrectSound() {
        await initAudio();

        const now = audioCtx.currentTime;

        const notes = [
            { frequency: 330, start: 0.00, duration: 0.14, volume: 0.10 }, // E4
            { frequency: 247, start: 0.11, duration: 0.18, volume: 0.12 }, // B3
            { frequency: 175, start: 0.25, duration: 0.28, volume: 0.14 }  // F3
        ];

        notes.forEach(note => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            const start = now + note.start;
            const end = start + note.duration;

            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(note.frequency, start);

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(note.volume, start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, end);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(start);
            osc.stop(end);
        });
    }

    async function playAgainSound() {
        await initAudio();

        const now = audioCtx.currentTime;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "triangle";

        // Rising "let's go again!" phrase
        osc.frequency.setValueAtTime(261.63, now);        // C4
        osc.frequency.linearRampToValueAtTime(329.63, now + 0.12); // E4
        osc.frequency.linearRampToValueAtTime(392.00, now + 0.24); // G4
        osc.frequency.linearRampToValueAtTime(523.25, now + 0.38); // C5

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.10, now + 0.03);
        gain.gain.setValueAtTime(0.10, now + 0.32);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.56);
    }

    async function setMode() {
        // user choice of practice, callenge or rules
        guessDiv.innerHTML = "";
        cluesDiv.innerHTML = "";
        messageDiv.innerHTML = "";
        resetButton.style.display = "none";
        playAgainButton.style.display = "none";
        practiceButton.style.display = "block";
        challengeButton.style.display = "block";
        howToPlayButton.style.display = "block";
        fourDigitButton.style.display = "none";
        fiveDigitButton.style.display = "none";
        sixDigitButton.style.display = "none";
        submitGuessButton.style.display = "none";
        revealCodeButton.style.display = "none";
        logoutBtn.style.display = "block";
        standingsDiv.style.display = "flex";

        await loadDailyStandings();
    }

    function makePuzzle(mode, digitNum, savedRound = null) {

        let cluesToDisplay;

        if (mode === "challenge") {
            if (!savedRound || savedRound.digitNum !== digitNum) {
                throw new Error("Invalid saved challenge round.");
            }

            // Do not store the daily solution in browser JavaScript.
            solutionSet = [];

            cluesToDisplay = savedRound.clues.map(savedClue => {
                const clue = clueLog.find(
                    item => item.name === savedClue.name
                );

                if (!clue) {
                    throw new Error(
                        `Unknown clue: ${savedClue.name}`
                    );
                }

                return {
                    text: clue.getText(savedClue.value, digitNum)
                };
            });

        } else {
            const puzzle = generatePuzzle(clueLog, digitNum);

            solutionSet = [puzzle.solution];

            const digits = [...puzzle.solution].map(Number);

            cluesToDisplay = puzzle.selectedClues.map(clue => ({
                text: clue.getText(
                    clue.getValue(digits, digitNum),
                    digitNum
                )
            }));
        }

        // Reset the digit controls.
        digitValues.fill(0);

        digitDisplays.forEach(display => {
            display.textContent = "0";
        });

        digitButtons.forEach(button => {
            button.disabled = false;
        });

        submitGuessButton.style.display = "block";
        playAgainButton.style.display = "none";

        revealCodeButton.style.display =
            mode === "practice" ? "block" : "none";

        messageDiv.textContent = "";
        cluesDiv.innerHTML = "";
        creatingPuzzleMessage.style.display = "none";

        // Display the puzzle clues.
        cluesToDisplay.forEach(clue => {
            const clueElement = document.createElement("p");
            clueElement.innerHTML = clue.text;
            cluesDiv.appendChild(clueElement);
        });
    }

    async function setupPage(mode, digitNum, savedRound = null) {
        // promise set to return to challenge loop in challenge mode
        return new Promise(resolve => {
            resolvePuzzle = resolve;
     
            // reset the digit-control arrays
            digitDisplays.length = 0;
            digitButtons.length = 0;
            digitValues.length = 0;

            // create the digit controls for the selected game
            for (let i = 0; i < digitNum; i++) {
                const digitBox = document.createElement("div");
                digitBox.classList.add("digitBox");

                const upButton = document.createElement("button");
                upButton.textContent = "▲";
                upButton.classList.add("digitUp");

                const digitDisplay = document.createElement("div");
                digitDisplay.textContent = "0";
                digitDisplay.classList.add("digitDisplay");

                const downButton = document.createElement("button");
                downButton.textContent = "▼";
                downButton.classList.add("digitDown");

                digitValues[i] = 0;

                let upTimeout;
                let downTimeout;

                upButton.addEventListener("click", () => {
                    if (upTimeout) return;

                    digitValues[i] = (digitValues[i] + 1) % 10;
                    digitDisplay.textContent = digitValues[i];

                    upTimeout = setTimeout(() => {
                        upTimeout = null;
                    }, 120);
                });

                downButton.addEventListener("click", () => {
                    if (downTimeout) return;

                    digitValues[i] = (digitValues[i] + 9) % 10;
                    digitDisplay.textContent = digitValues[i];

                    downTimeout = setTimeout(() => {
                        downTimeout = null;
                    }, 120);
                });

                digitDisplays.push(digitDisplay);
                digitButtons.push(upButton, downButton);

                digitBox.append(upButton, digitDisplay, downButton);
                guessDiv.append(digitBox);
            }

            submitGuessButton.style.display = "block";

            if (mode === "practice") {
                revealCodeButton.style.display = "block";
                resetButton.style.display = "block";
            }

            makePuzzle(mode, digitNum, savedRound);
        });
    }

    function setupPractice() {
        // user choice of four or five or six digit game
        guessDiv.innerHTML = "";
        cluesDiv.innerHTML = "";
        messageDiv.innerHTML = "";
        resetButton.style.display = "block";
        playAgainButton.style.display = "none";
        practiceButton.style.display = "none";
        challengeButton.style.display = "none";
        howToPlayButton.style.display = "none";
        fourDigitButton.style.display = "block";
        fiveDigitButton.style.display = "block";
        sixDigitButton.style.display = "block";
        submitGuessButton.style.display = "none";
        revealCodeButton.style.display = "none";
        logoutBtn.style.display = "none";
        standingsDiv.style.display = "none";
    }

    async function setupChallenge() {

        // Reset the game state for challenge mode.
        guessDiv.innerHTML = "";
        cluesDiv.innerHTML = "";
        messageDiv.innerHTML = "";

        resetButton.style.display = "none";
        playAgainButton.style.display = "none";
        practiceButton.style.display = "none";
        challengeButton.style.display = "none";
        howToPlayButton.style.display = "none";
        fourDigitButton.style.display = "none";
        fiveDigitButton.style.display = "none";
        sixDigitButton.style.display = "none";
        submitGuessButton.style.display = "none";
        revealCodeButton.style.display = "none";
        logoutBtn.style.display = "none";
        standingsDiv.style.display = "none";

        creatingPuzzleMessage.style.display = "block";
        messageDiv.textContent = "Loading today's challenge...";

        let timerInterval;

        try {
            // Start today's challenge and record the attempt on the server.
            const response = await fetch("/api/startDailyChallenge", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error || "Unable to start today's challenge."
                );
            }

            // Ensure all three rounds are present in the expected order.
            const rounds = [4, 5, 6].map(digitNum =>
                data.rounds.find(
                    round => round.digitNum === digitNum
                )
            );

            if (rounds.some(round => !round)) {
                throw new Error(
                    "Today's challenge is missing a round."
                );
            }

            // Start the timer after the server accepts the attempt.
            const challengeStart = Date.now();

            timerInterval = setInterval(() => {
                const challengeTime =
                    (Date.now() - challengeStart) / 1000;

                messageDiv.textContent =
                    challengeTime.toFixed(1) + " seconds";
            }, 100);

            // Play the saved 4-, 5-, and 6-digit rounds.
            for (const round of rounds) {
                guessDiv.innerHTML = "";
                cluesDiv.innerHTML = "";
                creatingPuzzleMessage.style.display = "block";

                await new Promise(resolve =>
                    setTimeout(resolve, 50)
                );

                await setupPage(
                    "challenge",
                    round.digitNum,
                    round
                );
            }

            clearInterval(timerInterval);
            timerInterval = null;

            // Save the completed challenge and get the server-recorded time.
            messageDiv.textContent = "Saving your result...";

            const completionResponse = await fetch(
                "/api/completeDailyChallenge",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({})
                }
            );

            const completionData = await completionResponse.json();

            if (!completionResponse.ok || !completionData.success) {
                throw new Error(
                    completionData.error || "Unable to save your challenge result."
                );
            }

            const challengeTime =
                Number(completionData.completionTimeSeconds).toFixed(1);

            messageDiv.innerHTML = "Challenge Complete!";
            messageDiv.innerHTML +=
                `<br>Time: ${challengeTime} seconds`;
            messageDiv.style.color = "#22cc44";


            // We'll save this completion time to standings in the next step.

        } catch (error) {
            console.error("Challenge error:", error);

            if (timerInterval) {
                clearInterval(timerInterval);
            }

            creatingPuzzleMessage.style.display = "none";

            messageDiv.textContent =
                error.message || "Unable to load today's challenge.";

            messageDiv.style.color = "#ff4444";
        }

        resetButton.style.display = "block";
    }

    async function loadDailyStandings() {
        const standingsDiv = document.getElementById("standingsDiv");

        standingsDiv.textContent = "Loading standings...";

        try {
            const response = await fetch("/api/getDailyStandings");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to load standings.");
            }

            if (!data.standings || data.standings.length === 0) {
                standingsDiv.textContent = "No standings available yet.";
                return;
            }


            const container = document.createElement("div");

            // Helper to create a standings table.
            function createTable(title, headers, rows) {
                const section = document.createElement("section");

                const heading = document.createElement("h3");
                heading.textContent = title;
                section.appendChild(heading);

                const table = document.createElement("table");
                table.className = "standingsTable";

                const thead = document.createElement("thead");
                const headerRow = document.createElement("tr");

                headers.forEach(header => {
                    const th = document.createElement("th");
                    th.textContent = header;
                    headerRow.appendChild(th);
                });

                thead.appendChild(headerRow);
                table.appendChild(thead);

                const tbody = document.createElement("tbody");

                rows.forEach(values => {
                    const row = document.createElement("tr");

                    values.forEach(value => {
                        const cell = document.createElement("td");
                        cell.textContent = String(value);
                        row.appendChild(cell);
                    });

                    tbody.appendChild(row);
                });

                table.appendChild(tbody);
                section.appendChild(table);
                container.appendChild(section);
            }

            // Table 1: Today's leaderboard.
            createTable(
                "Today's Leaderboard",
                [" ", "Player", "Today's Time"],
                data.standings.map(player => [
                    player.rank ?? "—",
                    player.username,
                    player.todayTime !== null
                        ? `${Number(player.todayTime).toFixed(1)} s`
                        : player.todayStatus === "in_progress"
                            ? "In progress"
                            : "—"
                ])
            );

            // Table 2: Recent performance.
            // Rank here is the player's rank in today's leaderboard.
            createTable(
                "30-Day Statistics",
                [" ", "Player", "Streak", "Average"],
                data.standings.map(player => [
                    player.rank ?? "—",
                    player.username,
                    player.streak,
                    player.averageTime !== null
                        ? `${Number(player.averageTime).toFixed(1)} s`
                        : "—"
                ])
            );

            standingsDiv.replaceChildren(container);


        } catch (error) {
            console.error("Loading daily standings failed:", error);
            standingsDiv.textContent = "Unable to load standings.";
        }
    }

    function howToPlay() {
        guessDiv.innerHTML = `
            <div class="gameChoice">
                <p>how to play:</p>
                <p>use the mathematical clues to crack the secret code</p>
                <p><strong>zen mode</strong> allows you to practice solving puzzles of either 4, 5 or 6 digits</p>
                <p><strong>challenge mode</strong> is a daily competition to solve a 4, 5 and 6 digit puzzle in the shortest time</p>
                <p>the use of a caclulator is strongly discouraged - challenge yourself to solve the puzzles in your head</p>
            </div>
        `;
        resetButton.style.display = "block";
        practiceButton.style.display = "none";
        challengeButton.style.display = "none";
        howToPlayButton.style.display = "none";
        logoutBtn.style.display = "none";
        standingsDiv.style.display = "none";
    }

    // main script starts here
    // populate the page
    let username = localStorage.getItem("codeBreakerName");
    const loginModal = document.getElementById("loginModal");
    const loginBtn = document.getElementById("loginBtn");
    const loginError = document.getElementById("loginError");
    const logoutBtn = document.getElementById("logoutButton");
    const registerBtn = document.getElementById("registerBtn");
    const page = document.getElementById("page");
    const titleDiv = document.getElementById("titleDiv");
    const guessDiv = document.getElementById("guessDiv");
    const cluesDiv = document.getElementById("cluesDiv");
    const messageDiv = document.getElementById("messageDiv");
    const standingsDiv = document.getElementById("standingsDiv");
    const playAgainButton = document.getElementById("playAgainButton");
    const submitGuessButton = document.getElementById("submitGuessButton");
    const revealCodeButton = document.getElementById("revealCodeButton");
    const fourDigitButton = document.getElementById("fourDigitButton");
    const fiveDigitButton = document.getElementById("fiveDigitButton");
    const sixDigitButton = document.getElementById("sixDigitButton");
    const practiceButton = document.getElementById("practiceButton");
    const challengeButton = document.getElementById("challengeButton");
    const howToPlayButton = document.getElementById("howToPlayButton");
    const resetButton = document.getElementById("resetButton");
    const creatingPuzzleMessage = document.getElementById("creatingPuzzleMessage");
    let digitNum;
    let mode = "";
    let resolvePuzzle;

    // show login screen if user not logged in
    if(!username) {
        loginModal.style.display = "flex";
    } else {
        page.style.display = "flex";
        titleDiv.innerHTML = `codeBreaker`;
        setMode();
    }

    loginBtn.addEventListener("click", async () => {
        const loginEmail = document.getElementById("loginEmail").value.trim();
        const loginPassword = document.getElementById("loginPassword").value.trim();
        
        loginError.textContent = "please wait...";
        loginBtn.textContent = "wait..."

        // call the backend js to check the username and password
        try {
            const loginRes = await fetch("/api/loginLogic", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ loginEmail, loginPassword })
            });

            // process the returned data
            const data = await loginRes.json();
            if (!loginRes.ok) {
                loginError.textContent = data.error;
                loginBtn.textContent = "login";
                return;
            }
            
            // save the data in local storage and go to mode selection page
            localStorage.setItem("codeBreakerName", data.user.username);
            localStorage.setItem("codeBreakerId", data.user.id);
            document.getElementById("loginModal").style.display = "none";
            username = localStorage.getItem("codeBreakerName");
            titleDiv.innerHTML = `codeBreaker`;
            setMode();

        } catch (error) {
            console.error("Error during login:", error);
            loginError.textContent = "An error occurred. Please try again.";
            loginBtn.textContent = "login";
        }
    });

    registerBtn.addEventListener("click", async () => {
        const registerUsername = document.getElementById("registerUsername").value.trim();
        const registerEmail = document.getElementById("registerEmail").value.trim();
        const registerPassword = document.getElementById("registerPassword").value.trim();

        loginError.textContent = "please wait...";
        registerBtn.textContent = "wait..."

        // call the backend js to check the username and password
        try {
            const registerRes = await fetch("/api/registerLogic", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ registerUsername, registerEmail, registerPassword })
            });

            // process the returned data
            const data = await registerRes.json();
            if (!registerRes.ok) {
                loginError.textContent = data.error;
                registerBtn.textContent = "register";
                return;
            }
            
            // save the data in local storage and go to mode selection page
            localStorage.setItem("codeBreakerName", data.user.username);
            localStorage.setItem("codeBreakerId", data.user.id);
            document.getElementById("loginModal").style.display = "none";
            username = localStorage.getItem("codeBreakerName");
            titleDiv.innerHTML = `codeBreaker`;
            setMode();

        } catch (error) {
            console.error("Error during login:", error);
            loginError.textContent = "An error occurred. Please try again.";
            registerBtn.textContent = "register";
        }
    });

    resetButton.addEventListener("click", async () => {
        setMode();
    });

    fourDigitButton.addEventListener("click", async () => {
        digitNum = 4;
        creatingPuzzleMessage.style.display = "block";
        guessDiv.innerHTML = "";
        fourDigitButton.style.display = "none";
        fiveDigitButton.style.display = "none";
        sixDigitButton.style.display = "none";
        resetButton.style.display = "none";
        logoutBtn.style.display = "none";

        // give the browser time to display the loading message
        await new Promise(resolve => setTimeout(resolve, 50));

        setupPage("practice", digitNum);
    });

    fiveDigitButton.addEventListener("click", async () => {
        digitNum = 5;
        creatingPuzzleMessage.style.display = "block";
        guessDiv.innerHTML = "";
        fourDigitButton.style.display = "none";
        fiveDigitButton.style.display = "none";
        sixDigitButton.style.display = "none";
        resetButton.style.display = "none";
        logoutBtn.style.display = "none";

        // give the browser time to display the loading message
        await new Promise(resolve => setTimeout(resolve, 50));

        setupPage("practice", digitNum);
    });

    sixDigitButton.addEventListener("click", async () => {
        digitNum = 6;
        creatingPuzzleMessage.style.display = "block";
        guessDiv.innerHTML = "";
        fourDigitButton.style.display = "none";
        fiveDigitButton.style.display = "none";
        sixDigitButton.style.display = "none";
        resetButton.style.display = "none";
        logoutBtn.style.display = "none";

        // give the browser time to display the loading message
        await new Promise(resolve => setTimeout(resolve, 50));

        setupPage("practice", digitNum);
    }); 

    playAgainButton.addEventListener("click", async () => {
        await playAgainSound();
        cluesDiv.innerHTML = "";

        messageDiv.innerHTML = "";

        digitValues.fill(0);

        digitDisplays.forEach(display => {
            display.textContent = "0";
        });

        digitButtons.forEach(button => {
            button.disabled = false;
        });

        playAgainButton.style.display = "none";

        // give the browser time to display the loading message
        await new Promise(resolve => setTimeout(resolve, 50));

        setupPractice();
    });

    practiceButton.addEventListener("click", async () => {
        mode = "practice";
        setupPractice();
    });

    challengeButton.addEventListener("click", async () => {
        mode = "challenge";
        setupChallenge();
    });
    
    howToPlayButton.addEventListener("click", async () => {
        howToPlay();
    });

    revealCodeButton.addEventListener("click", async () => {
        messageDiv.innerHTML = `The code is: ${solutionSet[0]}`;
        messageDiv.style.color = "#33ff33";

        submitGuessButton.style.display = "none";
        revealCodeButton.style.display = "none";
        playAgainButton.style.display = "block";
    });

    submitGuessButton.addEventListener("click", async () => {

        const guess = digitValues.join("");
        let isCorrect;

        if (mode === "challenge") {
            try {
                const response = await fetch("/api/submitDailyGuess", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        guess,
                        digitNum: guess.length
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Unable to check your guess."
                    );
                }

                isCorrect = result.correct;

            } catch (error) {
                console.error("Daily guess error:", error);

                messageDiv.textContent =
                    "Unable to check your guess. Please try again.";
                messageDiv.style.color = "#ff4444";
                return;
            }

        } else {
            isCorrect = guess === solutionSet[0];
        }

        if (isCorrect) {
            await playCorrectSound();

            if (mode === "practice") {
                messageDiv.innerHTML = "Correct!<br>You've cracked it!";
            } else {
                messageDiv.textContent = "Correct! You've cracked it!";
            }

            messageDiv.style.color = "#22cc44";

            submitGuessButton.style.display = "none";
            revealCodeButton.style.display = "none";

            digitButtons.forEach(button => {
                button.disabled = true;
            });

            if (mode === "practice") {
                playAgainButton.style.display = "block";
            }

            if (resolvePuzzle) {
                resolvePuzzle();
                resolvePuzzle = null;
            }

        } else {
            await playIncorrectSound();

            messageDiv.innerHTML = "Incorrect guess!<br>Try again!";
            messageDiv.style.color = "#ff4444";
        }
    });

    logoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/logout", {
                method: "POST"
            });

            if (!response.ok) {
                throw new Error("Logout failed.");
            }

            localStorage.removeItem("codeBreakerName");
            localStorage.removeItem("codeBreakerId");

            window.location.reload();
        } catch (error) {
            console.error("Logout error:", error);
            alert("Unable to log out. Please try again.");
        }
    });

        // splash screen fadeaway
        setTimeout(() => {
            const splash = document.getElementById("splash");
            splash.style.opacity = "0";

            setTimeout(() => {
                splash.style.display = "none";
                page.style.display = "block";
            }, 100);
        }, 600);
});
