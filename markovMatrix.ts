import * as mathjs from "mathjs"

export type MarkovState = string | number;
export type MarkovComplexState = MarkovState | Object;

function matPow(mat: mathjs.Matrix, n: number, format?: "dense" | "sparse") {
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

    constructor(table?: Map<[MarkovComplexState, MarkovComplexState], number>) {
        this.states = [];
        this.stateIndex = new Map();
        this.transitions = new Map();

        table && table.forEach((prob, key) => {
            const [from, to] = key;
            this.setTransition(from, to, prob);
        });
    }

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

    getMatrix(format?: "dense" | "sparse") {
        const n = this.states.length;
        const mat = Array.from({ length: n }, () => Array(n).fill(0));

        for (let [[from, to], prob] of this.transitions)
            mat[this.stateIndex.get(from)!][this.stateIndex.get(to)!] = Number(prob);

        return mathjs.matrix(mat, format ?? "dense", "number");
    }

    transfer(init: Record<MarkovState, number> | Map<MarkovComplexState, number>, n: number, format?: "dense" | "sparse") {
        const initVector = Array(this.states.length).fill(0);

        if (init instanceof Map) {
            for (let [key, value] of init)
                initVector[this.stateIndex.get(JSON.stringify(key))!] = value;
        }
        else {
            for (let [key, value] of Object.entries(init))
                initVector[this.stateIndex.get(JSON.stringify(key))!] = value;
        }

        const transfered = mathjs.multiply(mathjs.matrix(initVector), matPow(this.getMatrix(format ?? "dense"), n));
        
        if (init instanceof Map) {
            const result = new Map();
            for (let i = 0; i < this.states.length; i++)
                if (transfered.get([i]))
                    result.set(this.states[i], transfered.get([i]));
            
            return result;
        }
        else {
            const result = {};
            for (let i = 0; i < this.states.length; i++)
                if (transfered.get([i]))
                    result[this.states[i] as MarkovState] = transfered.get([i]);
            
            return result;
        }
    }
}