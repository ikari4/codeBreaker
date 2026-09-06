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

// clue - sum of first and last digits
const cFirstLastSum = {

    name: "cFirstLastSum",

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
        cFirstLastSum.getText(cFirstLastSum.getValue(digits)),

    shortCand: digits =>
        cFirstLastSum.remainingCandidates(cFirstLastSum.getValue(digits))
};

// clue - product of first and third digits
const cFirstThirdProduct = {

    name: "cFirstThirdProduct",
    
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
        cFirstThirdProduct.getText(cFirstThirdProduct.getValue(digits)),

    shortCand: digits =>
        cFirstThirdProduct.remainingCandidates(cFirstThirdProduct.getValue(digits))
};

// clue - is b greater than c in abcd
const cRelatMiddleLetters = {

    name: "cRelatMiddleLetters",

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
        cRelatMiddleLetters.getText(cRelatMiddleLetters.getValue(digits)),

    shortCand: digits =>
        cRelatMiddleLetters.remainingCandidates(cRelatMiddleLetters.getValue(digits))
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

// clue log
const clueLog = [
    cDigitProduct,
    cDigitSum,
    cFirstLastSum,
    cFirstThirdProduct,
    cRelatMiddleLetters,
    cMaxDigit
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

    selectedClues.push(clue1, clue2);

    // get candidate numbers for each clue
    const clueSet = [
        clue1.shortCand(digits),
        clue2.shortCand(digits)
    ];

    // find numbers common to both clues
    solutionSet = clueSet[0].filter(number =>
        clueSet.every(array => array.includes(number))
    );

    // no solution — try a different pair of clues
    if (solutionSet.length === 0) {
        console.log("no solution, restarting with new clues");
        continue;
    }

    // unique solution — we're done
    if (solutionSet.length === 1) {
        console.log("unique solution found!");
        break;
    }

    // multiple solutions — keep adding clues
    while (solutionSet.length > 1 && availableClues.length > 0) {
        console.log("multiple solutions, adding another clue");
        const clue = availableClues.splice(Math.floor(Math.random() * availableClues.length),1)[0];

        selectedClues.push(clue);

        // Narrow the existing solution set
        const clueCandidates = clue.shortCand(digits);

        solutionSet = solutionSet.filter(number =>
            clueCandidates.includes(number)
        );
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