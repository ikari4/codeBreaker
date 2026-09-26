window.addEventListener("load", async() => {
    let solutionSet = [];
    let audioCtx = null;
    const digitDisplays = [];
    const digitButtons = [];
    const digitValues = [];

    function getClueCandidates(clue, digits, candidateCache) {
        if (!candidateCache.has(clue.name)) {
            candidateCache.set(
                clue.name,
                new Set(clue.remainingCandidates(clue.getValue(digits)))
            );
        }

        return candidateCache.get(clue.name);
    }
    
    function getSolutionSet(clues, digits, candidateCache) {

        const clueSet = clues.map(clue =>
            getClueCandidates(clue, digits, candidateCache)
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

    function findSmallestClue(availableClues, digits, candidateCache) {

        let bestClue = null;
        let smallestSize = Infinity;

        availableClues.forEach(clue => {

            const clueCandidates =
                getClueCandidates(clue, digits, candidateCache);

            if (clueCandidates.size < smallestSize) {
                bestClue = clue;
                smallestSize = clueCandidates.size;
            }
        });

        return bestClue;
    }

    function findBestClue(availableClues, solutionSet, digits, candidateCache) {

        let bestClue = null;
        let bestSolutionSet = null;
        let smallestSize = Infinity;

        availableClues.forEach(clue => {

            const clueCandidates =
                getClueCandidates(clue, digits, candidateCache);

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

        digitValues.fill(0);

        digitDisplays.forEach(display => {
            display.textContent = "0";
        });

        digitButtons.forEach(button => {
            button.disabled = false;
        });

        // clue - product of the digits
        const cDigitProduct = {

            name: "cDigitProduct",

            getValue: digits =>
                digits.reduce((product, digit) => product * digit, 1),

            getText: value =>
                `The product of<br>my digits is ${value}`,

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    const candidateDigits = candidate.split('').map(Number);
                    const product = candidateDigits.reduce((product, digit) => product * digit, 1);
                    if (product === value) {
                        return true;
                    }
                    return false;});
                return candArray;
            }
        };

        // clue - sum of the digits
        const cDigitSum = {

            name: "cDigitSum",

            getValue: digits =>
                digits.reduce((sum, digit) => sum + digit, 0),

            getText: value =>
                `The sum of my<br>digits is ${value}`,

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    const candidateDigits = candidate.split('').map(Number);
                    const sum = candidateDigits.reduce((sum, digit) => sum + digit, 0);
                    if (sum === value) {
                        return true;
                    }
                    return false;});
                return candArray;
            }
        };

        // clue - sum of a and d in abcd or abcde
        const cADSum = {

            name: "cADSum",

            getValue: digits => {
                const sum = digits[0] + digits[3];
                return sum;
            },

            getText: value =>
                `My first and fourth<br>digits sum to ${value}`,

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    const candidateDigits = candidate.split('').map(Number);
                    const sum = candidateDigits[0] + candidateDigits[3];
                    if (sum === value) {
                        return true;
                    }
                    return false;
                });
                return candArray;
            }
        };

        // clue - sum of b and d in abcd or abcde
        const cBDSum = {

            name: "cBDSum",

            getValue: digits => {
                const sum = digits[1] + digits[3];
                return sum;
            },

            getText: value =>
                `My second and fourth<br>digits sum to ${value}`,

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    const candidateDigits = candidate.split('').map(Number);
                    const sum = candidateDigits[1] + candidateDigits[3];
                    if (sum === value) {
                        return true;
                    }
                    return false;
                });
                return candArray;
            }
        };

        // clue - product of a and c in abcd or abcde
        const cACProduct = {

            name: "cACProduct",
            
            getValue: digits => {
                const product = digits[0] * digits[2];
                return product;
            },

            getText: value =>
                `The product of my first<br>and third digits is ${value}`,

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    const candidateDigits = candidate.split('').map(Number);
                    if (candidateDigits[0] * candidateDigits[2] === value) {
                        return true;
                    }
                    return false;
                });
                return candArray;
            }
        };

        // clue - product of c and d in abcd or abcde
        const cCDProduct = {

            name: "cCDProduct",

            getValue: digits => {
                const product = digits[2] * digits[3];
                return product;
            },

            getText: value =>
                `The product of my third<br>and fourth digits is ${value}`,

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    const candidateDigits = candidate.split('').map(Number);
                    if (candidateDigits[2] * candidateDigits[3] === value) {
                        return true;
                    }
                    return false;
                });
                return candArray;
            }
        };

        // clue - product of first three digits in abcd or abcde
        const cFirstThreeProduct = {

            name: "cFirstThreeProduct",

            getValue: digits => {
                const product = digits[0] * digits[1] * digits[2];
                return product;
            },

            getText: value =>
                `The product of my first<br>three digits is ${value}`,

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    const candidateDigits = candidate.split('').map(Number);
                    if (candidateDigits[0] * candidateDigits[1] * candidateDigits[2] === value) {
                        return true;
                    }
                    return false;
                });
                return candArray;
            }
        };

        // clue - product of last three digits in abcd or abcde
        const cLastThreeProduct = {

            name: "cLastThreeProduct",

            getValue: digits => {
                const product = digits[digits.length - 3] * digits[digits.length - 2] * digits[digits.length - 1];
                return product;
            },

            getText: value =>
                `The product of my last<br>three digits is ${value}`,

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    const candidateDigits = candidate.split('').map(Number);
                    if (candidateDigits[digits.length - 3] * candidateDigits[digits.length - 2] * candidateDigits[digits.length - 1] === value) {
                        return true;
                    }
                    return false;
                });
                return candArray;
            }
        };

        // clue - is b greater than c in abcd or abcde
        const cBGreaterC = {

            name: "cBGreaterC",

            getValue: digits => {
                let result = false;
                if (digits[1] > digits[2]) {
                    result = true;
                } 

            return result;
            },

            getText: value => {
                if (value === true) {
                        return `My second digit is greater<br>than my third digit`;
                } else {
                        return `My second digit is not<br>greater than my third digit`
                }
            },

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    const candidateDigits = candidate.split('').map(Number);
                    if (candidateDigits[1] > candidateDigits[2] && value === true) {
                        return true;
                    } else if (candidateDigits[1] <= candidateDigits[2] && value === false) {
                        return true;
                    }
                    return false;});
                return candArray;
            }
        };

        // clue - is a greater than b in abcd or abcde
        const cAGreaterB = {

            name: "cAGreaterB",

            getValue: digits => {
                let result = false;
                if (digits[0] > digits[1]) {
                    result = true;
                } 

            return result;
            },

            getText: value => {
                if (value === true) {
                        return `My first digit is greater<br>than my second digit`;
                } else {
                        return `My first digit is not<br>greater than my second digit`
                }
            },

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    const candidateDigits = candidate.split('').map(Number);
                    if (candidateDigits[0] > candidateDigits[1] && value === true) {
                        return true;
                    } else if (candidateDigits[0] <= candidateDigits[1] && value === false) {
                        return true;
                    }
                    return false;});
                return candArray;
            }
        };

        // clue - max digit
        const cMaxDigit = {

            name: "cMaxDigit",

            getValue: digits => {
                const maxVal = Math.max(...digits);
                const maxIndex = digits.indexOf(maxVal);
                return maxIndex;
            },

            getText: value =>
                `None of my digits are<br>greater than digit ${value + 1}`,

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    const candidateDigits = candidate.split('').map(Number);

                    const referenceValue = candidateDigits[value];
                    const maxVal = Math.max(...candidateDigits);

                    return referenceValue === maxVal;
                });
                return candArray;
            }
        };

        // clue - min digit
        const cMinDigit = {

            name: "cMinDigit",

            getValue: digits => {
                const minVal = Math.min(...digits);
                const minIndex = digits.indexOf(minVal);
                return minIndex;
            },

            getText: value =>
                `None of my digits are<br>less than digit ${value + 1}`,

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    const candidateDigits = candidate.split('').map(Number);

                    const referenceValue = candidateDigits[value];
                    const minVal = Math.min(...candidateDigits);

                    return referenceValue === minVal;
                });
                return candArray;
            }
        };

        // clue - is 7 a factor of the number
        const factorOf7 = {

            name: "factorOf7",

            getValue: digits => {
                const number = Number(digits.join(""));
                return number % 7 === 0;
            },

            getText: value => {
                if (value === true) {
                        return `I am a multiple of 7`;
                } else {
                        return `I am not a multiple of 7`
                }
            },

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    if (candidate % 7 === 0 && value === true) {
                        return true;
                    } else if (candidate % 7 !== 0 && value === false) {
                        return true;
                    }
                    return false;});
                return candArray;
            }
        };

        // clue - is 3 a factor of the number
        const factorOf3 = {

            name: "factorOf3",

            getValue: digits => {
                const number = Number(digits.join(""));
                return number % 3 === 0;
            },

            getText: value => {
                if (value === true) {
                        return `I am a multiple of 3`;
                } else {
                        return `I am not a multiple of 3`
                }
            },

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    if (candidate % 3 === 0 && value === true) {
                        return true;
                    } else if (candidate % 3 !== 0 && value === false) {
                        return true;
                    }
                    return false;});
                return candArray;
            }
        };

        // clue - is last digit even
        const cLastEven = {

            name: "cLastEven",

            getValue: digits => {
                let result = false;
                if (digits[digitNum - 1] % 2 === 0) {
                    result = true;
                } 

            return result;
            },

            getText: value => {
                if (value === true) {
                        return `My last digit is even`;
                } else {
                        return `My last digit is odd`;
                }
            },

            remainingCandidates: value => {
                const candArray = candidates.filter(candidate => {
                    if (candidate[digitNum - 1] % 2 === 0 && value === true) {
                        return true;
                    } else if (candidate[digitNum - 1] % 2 === 1 && value === false) {
                        return true;
                    }
                    return false;});
                return candArray;
            }
        };

        // clue log
        const clueLog = [
            cDigitProduct,
            cDigitSum,
            cADSum,
            cBDSum,
            cACProduct,
            cCDProduct,
            cBGreaterC,
            cAGreaterB,
            cMaxDigit,
            cMinDigit,
            factorOf7,
            factorOf3,
            cLastEven,
            cFirstThreeProduct,
            cLastThreeProduct
        ]

        // loop to find valid puzzle with unique solution set

        let selectedClues = [];
                
        while (true) {

            // reset clues and solution set for each iteration
            let availableClues = [...clueLog];
            selectedClues = [];
            let candidateCache = new Map();

            // pick the clue that produces the smallest candidate set
            const firstClue = findSmallestClue(
                availableClues,
                digits,
                candidateCache
            );

            availableClues.splice(availableClues.indexOf(firstClue), 1);

            selectedClues.push(firstClue);

            solutionSet = getSolutionSet(
                selectedClues,
                digits,
                candidateCache
            );

            // greedily add the clue that reduces the solution set the most
            while (solutionSet.length > 1 && availableClues.length > 0) {

                const best = findBestClue(
                    availableClues,
                    solutionSet,
                    digits,
                    candidateCache
                );

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

            // try to find an extra clue that produces a unique solution

            while (solutionSet.length > 1 && availableClues.length > 0) {

                // pick a possible extra clue
                const clue = availableClues.splice(Math.floor(Math.random() * availableClues.length),1)[0];
                const trialClueSet = [...selectedClues, clue];

                // see what the solution set would be with this clue
                const newSolutionSet = getSolutionSet(trialClueSet, digits, candidateCache);

                // this clue produces a unique solution — accept it
                if (newSolutionSet.length === 1) {
                    solutionSet = newSolutionSet;
                    selectedClues.push(clue);
                    break;
                }

                // This clue didn't work.
                // It's already been removed from availableClues,
                // so simply let the loop try another one.
            }

            // if we didn't get exactly one solution, restart
            if (solutionSet.length !== 1) {
                continue;
            }

            // if exactly one solution, we're done
            // if zero or still multiple, restart with new clues
            if (solutionSet.length === 1) {
                break;
            }
        }

        // remove any clues that are not necessary by testing without them one by one
        let candidateCache = new Map();

        let i = 0;

        while (i < selectedClues.length) {

            // don't remove the last clue
            if (selectedClues.length === 1) {
                break;
            }

            // test all clues except the current one
            const testClues = selectedClues.filter((_, index) => index !== i);

            // recalculate the solution set without this clue
            const testSolutionSet = getSolutionSet(
                testClues,
                digits,
                candidateCache
            );

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
        messageDiv.textContent = `The number is ${digits.join("")}`;
        // messageDiv.textContent = "";
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

    // populate the page
    const page = document.getElementById("page");
    const guessDiv = document.getElementById("guessDiv");
    let digitNum;
    
    // user choice of four or five digit game
    guessDiv.innerHTML = `
        <div class="gameChoice">
            <p>Choose your game:</p>
            <button id="fourDigitButton">4 Digits</button>
            <button id="fiveDigitButton">5 Digits</button>
        </div>
    `;

    document.getElementById("fourDigitButton").addEventListener("click", () => {
        digitNum = 4;
        startGame();
    });

    document.getElementById("fiveDigitButton").addEventListener("click", () => {
        digitNum = 5;
        startGame();
    });
    
    const cluesDiv = document.getElementById("cluesDiv");
    const messageDiv = document.getElementById("messageDiv");
    const playAgainButton = document.getElementById("playAgainButton");

    playAgainButton.addEventListener("click", async () => {

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

        submitGuess.style.display = "block";
        playAgainButton.style.display = "none";

        // Give the browser time to display the loading message
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