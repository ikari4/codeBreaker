window.addEventListener("load", async() => {
    let solutionSet = [];

    function getSolutionSet(clues, digits) {
        const clueSet = clues.map(clue => clue.shortCand(digits));

        return clueSet[0].filter(number =>
            clueSet.every(array => array.includes(number))
        );
    }
    
    function newGame() {

        // randomly select the four digits for the puzzle
        let digits = [];
        for (let i = 0; i < 4; i++) {
            const num = Math.floor( Math.random() * 10 );
            digits[i] = num;
        }

        console.log(`The number is ${digits.join("")}`);

        // create array of candidates
        let candidates = [];
        for (let i = 0; i < 10000; i++) {
            stringNum = i.toString().padStart(4, '0');
            candidates.push(stringNum);
        }

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
            },

            shortText: digits =>
                cDigitProduct.getText(cDigitProduct.getValue(digits)),

            shortCand: digits =>
                cDigitProduct.remainingCandidates(cDigitProduct.getValue(digits))
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
            },

            shortText: digits =>
                cDigitSum.getText(cDigitSum.getValue(digits)),

            shortCand: digits =>
                cDigitSum.remainingCandidates(cDigitSum.getValue(digits))
        };

        // clue - sum of a and d in abcd
        const cADSum = {

            name: "cADSum",

            getValue: digits => {
                const sum = digits[0] + digits[3];
                return sum;
            },

            getText: value =>
                `My first and last<br>digits sum to ${value}`,

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
            },

            shortText: digits =>
                cADSum.getText(cADSum.getValue(digits)),

            shortCand: digits =>
                cADSum.remainingCandidates(cADSum.getValue(digits))
        };

        // clue - sum of b and d in abcd
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
            },

            shortText: digits =>
                cBDSum.getText(cBDSum.getValue(digits)),

            shortCand: digits =>
                cBDSum.remainingCandidates(cBDSum.getValue(digits))
        };

        // clue - product of a and c in abcd
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
            },

            shortText: digits =>
                cACProduct.getText(cACProduct.getValue(digits)),

            shortCand: digits =>
                cACProduct.remainingCandidates(cACProduct.getValue(digits))
        };

        // clue - product of c and d in abcd
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
            },

            shortText: digits =>
                cCDProduct.getText(cCDProduct.getValue(digits)),

            shortCand: digits =>
                cCDProduct.remainingCandidates(cCDProduct.getValue(digits))
        };

        // clue - is b greater than c in abcd
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
                    } else if (candidateDigits[1] < candidateDigits[2] && value === false) {
                        return true;
                    }
                    return false;});
                return candArray;
            },

            shortText: digits =>
                cBGreaterC.getText(cBGreaterC.getValue(digits)),

            shortCand: digits =>
                cBGreaterC.remainingCandidates(cBGreaterC.getValue(digits))
        };

        // clue - is a greater than b in abcd
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
                    } else if (candidateDigits[0] < candidateDigits[1] && value === false) {
                        return true;
                    }
                    return false;});
                return candArray;
            },

            shortText: digits =>
                cAGreaterB.getText(cAGreaterB.getValue(digits)),

            shortCand: digits =>
                cAGreaterB.remainingCandidates(cAGreaterB.getValue(digits))
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
                    const maxVal = Math.max(...candidateDigits);
                    const maxIndex = candidateDigits.indexOf(maxVal);
                    if (maxIndex === value) {
                        return true;
                    }
                    return false;});
                return candArray;
            },

            shortText: digits =>
                cMaxDigit.getText(cMaxDigit.getValue(digits)),

            shortCand: digits =>
                cMaxDigit.remainingCandidates(cMaxDigit.getValue(digits))
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
                    const minVal = Math.min(...candidateDigits);
                    const minIndex = candidateDigits.indexOf(minVal);
                    if (minIndex === value) {
                        return true;
                    }
                    return false;});
                return candArray;
            },

            shortText: digits =>
                cMinDigit.getText(cMinDigit.getValue(digits)),

            shortCand: digits =>
                cMinDigit.remainingCandidates(cMinDigit.getValue(digits))
        };

        // clue - is 7 a factor of the number
        const factorOf7 = {

            name: "factorOf7",

            getValue: digits => {
                let number = 0;
                for (let i = 0; i < 4; i++) {
                    partialSum = digits[i]*10**(3-i);
                    number += partialSum;
                }
                let result = false;
                if (number % 7 === 0) {
                    result = true;
                } 

            return result;
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
            },

            shortText: digits =>
                factorOf7.getText(factorOf7.getValue(digits)),

            shortCand: digits =>
                factorOf7.remainingCandidates(factorOf7.getValue(digits))
        };

        // clue - is 3 a factor of the number
        const factorOf3 = {

            name: "factorOf3",

            getValue: digits => {
                let number = 0;
                for (let i = 0; i < 4; i++) {
                    partialSum = digits[i]*10**(3-i);
                    number += partialSum;
                }
                let result = false;
                if (number % 3 === 0) {
                    result = true;
                } 

            return result;
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
            },

            shortText: digits =>
                factorOf3.getText(factorOf3.getValue(digits)),

            shortCand: digits =>
                factorOf3.remainingCandidates(factorOf3.getValue(digits))
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
            factorOf3
        ]

        // loop to find valid puzzle with unique solution set
        let availableClues = [...clueLog];
        // let solutionSet;
        let selectedClues = [];

        while (true) {
            // reset clues and solution set for each iteration
            availableClues = [...clueLog];
            selectedClues = [];

            // pick first two clues
            const clue1 = availableClues.splice(Math.floor(Math.random() * availableClues.length),1)[0];
            const clue2 = availableClues.splice(Math.floor(Math.random() * availableClues.length),1)[0];
            const clue3 = availableClues.splice(Math.floor(Math.random() * availableClues.length),1)[0];
            const clue4 = availableClues.splice(Math.floor(Math.random() * availableClues.length),1)[0];

            selectedClues.push(clue1, clue2, clue3, clue4);

            // get initial solution set
            solutionSet = getSolutionSet(selectedClues, digits);

            // no solution — try new clues
            if (solutionSet.length === 0) {
                continue;
            }

            // unique solution — we're done
            if (solutionSet.length === 1) {
                break;
            }

            // try to find a 5th clue that produces a unique solution
            while (solutionSet.length > 1 && availableClues.length > 0) {

                // pick a possible 5th clue
                const clue = availableClues.splice(Math.floor(Math.random() * availableClues.length),1)[0];

                // see what the solution set would be with this clue
                const clueCandidates = clue.shortCand(digits);

                const newSolutionSet = solutionSet.filter(number =>
                    clueCandidates.includes(number)
                );

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

// 
console.log(`The clues are: ${selectedClues.map(clue => clue.name).join(", ")}`);
// 
        // Remove any clues that are not necessary
        let i = 0;

        while (i < selectedClues.length) {

            // Don't remove the last clue
            if (selectedClues.length === 1) {
                break;
            }

            // Test all clues except the current one
            const testClues = selectedClues.filter((_, index) => index !== i);

            // Recalculate the solution set without this clue
            const testSolutionSet = getSolutionSet(testClues, digits);

            // If we still have a unique solution,
            // this clue is redundant
            if (testSolutionSet.length === 1) {
                selectedClues.splice(i, 1);
            } else {
                // This clue is necessary
                i++;
            }
        }
// 
console.log(`The final clues are: ${selectedClues.map(clue => clue.name).join(", ")}`);
// 
        // Recalculate the final solution set
        solutionSet = getSolutionSet(selectedClues, digits);

        digitInputs.forEach((input, index) => {

            digitInputs.forEach(input => input.disabled = false);
            input.addEventListener("input", () => {

                // Only allow digits
                input.value = input.value.replace(/\D/g, "");

                // Move to next box after entering a digit
                if (input.value && index < digitInputs.length - 1) {
                    digitInputs[index + 1].focus();
                }
            });

            input.addEventListener("keydown", (event) => {

                // Backspace on an empty box → move backwards
                if (
                    event.key === "Backspace" &&
                    input.value === "" &&
                    index > 0
                ) {
                    digitInputs[index - 1].focus();
                }

                // Optional: left/right arrow navigation
                if (event.key === "ArrowLeft" && index > 0) {
                    digitInputs[index - 1].focus();
                }

                if (
                    event.key === "ArrowRight" &&
                    index < digitInputs.length - 1
                ) {
                    digitInputs[index + 1].focus();
                }
            });
        });

        digitInputs.forEach(input => {
            input.value = "";
            input.style.display = "block";
        });

        submitGuess.style.display = "block";
        playAgainButton.style.display = "none";
        messageDiv.textContent = "";
        cluesDiv.innerHTML = "";

        digitInputs[0].focus();

        // clues
        
        selectedClues.forEach(clue => {
            const clueElement = document.createElement("p");
            clueElement.innerHTML = clue.shortText(digits);
            cluesDiv.appendChild(clueElement);
        });
    }
    
    // populate the page
    // four guess boxes and a submit button
    const page = document.getElementById("page");
    const digitInputs = document.querySelectorAll(".digitInput");
    const submitGuess = document.getElementById("submitGuess");
    const cluesDiv = document.getElementById("cluesDiv");
    const messageDiv = document.getElementById("messageDiv");
    const playAgainButton = document.getElementById("playAgainButton");

    newGame();

    submitGuess.addEventListener("click", () => {

        const guess = [...digitInputs]
            .map(input => input.value)
            .join("");

        if (guess.length !== 4) {
            return;
        }

        if (guess === solutionSet[0]) {
            messageDiv.innerHTML = "Correct!<br>You've cracked it!";
            messageDiv.style.color = "#22cc44";

            submitGuess.style.display = "none";
            digitInputs.forEach(input => input.disabled = true);
            playAgainButton.style.display = "block";

        } else {
            messageDiv.innerHTML = "Incorrect guess!<br>Try again!";
            messageDiv.style.color = "#ff4444";

            digitInputs.forEach(input => input.value = "");
            digitInputs[0].focus();
        }
    });

    playAgainButton.addEventListener("click", () => {
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