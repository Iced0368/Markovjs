# Brief explanation

markovjs is a library for representing the state of a Markov transition as a number, string, or complex object.

There is a dependence on mathjs.

### Test code
```typescript
const init = {"initState" : 1};

// [[from, to], probability]
const markovTransitions = new MarkovTransitions(
    [
        [["initState", "level-0"], 1.0],
        [["level-0", "level-0"], 0.5], [["level-0", "level-1"], 0.4], [["level-0", "level-2"], 0.1],
        [["level-1", "level-1"], 0.6], [["level-1", "level-2"], 0.3], [["level-1", "level-3"], 0.1],
        [["level-2", "level-2"], 0.7], [["level-2", "level-3"], 0.3],
    ]
)

const result = markovTransitions.transfer(init, 5);
console.log(result);
```

### Result
```
{
  '"level-0"': 0.0625,
  '"level-1"': 0.26839999999999997,
  '"level-2"': 0.34919999999999995,
  '"level-3"': 0.1339
}
```
