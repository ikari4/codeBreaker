// lib/puzzleGenerator.js

function getSolutionSet(clues, candidateCache) {
    // returns the commom solution set for the sent clues
    const clueSet = clues.map(clue =>
        candidateCache.get(clue.name)
    );

    if (clueSet.length === 0) {
        return [];
    }

    // start with the smallest set to minimize filtering
    const smallestSet = clueSet.reduce(
        (smallest, current) =>
            current.size < smallest.size ? current : smallest
    );

    return [...smallestSet].filter(number =>
        clueSet.every(set => set.has(number))
    );
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

export function generatePuzzle(clueLog, digitNum) {
    // generate a puzzle with a unique solution using the provided clues and digitNum
    if (![4, 5, 6].includes(digitNum)) {
        throw new Error("digitNum must be 4, 5, or 6");
    }

    if (!Array.isArray(clueLog) || clueLog.length === 0) {
        throw new Error("clueLog must be a non-empty array");
    }

    let digits = [];
    let selectedClues = [];
    let candidates = [];
    let candidateCache = [];
    let solutionSet = [];

    while (true) {
        // randomly select the digits for the puzzle
        digits = [];
        for (let i = 0; i < digitNum; i++) {
            const num = Math.floor( Math.random() * 10 );
            digits[i] = num;
        }

        // create array of candidates
        candidates = [];
        for (let i = 0; i < Math.pow(10, digitNum); i++) {
            let stringNum = i.toString().padStart(digitNum, '0');
            candidates.push(stringNum);
        }

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

        if (!firstClue) {
            throw new Error("Unable to select an opening clue");
        }

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
        if (solutionSet.length === 1) {
            break;
        }

        // if no solution or no more clues, pick new number and try again
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

    return {
        digits,
        solution: digits.join(""),
        selectedClues    
    }

}