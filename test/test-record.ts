import { MarkovTransitions } from "../src/markov";

const init = {"initState" : 1};

const markovTransitions = new MarkovTransitions(
    [
        [["initState", "level-0"], 1.0],
        [["level-0", "level-0"], 0.5], [["level-0", "level-1"], 0.4], [["level-0", "level-2"], 0.1],
        [["level-1", "level-1"], 0.6], [["level-1", "level-2"], 0.3], [["level-1", "level-3"], 0.1],
        [["level-2", "level-2"], 0.7], [["level-2", "level-3"], 0.3],
        [["level-3", "level-3"], 1.0],
    ]
)

const result = markovTransitions.transfer(init, 5);
console.log(result);