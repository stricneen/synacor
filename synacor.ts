import { readfile, print, printCommand } from './io';
import { State } from './state';

console.log();


const surr = (address: number, memory: number[]) => {
    console.log(memory[address-3],memory[address-2],memory[address-1],memory[address],memory[address+1],memory[address+2],memory[address+3],);
}

const resolve = (x: number): number => {
    return (x >= 32768 && x <= 32775) ? state.register[x - 32768] : x;
}

const tick = (state: State): State => {

    if (state.ptr > state.memory.length) {
        console.log('EOF');
        return { ...state, ptr: -1 };
    }

    const cmd = state.read(state.ptr);
    const raw1 = state.memory[state.ptr + 1];
    const raw2 = state.memory[state.ptr + 2];
    const raw3 = state.memory[state.ptr + 3];

    const arg1 = resolve(raw1); 
    const arg2 = resolve(raw2);
    const arg3 = resolve(raw3);
    
    switch (cmd) {
        case 0: // halt
            return { ...state, ptr: -1 };
            
        case 1: // set
            state.register.splice(raw1 - 32768, 1, arg2);
            return { ...state, ptr: state.ptr + 3 };

        case 2: // push
            return { ...state, stack: [arg1, ...state.stack], ptr: state.ptr + 2 };

        case 3: // pop
            const [pop, ...rem] = state.stack;
            const popWrite = state.read2(state.ptr + 1);
            state.register.splice(popWrite, 1, pop);
            return {...state, stack: rem, ptr: state.ptr + 2 };

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
            const dec = [...bin].map(x => x==="0" ? "1" : "0").join('');
            const bwnot = parseInt(dec, 2);
            const not = state.read2(state.ptr + 1);
            state.register.splice(not, 1, bwnot);
            return { ...state, ptr: state.ptr + 3 };

        case 15: // rmem
            const readMem = state.memory[arg2];
            state.register.splice(raw1 - 32768, 1, readMem);
            return { ...state, ptr: state.ptr + 3 };

        case 16: // wmem
            state.memory.splice(arg1, 1, arg2);
            state.terminate--;
            return { ...state, ptr: state.ptr + 3 };
            
        case 17: // call
            return { ...state, stack: [state.ptr + 2, ...state.stack], ptr: arg1 };

        case 18: // ret
            const [ ret, ...rstack ] = state.stack;
            return { ...state, stack: rstack, ptr: ret };

        case 19:  // out
            print(arg1);
            return { ...state, ptr: state.ptr + 2 };

        // in: 20 a
        // read a character from the terminal and write its ascii code to <a>; it can be assumed that once input starts, it will continue until a newline is encountered; this means that you can safely read whole lines from the keyboard and trust that they will be fully read
        case 20:
            console.log('=== read ===');
            return { ...state, ptr: -1 };

        case 21: // noop
            return { ...state, ptr: state.ptr + 1 };

        default:
            surr(state.ptr, state.memory);
            console.log(` *** COMMAND MISSING *** : ${cmd}`);
            break;
    }
  

    return { ...state, ptr: state.ptr + 1 };
}

let state = new State(readfile('challenge.bin'));
let instructionCount = 0;
while (true) {
    state = tick(state);
    // printCommand(state);
    instructionCount++;
    if (state.ptr < 0) break;
    // if (state.terminate < 0) break;
    // console.log(state.register);
}

// console.log(state.register);
console.log('Instructions : ', instructionCount);
console.log('-- end --');

// 1 : OKjvrkoklplG
// 2 : lJsOWtHjOMQj
// 3 : 
