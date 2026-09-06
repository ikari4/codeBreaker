window.addEventListener("load", async() => {
    
    const titleDiv = document.getElementById("titleDiv");
    const page = document.getElementById("page");
    titleDiv.textContent = "codeBreaker"; 

    // randomly select the four digits for the puzzle
    let digits = [];
    for (let i = 0; i < 4; i++) {
        const num = Math.floor( Math.random() * 10 );
        digits[i] = num;
    }

    // create complete number and matching string from digits
    let number = 0;
    for (let i = 0; i < 4; i++) {
        partialSum = digits[i]*10**(3-i);
        number += partialSum;
    }

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
            `The product of my digits is ${value}.`,

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
            `The sum of my digits is ${value}.`,

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
            `My first and last digits sum to ${value}.`,

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
            `My second and fourth digits sum to ${value}.`,

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
            `The product of my first and third digits is ${value}.`,

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
            `The product of my third and fourth digits is ${value}.`,

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
                    return `My second digit is greater than my third digit.`;
            } else {
                    return `My second digit is not greater than my third digit.`
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
                    return `My first digit is greater than my second digit.`;
            } else {
                    return `My first digit is not greater than my second digit.`
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
            `None of my digits are greater than the one in position ${value + 1}.`,

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
            `None of my digits are less than the one in position ${value + 1}.`,

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
        cMinDigit
    ]

    console.log("digits: ", digits);
    console.log("the number is: ", number);

    // loop to find valid puzzle with unique solution set
    let availableClues = [...clueLog];
    let solutionSet;
    let selectedClues = [];

    while (true) {
    console.log("started while loop");
        // reset clues and solution set for each iteration
        availableClues = [...clueLog];
        selectedClues = [];

        // pick first two clues
        const clue1 = availableClues.splice(Math.floor(Math.random() * availableClues.length),1)[0];
        const clue2 = availableClues.splice(Math.floor(Math.random() * availableClues.length),1)[0];
        const clue3 = availableClues.splice(Math.floor(Math.random() * availableClues.length),1)[0];
        const clue4 = availableClues.splice(Math.floor(Math.random() * availableClues.length),1)[0];

        selectedClues.push(clue1, clue2, clue3, clue4);

        // get candidate numbers for each clue
        const clueSet = [
            clue1.shortCand(digits),
            clue2.shortCand(digits),
            clue3.shortCand(digits),
            clue4.shortCand(digits)
        ];

        // find numbers common to both clues
        solutionSet = clueSet[0].filter(number =>
            clueSet.every(array => array.includes(number))
        );

        // no solution — try new clues
        if (solutionSet.length === 0) {
            console.log("no solution, restarting with new clues");
            continue;
        }

        // unique solution — we're done
        if (solutionSet.length === 1) {
            console.log("unique solution found!");
            break;
        }

        // try to find a 5th clue that produces a unique solution
        while (solutionSet.length > 1 && availableClues.length > 0) {

            console.log("multiple solutions, looking for a 5th clue");

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
            console.log("this 5th clue didn't work, trying another");
        }

        // if we didn't get exactly one solution, restart
        if (solutionSet.length !== 1) {
            continue;
        }

        // if exactly one solution, we're done
        // if zero or still multiple, restart with new clues
        if (solutionSet.length === 1) {
            console.log("unique solution found!");
            break;
        }
    }

    console.log("selected clues: ", selectedClues.map(clue => clue.name));
    console.log("selected clues: ", selectedClues.map(clue => clue.shortText(digits)));

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