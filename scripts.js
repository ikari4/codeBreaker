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

    function newGame() {
        // randomly select the digits for the puzzle
        let digits = [];
        for (let i = 0; i < digitNum; i++) {
            const num = Math.floor( Math.random() * 10 );
            digits[i] = num;
        }
        //
        console.log(`The number is ${digits.join("")}`);
        //
        // create array of candidates
        let candidates = [];
        for (let i = 0; i < Math.pow(10, digitNum); i++) {
            stringNum = i.toString().padStart(digitNum, '0');
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
        let selectedClues = [];

        // create cache of solution sets for all clues given puzzle digits
        let candidateCache = new Map();
        clueLog.forEach (clue => {
            candidateCache.set(clue.name, new Set(clue.remainingCandidates(
                clue.getValue(digits, digitNum), 
                candidates, 
                digitNum,
                digits)));
        });
                
        while (true) {
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

            // no solution — try new clues
            if (solutionSet.length === 0) {
                continue;
            }

            // unique solution — we're done
            if (solutionSet.length === 1) {
                break;
            }
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

        submitGuess.style.display = "block";
        playAgainButton.style.display = "none";
        // messageDiv.textContent = `The number is ${digits.join("")}`;
        messageDiv.textContent = "";
        cluesDiv.innerHTML = "";

        // display clues on the screen
        selectedClues.forEach(clue => {
            const clueElement = document.createElement("p");
            clueElement.innerHTML = clue.getText(clue.getValue(digits));
            cluesDiv.appendChild(clueElement);
        });
    }

    function startGame() {
        guessDiv.innerHTML = "";

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

        const buttonDiv = document.getElementById("buttonDiv");
        const submitGuess = document.createElement("button");
        submitGuess.id = "submitGuess";
        submitGuess.textContent = "SUBMIT";

        submitGuess.addEventListener("click", async () => {

            const guess = digitValues.join("");

            if (guess === solutionSet[0]) {
                await playCorrectSound();

                messageDiv.innerHTML = "Correct!<br>You've cracked it!";
                messageDiv.style.color = "#22cc44";

                submitGuess.style.display = "none";

                // disable all up/down buttons
                digitButtons.forEach(button => {
                    button.disabled = true;
                });

                playAgainButton.style.display = "block";

            } else {
                await playIncorrectSound();

                messageDiv.innerHTML = "Incorrect guess!<br>Try again!";
                messageDiv.style.color = "#ff4444";
            }
        });

        buttonDiv.appendChild(submitGuess);

        newGame();
    }

    // main script starts here
    // populate the page
    const page = document.getElementById("page");
    const guessDiv = document.getElementById("guessDiv");
    let digitNum;
    
    // user choice of four or five or six digit game
    guessDiv.innerHTML = `
        <div class="gameChoice">
            <p>Choose code length to break</p>
            <button id="fourDigitButton">4 Digits</button>
            <button id="fiveDigitButton">5 Digits</button>
            <button id="sixDigitButton">6 Digits</button>
            <button id="sevenDigitButton">7 Digits</button>
        </div>
    `;
            // button html literal code to be insterted above for 6 and 7 digit puzzles
            // <button id="sixDigitButton">6 Digits</button>
            // <button id="sevenDigitButton">7 Digits</button>

    document.getElementById("fourDigitButton").addEventListener("click", () => {
        digitNum = 4;
        startGame();
    });

    document.getElementById("fiveDigitButton").addEventListener("click", () => {
        digitNum = 5;
        startGame();
    });

    // EventListeners for 6 and 7 digit puzzles
    document.getElementById("sixDigitButton").addEventListener("click", () => {
        digitNum = 6;
        startGame();
    });
    
    document.getElementById("sevenDigitButton").addEventListener("click", () => {
        digitNum = 7;
        startGame();
    });

    const cluesDiv = document.getElementById("cluesDiv");
    const messageDiv = document.getElementById("messageDiv");
    const playAgainButton = document.getElementById("playAgainButton");

    playAgainButton.addEventListener("click", async () => {
        await playAgainSound();
        cluesDiv.innerHTML = `
            <div class="creatingPuzzle">
                Creating new puzzle<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
            </div>
        `;

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

        newGame();
    });

    // splash screen fadeaway
    setTimeout(() => {
        const splash = document.getElementById("splash");
        splash.style.opacity = "0";

        setTimeout(() => {
            splash.style.display = "none";
            page.style.display = "block";
        }, 500);
    }, 3000);

});