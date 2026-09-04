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

// clue - product of the digits
const digitProductClue = {
    type: "digitProduct",
    category: "digits",

    getValue: digits =>
        digits.reduce((product, digit) => product * digit, 1),

    getText: value =>
        `The product of my digits is ${value}.`
};

// clue - sum of the digits
const digitSumClue = {
    type: "digitSum",
    category: "digits",

    getValue: digits =>
        digits.reduce((sum, digit) => sum + digit, 0),

    getText: value =>
        `The sum of my digits is ${value}.`
};

// clue - sum of first two and last two digits as numbers
const relatFirstTwoLastTwoSumClue = {
    type: "digitSum",
    category: "relationship",

    getValue: digits => {
        const sum = digits[0] + digits[3];
        return sum;
    },

    getText: value =>
        `My first and last digits sum to ${value}.`
};

// clue - random factors < 50
const factorClue = {
    type: "factor",
    category: "factor",

    getValue: digits => {
        let number = 0;
        for (let i = 0; i < 4; i++) {
            partialSum = digits[i]*10**(3-i);
            number += partialSum;
        }
        const factors = [];
        const sqrt = Math.sqrt(number);

        for (let i = 1; i <= sqrt; i++) {
            if (number % i === 0) {
            factors.push(i);

            // if the paired factor is different, add it too
            if (i !== number / i) {
                factors.push(number / i);
            }
            }
        }
        factors.sort((a, b) => a - b);
        const lessThanFifty = factors.filter(num => num < 10);

        // ensure the array has at least 3 elements to exclude first and last safely
        let randomFactor = 0;
        if (lessThanFifty.length >= 2) {
            const maxIndex = lessThanFifty.length - 1;
            const randomIndex = Math.floor(Math.random() * (maxIndex)) + 1;
            randomFactor = lessThanFifty[randomIndex];

        }
        return randomFactor;
    },

    getText: value => {
        if (value != 0) {
            return `One of my factors is ${value}.`
        } else {
            return `I have no factors less than 10.`
        }
    }
};

// clue - is b greater than c in abcd
const relatMiddleLetters = {
    type: "digits",
    category: "relationship",

    getValue: digits => {
        let result = false;
        if (digits[1] > digits[2]) {
            result = true;
        } else if (digits[1] == digits[2]) {
            result = 'equal';
        }
      return result;
    },

    getText: value => {
        if (value === 'equal') {
                return `My second and third digits are equal.`;
        } else if (value === true) {
                return `My second digit is greater than my third digit.`
        } else {
                return `My second digit is less than my third digit.`
        }
    }
};

// clue - max digit
const maxDigit = {
    type: "digits",
    category: "relationship",

    getValue: digits => {
        const maxVal = Math.max(...digits);
        const maxIndex = digits.indexOf(maxVal);
        return maxIndex;
    },

    getText: value =>
        `None of my digits are greater than the one in position ${value + 1}.`
};

console.log("digits: ", digits);
console.log("the number is: ", number);
console.log(digitProductClue.getText(digitProductClue.getValue(digits)));
console.log(digitSumClue.getText(digitSumClue.getValue(digits)));
console.log(relatFirstTwoLastTwoSumClue.getText(relatFirstTwoLastTwoSumClue.getValue(digits)));
console.log(factorClue.getText(factorClue.getValue(digits)));
console.log(relatMiddleLetters.getText(relatMiddleLetters.getValue(digits)));
console.log(maxDigit.getText(maxDigit.getValue(digits)));