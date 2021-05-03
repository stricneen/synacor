import { readfile, log, print } from './io';

class State {
    public buffer: Buffer;
    public ptr: number;
    public register: number[];
    public stack: number[];

    constructor(buf: Buffer) {
        this.ptr = 0;
        this.buffer = buf;
        this.register = [0, 0, 0, 0, 0, 0, 0, 0];
        this.stack = [];
    }

    read = (address: number) => {
        const value = this.buffer.readUInt16LE(address * 2);
        // console.log('val', value);
        if (value >= 32768 && value <= 32775) {
            // console.log(`REG(${value-32768}) = ${this.register[value - 32768]}`)
            return this.register[value - 32768];
        }
        return value;
    }
}

console.log();

const tick = (state: State): State => {

    if (state.ptr > state.buffer.length) {
        console.log('EOF');
        return { ...state, ptr: -1 };
    }
    // console.log();console.log();
    const cmd = state.read(state.ptr);
    // log(cmd);
    const arg1 = state.read(state.ptr + 1);
    const arg2 = state.read(state.ptr + 2);
    const arg3 = state.read(state.ptr + 3);
    
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
            const popWrite = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(popWrite, 1, pop);
            return {
                ...state,
                stack: rem,
                ptr: state.ptr + 2
            };

        case 4: // eq
            const set = arg2 === arg3 ? 1 : 0;
            const register = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(register, 1, set);
            return { ...state, ptr: state.ptr + 4 };

        case 6: // jmp
            return { ...state, ptr: arg1 };

        case 7: // jt
            return { ...state, ptr: arg1 === 0 ? state.ptr + 3 : arg2 };

        case 8: // jf
            return { ...state, ptr: arg1 === 0 ? arg2 : state.ptr + 3 };

        case 9: // add
            state.register.splice(arg1, 1, (arg2 + arg3) % 32768);
            return { ...state, ptr: state.ptr + 4 };

        case 19:  // out
            print(arg1);
            return { ...state, ptr: state.ptr + 2 };

        case 21: // noop
            return { ...state, ptr: state.ptr + 1 };

        default:
            console.log(` *** COMMAND MISSING *** : ${cmd}`);
            break;
    }

    return { ...state, ptr: state.ptr + 1 };
}

let state = new State(readfile('challenge.bin'));

while (true) {
    state = tick(state);
    if (state.ptr < 0) break;
    // console.log(state.register);
}

// console.log(state.register);
console.log('-- end --');

// 1 : OKjvrkoklplG
// 2 : lJsOWtHjOMQj
// 3 : 
