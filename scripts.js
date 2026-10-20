window.addEventListener("load", async() => {
    let solutionSet = [];
    let audioCtx = null;
    const digitDisplays = [];
    const digitButtons = [];
    const digitValues = [];

    function getSolutionSet(clues, candidateCache) {
        // returns the commom solution set for the sent clues
        const clueSet = clues.map(clue =>
            candidateCache.get(clue.name)
        );

        // start with the smallest set to minimize filtering
        const smallestSet = clueSet.reduce(
            (smallest, current) =>
                current.size < smallest.size ? current : smallest
        );

        return [...smallestSet].filter(number =>
            clueSet.every(set => set.has(number))
        );
    }

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

    function findBestFirstClue(availableClues, candidateCache) {
        // returns clue that has the smallest solution set to use as a starting clue
        let bestClue = null;
        let smallestSize = Infinity;

        availableClues.forEach(clue => {

            const clueCandidates = candidateCache.get(clue.name);

            if (clueCandidates.size < smallestSize) {
                bestClue = clue;
                smallestSize = clueCandidates.size;
            }
        });

        return bestClue;
    }

    function findBestNextClue(availableClues, solutionSet, candidateCache) {
        // returns clue that reduces the solutionSet the most
        let bestClue = null;
        let bestSolutionSet = null;
        let smallestSize = Infinity;

        availableClues.forEach(clue => {

            const clueCandidates = candidateCache.get(clue.name);

            const newSolutionSet = solutionSet.filter(number =>
                clueCandidates.has(number)
            );

            if (
                newSolutionSet.length > 0 &&
                newSolutionSet.length < smallestSize
            ) {
                bestClue = clue;
                bestSolutionSet = newSolutionSet;
                smallestSize = newSolutionSet.length;
            }
        });

        return {
            clue: bestClue,
            solutionSet: bestSolutionSet
        };
    }

    function setMode() {
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
    }

    function makePuzzle(mode,digitNum) {
        
        let digits = [];
        let selectedClues = [];
        let candidates = [];
        let candidateCache = [];

        while (true) {
            // randomly select the digits for the puzzle
            digits = [];
            for (let i = 0; i < digitNum; i++) {
                const num = Math.floor( Math.random() * 10 );
                digits[i] = num;
            }
            //
            console.log(`The number is ${digits.join("")}`);
            //
            // create array of candidates
            candidates = [];
            for (let i = 0; i < Math.pow(10, digitNum); i++) {
                let stringNum = i.toString().padStart(digitNum, '0');
                candidates.push(stringNum);
            }

            // reset digit display
            digitValues.fill(0);

            digitDisplays.forEach(display => {
                display.textContent = "0";
            });

            digitButtons.forEach(button => {
                button.disabled = false;
            });

            // loop to find valid puzzle with unique solution set
            selectedClues = [];

            // create cache of solution sets for all clues given puzzle digits
            candidateCache = new Map();
            clueLog.forEach (clue => {
                candidateCache.set(
                    clue.name, 
                    clue.remainingCandidates(
                        clue.getValue(digits, digitNum), 
                        candidates, 
                        digitNum,
                        digits
                    ));
            });

            // reset clues and solution set for each iteration
            let availableClues = [...clueLog];
            selectedClues = [];

            // pick the clue that produces the smallest candidate set
            const firstClue = findBestFirstClue(availableClues, candidateCache);

            availableClues.splice(availableClues.indexOf(firstClue), 1);

            selectedClues.push(firstClue);

            solutionSet = getSolutionSet(selectedClues, candidateCache);

            // greedily add the clue that reduces the solution set the most
            while (solutionSet.length > 1 && availableClues.length > 0) {

                const best = findBestNextClue(availableClues, solutionSet, candidateCache);

                if (!best.clue) {
                    break;
                }

                selectedClues.push(best.clue);

                availableClues.splice(availableClues.indexOf(best.clue), 1);

                solutionSet = best.solutionSet;

            }

            // unique solution — break out of the loop and use this puzzle
            // if no solution or no more clues, pick new number and try again
            if (solutionSet.length === 1) {
                // console.log("unique solution found");
                break;
            }
            
            // console.log("no solution, pick new number");
        }

        // remove any clues that are not necessary by testing without them one by one
        let i = 0;

        while (i < selectedClues.length) {

            // don't remove the last clue
            if (selectedClues.length === 1) {
                break;
            }

            // test all clues except the current one
            const testClues = selectedClues.filter((_, index) => index !== i);

            // recalculate the solution set without this clue
            const testSolutionSet = getSolutionSet(testClues, candidateCache);

            // if we still have a unique solution then this clue is redundant
            if (testSolutionSet.length === 1) {
                selectedClues.splice(i, 1);
            } else {
                // this clue is necessary
                i++;
            }
        }

        submitGuessButton.style.display = "block";

        if (mode === "practice") {
            revealCodeButton.style.display = "block";
        }

        playAgainButton.style.display = "none";
        // messageDiv.textContent = `The number is ${digits.join("")}`;
        messageDiv.textContent = "";
        cluesDiv.innerHTML = "";

        // display clues on the screen
        creatingPuzzleMessage.style.display = "none";
        selectedClues.forEach(clue => {
            const clueElement = document.createElement("p");
            clueElement.innerHTML = clue.getText(clue.getValue(digits, digitNum), digitNum);
            cluesDiv.appendChild(clueElement);
        });
    }

    async function setupPage(mode, digitNum) {
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

            makePuzzle(mode, digitNum);
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
        logoutBtn.style.display = "block";
    }

    async function setupChallenge() {
        // reset the game state for challenge mode
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
        logoutBtn.style.display = "block";

        const challengeStart = Date.now();

        timerInterval = setInterval(() => {
            const challengeTime = (Date.now() - challengeStart) / 1000;
            messageDiv.textContent = challengeTime.toFixed(1) + " seconds";
        }, 100);    
        
        for (let i = 4; i <= 6; i++) {
            console.log('in challenge loop: ', mode);
            guessDiv.innerHTML = "";
            cluesDiv.innerHTML = "";
            creatingPuzzleMessage.style.display = "block";

            // give the browser time to display the loading message
            await new Promise(resolve => setTimeout(resolve, 50));

            await setupPage("challenge", i);
        }
        
        clearInterval(timerInterval);
        const challengeTime = ((Date.now() - challengeStart) / 1000).toFixed(1);
        messageDiv.innerHTML = "Challenge Complete!";
        messageDiv.innerHTML += `<br>Time: ${challengeTime} seconds`;
        
        resetButton.style.display = "block";   

    } 

    function howToPlay() {
        guessDiv.innerHTML = `
            <div class="gameChoice">
                <p>how to play:</p>
                <p>use the mathematical clues to deduce the correct number and crack the secret code</p>
                <p><strong>nerd heaven</strong> allows you to solve puzzles of either 4, 5 or 6 digits as much as you'd like</p>
                <p><strong>challenge mode</strong> is a timed challenge to solve one of each code length puzzle and compete against other nerds</p>
                <p>the use of a caclulator is discouraged - try to solve the puzzles in your head for extra nerdiness</p>
            </div>
        `;
        resetButton.style.display = "block";
        practiceButton.style.display = "none";
        challengeButton.style.display = "none";
        howToPlayButton.style.display = "none";
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

    // on 'login' button click
    loginBtn.addEventListener("click", async () => {
        const loginEmail = document.getElementById("loginEmail").value.trim();
        const loginPassword = document.getElementById("loginPassword").value.trim();
        
        loginError.textContent = "please wait...";

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
            console.error("Error during login:", err);
            loginError.textContent = "An error occurred. Please try again.";
        }
    });

    // on 'register' button click
    registerBtn.addEventListener("click", async () => {
        const registerUsername = document.getElementById("registerUsername").value.trim();
        const registerEmail = document.getElementById("registerEmail").value.trim();
        const registerPassword = document.getElementById("registerPassword").value.trim();

        loginError.textContent = "please wait...";

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
            console.error("Error during login:", err);
            loginError.textContent = "An error occurred. Please try again.";
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

        if (guess === solutionSet[0]) {
            await playCorrectSound();

            messageDiv.innerHTML = "Correct!<br>You've cracked it!";
            messageDiv.style.color = "#22cc44";

            submitGuessButton.style.display = "none";
            revealCodeButton.style.display = "none";

            // disable all up/down buttons
            digitButtons.forEach(button => {
                button.disabled = true;
            });

            // skip play again button if in challenge mode
            if (mode === "practice") {
                playAgainButton.style.display = "block";
            }

            // resolve the promise to continue in challenge mode
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
        // clear local storage and reset the page
        localStorage.removeItem("codeBreakerName");
        localStorage.removeItem("codeBreakerId");
        window.location.reload();
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
