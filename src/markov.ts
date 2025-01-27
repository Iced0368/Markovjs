import * as mathjs from "mathjs"

export type MarkovMatrix = mathjs.Matrix;
export type MarkovState = string | number;
export type MarkovComplexState = MarkovState | Object;
export type MarkovTable = [[MarkovComplexState, MarkovComplexState], number][];

function matPow(mat: MarkovMatrix, n: number, format?: "dense" | "sparse") {
    let result = mathjs.identity(mat.size(), format ?? "dense");

    while (n) {
        if (n & 1) result = mathjs.multiply(result, mat);
        mat = mathjs.multiply(mat, mat);
        n >>= 1;
    }

    return result;
}

export class MarkovTransitions {
    states: string[];
    stateIndex: Map<string, number>
    transitions: Map<[string, string], number>

    /**
     * 
     * @param table array of [[from, to], prob]
     */
    constructor(table?: MarkovTable) {
        this.states = [];
        this.stateIndex = new Map();
        this.transitions = new Map();

        table && table.forEach(el => {
            const [key, prob] = el;
            const [from, to] = key;
            this.setTransition(from, to, prob);
        });
    }

    /**
     * Add new transition.
     * @param from source state
     * @param to  destination state
     * @param prob  transition probability
     */
    setTransition<T extends MarkovComplexState>(from: T, to: T, prob: number) {
        let sFrom = JSON.stringify(from);
        let sTo = JSON.stringify(to);

        for (let state of [sFrom, sTo])
            if (!this.stateIndex.has(state)) {
                this.stateIndex.set(state, this.states.length);
                this.states.push(state);
            }

        this.transitions.set([sFrom, sTo], prob);
    }

    /**
     * Get matrix form of transitions.
     * @param format 
     * @returns 
     */
    getMatrix(format?: "dense" | "sparse") {
        const n = this.states.length;
        const mat = Array.from({ length: n }, () => Array(n).fill(0));

        for (let [[from, to], prob] of this.transitions)
            mat[this.stateIndex.get(from)!][this.stateIndex.get(to)!] = Number(prob);

        return mathjs.matrix(mat, format ?? "dense", "number");
    }

    /**
     * Vectorize state record.
     * @param record
     * @returns 
     */
    encode(record: Record<MarkovState, number> | Map<MarkovComplexState, number>) {
        const vector = Array(this.states.length).fill(0);

        if (vector instanceof Map) {
            for (let [key, value] of vector)
                vector[this.stateIndex.get(JSON.stringify(key))!] = value;
        }
        else {
            for (let [key, value] of Object.entries(record))
                vector[this.stateIndex.get(JSON.stringify(key))!] = value;
        }

        return vector;
    }

    /**
     * Interpret column vector and convert it to record.
     * @param columnVector 
     * @returns 
     */
    decode(columnVector: MarkovMatrix) {
        const result: Record<string, number> = {};
        for (let i = 0; i < this.states.length; i++)
            if (columnVector.get([i]))
                result[this.states[i] as MarkovState] = columnVector.get([i]);
        
        return result;
    }

    /**
     * Returns the result after n transitions occurred in the initial state.
     * @param init initial state
     * @param n transition count
     * @param format 
     * @returns 
     */
    transfer(init: Record<MarkovState, number> | Map<MarkovComplexState, number>, n: number, format?: "dense" | "sparse") {
        const initVector = this.encode(init);
        const transferred = mathjs.multiply(mathjs.matrix(initVector), matPow(this.getMatrix(format ?? "dense"), n));
        return this.decode(transferred);
    }
}