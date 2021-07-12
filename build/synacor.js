"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io_1 = require("./io");
const state_1 = require("./state");
console.log();
const surr = (address, memory) => {
    console.log(memory[address - 3], memory[address - 2], memory[address - 1], memory[address], memory[address + 1], memory[address + 2], memory[address + 3]);
};
const tick = (state) => {
    if (state.ptr > state.memory.length) {
        console.log('EOF');
        return { ...state, ptr: -1 };
    }
    const cmd = state.read(state.ptr);
    const arg1 = state.read(state.ptr + 1);
    const arg2 = state.read(state.ptr + 2);
    const arg3 = state.read(state.ptr + 3);
    //  log(cmd);
    //  console.log(cmd,arg1,arg2,arg3);
    switch (cmd) {
        case 0: // halt
            return { ...state, ptr: -1 };
        case 1: // set
            state.register.splice(state.ptr - 32768, 1, arg2);
            return {
                ...state,
                ptr: state.ptr + 3
            };
        case 2: // push
            return {
                ...state,
                stack: [arg1, ...state.stack],
                ptr: state.ptr + 2
            };
        case 3: // pop
            const [pop, ...rem] = state.stack;
            const popWrite = state.read2(state.ptr + 1);
            state.register.splice(popWrite, 1, pop);
            return { ...state, stack: rem, ptr: state.ptr + 2 };
        case 4: // eq
            const eqset = arg2 === arg3 ? 1 : 0;
            const eq = state.read2(state.ptr + 1);
            state.register.splice(eq, 1, eqset);
            return { ...state, ptr: state.ptr + 4 };
        case 5: // gt
            const set = arg2 > arg3 ? 1 : 0;
            const register = state.read2(state.ptr + 1);
            state.register.splice(register, 1, set);
            return { ...state, ptr: state.ptr + 4 };
        case 6: // jmp
            return { ...state, ptr: arg1 };
        case 7: // jt
            return { ...state, ptr: arg1 === 0 ? state.ptr + 3 : arg2 };
        case 8: // jf
            return { ...state, ptr: arg1 === 0 ? arg2 : state.ptr + 3 };
        case 9: // add
            const add = (arg2 + arg3) % 32768;
            const addAddr = state.read2(state.ptr + 1);
            state.register.splice(addAddr, 1, add);
            return { ...state, ptr: state.ptr + 4 };
        case 10: // mult
            const mul = (arg2 * arg3) % 32768;
            const mulAddr = state.read2(state.ptr + 1);
            state.register.splice(mulAddr, 1, mul);
            return { ...state, ptr: state.ptr + 4 };
        case 11: // mod
            const mod = arg2 % arg3;
            const modAddr = state.read2(state.ptr + 1);
            state.register.splice(modAddr, 1, mod);
            return { ...state, ptr: state.ptr + 4 };
        case 12: // and
            const bwand = arg2 & arg3;
            const and = state.read2(state.ptr + 1);
            state.register.splice(and, 1, bwand);
            return { ...state, ptr: state.ptr + 4 };
        case 13: // or
            const bwor = arg2 | arg3;
            const or = state.read2(state.ptr + 1);
            state.register.splice(or, 1, bwor);
            return { ...state, ptr: state.ptr + 4 };
        case 14: // not
            const bin = (arg2).toString(2).padStart(15, "0");
            const dec = [...bin].map(x => x === "0" ? "1" : "0").join('');
            const bwnot = parseInt(dec, 2);
            const not = state.read2(state.ptr + 1);
            state.register.splice(not, 1, bwnot);
            return { ...state, ptr: state.ptr + 3 };
        // rmem: 15 a b
        // read memory at address <b> and write it to <a>
        case 15: // rmem
            const writeAddr = state.memory[state.ptr + 1];
            const readAddr = state.memory[state.ptr + 2];
            // console.log(readAddr);
            // const readMem = state.memory[readAddr];
            //            const readMemAddr = state.memory[readAddr];
            const readMem = (readAddr >= 32768 && readAddr <= 32775)
                ? state.memory[state.register[readAddr - 32768]]
                : state.memory[readAddr];
            // console.log(readMem);
            // console.log(state.memory[readMem]);
            if (writeAddr >= 32768 && writeAddr <= 32775) {
                state.register.splice(writeAddr - 32768, 1, readMem);
                return { ...state, ptr: state.ptr + 3 };
            }
            state.memory.splice(writeAddr, 1, state.memory[readMem]);
            return { ...state, ptr: state.ptr + 3 };
        // wmem: 16 a b
        // write the value from <b> into memory at address <a>
        case 16: // wmem
            //state.memory.splice(arg1, 1, arg2);
            const wmemAddr = state.read2(state.ptr + 1);
            state.register.splice(wmemAddr, 1, arg2);
            state.terminate--;
            return { ...state, ptr: state.ptr + 3 };
        // call: 17 a
        // write the address of the next instruction to the stack and jump to <a>
        case 17: // call
            return {
                ...state,
                stack: [state.ptr + 2, ...state.stack],
                ptr: arg1
            };
        case 18: // ret
            const [ret, ...rstack] = state.stack;
            return { ...state, stack: rstack, ptr: ret };
        case 19: // out
            io_1.print(arg1);
            return { ...state, ptr: state.ptr + 2 };
        // in: 20 a
        // read a character from the terminal and write its ascii code to <a>; it can be assumed that once input starts, it will continue until a newline is encountered; this means that you can safely read whole lines from the keyboard and trust that they will be fully read
        case 20:
            console.log('=== read ===');
            return state;
        case 21: // noop
            return { ...state, ptr: state.ptr + 1 };
        default:
            surr(state.ptr, state.memory);
            console.log(` *** COMMAND MISSING *** : ${cmd}`);
            break;
    }
    return { ...state, ptr: state.ptr + 1 };
};
let state = new state_1.State(io_1.readfile('challenge.bin'));
let instructionCount = 0;
while (true) {
    state = tick(state);
    io_1.printCommand(state);
    instructionCount++;
    if (state.ptr < 0)
        break;
    if (state.terminate < 0)
        break;
    // console.log(state.register);
}
// console.log(state.register);
console.log('Instructions : ', instructionCount);
console.log('-- end --');
// 1 : OKjvrkoklplG
// 2 : lJsOWtHjOMQj
// 3 : 
