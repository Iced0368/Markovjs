import { MarkovTransitions, MarkovTable } from "../src/markov";

const init = new Map([
    [{level: 0, remainingChance: 5}, 1],
])

const transitionMap: MarkovTable = []

for (let l = 0; l < 3; l++)
    for (let r = 1; r <= 5; r++) {
        transitionMap.push([[{level: l, remainingChance: r}, {level: l, remainingChance: r}], 0.1]);
        transitionMap.push([[{level: l, remainingChance: r}, {level: l, remainingChance: r-1}], 0.4]);
        transitionMap.push([[{level: l, remainingChance: r}, {level: l+1, remainingChance: r-1}], 0.5]);
    }

const markovTransitions = new MarkovTransitions(transitionMap)

const result = markovTransitions.transfer(init, 5);
console.log(result);