// clue - product of the digits
const cDigitProduct = {

    name: "cDigitProduct",

    getValue: (digits, digitNum) =>
        digits.reduce((product, digit) => product * digit, 1),

    getText: value =>
        `The product of<br>my digits is ${value}`,

    remainingCandidates: (value, candidates, digitNum, digits) => {
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            const product = digs.reduce((product, digit) => product * digit, 1);
            if (product === value) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            const sum = digs.reduce((sum, digit) => sum + digit, 0);
            if (sum === value) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            if (digs[0] + digs[3] === value) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            if (digs[1] + digs[3] === value) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            if (digs[0] * digs[2] === value) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            if (digs[2] * digs[3] === value) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            if (digs[0] * digs[1] * digs[2] === value) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            if (digs[0] + digs[1] + digs[2] === value) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            if (digs[digs.length - 3] * digs[digs.length - 2] * digs[digs.length - 1] === value) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            if (digs[digs.length - 3] + digs[digs.length - 2] + digs[digs.length - 1] === value) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            if (digs[1] > digs[2] && value === true) {
                candSet.add(candidate);
            } else if (digs[1] <= digs[2] && value === false) {
                candSet.add(candidate);
            }
        });
        return candSet;
    }
};

// clue - is last greater than next-to-last in abcd(ef)
const cLGreaterN = {

    name: "cLGreaterN",

    getValue: (digits, digitNum) => {
        let result = false;
        if (digits[digits.length - 1] > digits[digits.length - 2]) {
            result = true;
        } 

    return result;
    },

    getText: value => {
        if (value === true) {
                return `My last digit is greater<br>than its adjacent digit`;
        } else {
                return `My last digit is not greater<br>than its adjacent digit`
        }
    },

    remainingCandidates: (value, candidates, digitNum, digits) => {
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            if (digs[digs.length - 1] > digs[digs.length - 2] && value === true) {
                candSet.add(candidate);
            } else if (digs[digs.length - 1] <= digs[digs.length - 2] && value === false) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            if (digs[0] > digs[1] && value === true) {
                candSet.add(candidate);
            } else if (digs[0] <= digs[1] && value === false) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            const referenceValue = digs[value];
            const maxVal = Math.max(...digs);

            if (referenceValue === maxVal) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        
        const candSet = new Set();
        candidates.forEach(candidate => {
            const digs = [...candidate].map(Number);
            const referenceValue = digs[value];
            const minVal = Math.min(...digs);

            if (referenceValue === minVal) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {        
            if (candidate % 7 === 0 && value === true) {
                candSet.add(candidate);
            } else if (candidate % 7 !== 0 && value === false) {
                candSet.add(candidate);
            }
        });
        return candSet;
    }
};

// clue - is 5 a factor of the number
const factorOf5 = {

    name: "factorOf5",

    getValue: (digits, digitNum) => {
        const number = Number(digits.join(""));
        return number % 5 === 0;
    },

    getText: value => {
        if (value === true) {
                return `I am a multiple of 5`;
        } else {
                return `I am not a multiple of 5`
        }
    },

    remainingCandidates: (value, candidates, digitNum, digits) => {
        const candSet = new Set();
        candidates.forEach(candidate => {
            if (candidate % 5 === 0 && value === true) {
                candSet.add(candidate);
            } else if (candidate % 5 !== 0 && value === false) {
                candSet.add(candidate);
            }
        });
        return candSet;
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
        const candSet = new Set();
        candidates.forEach(candidate => {
            if (candidate % 3 === 0 && value === true) {
                candSet.add(candidate);
            } else if (candidate % 3 !== 0 && value === false) {
                candSet.add(candidate);
            }
        });
        return candSet;
    }
};

const cMiddleProduct = {

  name: "cMiddleProduct",

  getValue: (digits, digitNum) => {
    let product = 1;
    // produces product of middle three digits of odd digitNums or middle two of even
    for (let i = Math.trunc((digitNum - 2) / 2); i <= Math.trunc((digitNum + 1) / 2); i++) {
      product *= digits[i];
    }
      return product;
  },

  getText: (value, digitNum) => {
    if (digitNum % 2 === 0) {
      return `The product of my middle<br>two digits is ${value}`
    } else {
      return `The product of my middle<br>three digits is ${value}`
    }

  },

  remainingCandidates: (value, candidates, digitNum, digits) => {
    const candSet = new Set();
    candidates.forEach(candidate => {

        let product = 1;
        const digs = [...candidate].map(Number);
        // produces product of middle three digits of odd digitNums or middle two of even
        for (let i = Math.trunc((digitNum - 2) / 2); 
                i <= Math.trunc((digitNum + 1) / 2); 
                i++) {
            product *= digs[i];
        }

        if (product === value) {
            candSet.add(candidate);
        }
      
    });

    return candSet;
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
    cLGreaterN,
    cAGreaterB,
    cMaxDigit,
    cMinDigit,
    factorOf7,
    factorOf5,
    factorOf3,
    cFirstThreeProduct,
    cLastThreeProduct,
    cLastThreeSum,
    cFirstThreeSum,
    cMiddleProduct
];