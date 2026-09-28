// clue - product of the digits
const cDigitProduct = {

    name: "cDigitProduct",

    getValue: (digits, digitNum) =>
        digits.reduce((product, digit) => product * digit, 1),

    getText: value =>
        `The product of<br>my digits is ${value}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

    getValue: (digits, digitNum) =>
        digits.reduce((sum, digit) => sum + digit, 0),

    getText: value =>
        `The sum of my<br>digits is ${value}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

// clue - sum of a and d in abcd(ef)
const cADSum = {

    name: "cADSum",

    getValue: (digits, digitNum) => {
        const sum = digits[0] + digits[3];
        return sum;
    },

    getText: value =>
        `My first and fourth<br>digits sum to ${value}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

// clue - sum of b and d in abcd(ef)
const cBDSum = {

    name: "cBDSum",

    getValue: (digits, digitNum) => {
        const sum = digits[1] + digits[3];
        return sum;
    },

    getText: value =>
        `My second and fourth<br>digits sum to ${value}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

// clue - product of a and c in abcd(ef)
const cACProduct = {

    name: "cACProduct",
    
    getValue: (digits, digitNum) => {
        const product = digits[0] * digits[2];
        return product;
    },

    getText: value =>
        `The product of my first<br>and third digits is ${value}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

// clue - product of c and d in abcd(ef)
const cCDProduct = {

    name: "cCDProduct",

    getValue: (digits, digitNum) => {
        const product = digits[2] * digits[3];
        return product;
    },

    getText: value =>
        `The product of my third<br>and fourth digits is ${value}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

// clue - product of first three digits in abcd(ef)
const cFirstThreeProduct = {

    name: "cFirstThreeProduct",

    getValue: (digits, digitNum) => {
        const product = digits[0] * digits[1] * digits[2];
        return product;
    },

    getText: value =>
        `The product of my first<br>three digits is ${value}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

// clue - product of last three digits in abcd(ef)
const cFirstThreeSum = {

    name: "cFirstThreeSum",

    getValue: (digits, digitNum) => {
        const sum = digits[0] + digits[1] + digits[2];
        return sum;
    },

    getText: value =>
        `The sum of my first<br>three digits is ${value}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
        const candArray = candidates.filter(candidate => {
            const candidateDigits = candidate.split('').map(Number);
            if (candidateDigits[0] + candidateDigits[1] + candidateDigits[2] === value) {
                return true;
            }
            return false;
        });
        return candArray;
    }
};

// clue - product of last three digits in abcd(ef)
const cLastThreeProduct = {

    name: "cLastThreeProduct",

    getValue: (digits, digitNum) => {
        const product = digits[digits.length - 3] * digits[digits.length - 2] * digits[digits.length - 1];
        return product;
    },

    getText: value =>
        `The product of my last<br>three digits is ${value}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

// clue - product of last three digits in abcd(ef)
const cLastThreeSum = {

    name: "cLastThreeSum",

    getValue: (digits, digitNum) => {
        const sum = digits[digits.length - 3] + digits[digits.length - 2] + digits[digits.length - 1];
        return sum;
    },

    getText: value =>
        `The sum of my last<br>three digits is ${value}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
        const candArray = candidates.filter(candidate => {
            const candidateDigits = candidate.split('').map(Number);
            if (candidateDigits[digits.length - 3] + candidateDigits[digits.length - 2] + candidateDigits[digits.length - 1] === value) {
                return true;
            }
            return false;
        });
        return candArray;
    }
};

// clue - is b greater than c in abcd(ef)
const cBGreaterC = {

    name: "cBGreaterC",

    getValue: (digits, digitNum) => {
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

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

// clue - is a greater than b in abcd(ef)
const cAGreaterB = {

    name: "cAGreaterB",

    getValue: (digits, digitNum) => {
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

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

    getValue: (digits, digitNum) => {
        const maxVal = Math.max(...digits);
        const maxIndex = digits.indexOf(maxVal);
        return maxIndex;
    },

    getText: value =>
        `None of my digits are<br>greater than digit ${value + 1}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

    getValue: (digits, digitNum) => {
        const minVal = Math.min(...digits);
        const minIndex = digits.indexOf(minVal);
        return minIndex;
    },

    getText: value =>
        `None of my digits are<br>less than digit ${value + 1}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

    getValue: (digits, digitNum) => {
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

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

    getValue: (digits, digitNum) => {
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

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

    getValue: (digits, digitNum) => {
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

    remainingCandidates: (value, candidates, digitNum, digits) => {
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

// clue - is first digit even
const cFirstEven = {

    name: "cFirstEven",

    getValue: (digits, digitNum) => {
        let result = false;
        if (digits[0] % 2 === 0) {
            result = true;
        } 

    return result;
    },

    getText: value => {
        if (value === true) {
                return `My first digit is even`;
        } else {
                return `My first digit is odd`;
        }
    },

    remainingCandidates: (value, candidates, digitNum, digits) => {
        const candArray = candidates.filter(candidate => {
            if (candidate[0] % 2 === 0 && value === true) {
                return true;
            } else if (candidate[0] % 2 === 1 && value === false) {
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
    cFirstEven,
    cFirstThreeProduct,
    cLastThreeProduct,
    cLastThreeSum,
    cFirstThreeSum
]