import { SSL_OP_CRYPTOPRO_TLSEXT_BUG } from 'constants';
import { readfile, log, print } from './io';

class State {
    public buffer: Buffer;
    public ptr: number;
    public register: number[];
    public stack: number[];
    public memory: number[];

    constructor(buf: Buffer) {
        this.ptr = 0;
        this.buffer = buf;
        this.register = [0, 0, 0, 0, 0, 0, 0, 0];
        this.stack = [];
        
        this.memory = [];
        for (let i = 0; i < buf.length / 2; i++) {
            this.memory.push(buf.readInt16LE(i));
        }
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

    write = (address: number, value: number) => {
        this.buffer[address] = value;
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
    
    // console.log(cmd,arg1,arg2,arg3);
    
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
            const eqset = arg2 === arg3 ? 1 : 0;
            const eq = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(eq, 1, eqset);
            return { ...state, ptr: state.ptr + 4 };

        case 5: // gt
            const set = arg2 > arg3 ? 1 : 0;
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
            const add = (arg2 + arg3) % 32768;
            const addAddr = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(addAddr, 1, add);
            return { ...state, ptr: state.ptr + 4 };

        case 10: // mult
            const mul = (arg2 * arg3) % 32768;
            const mulAddr = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(mulAddr, 1, mul);
            return { ...state, ptr: state.ptr + 4 };

        case 11: // mod
            const mod = arg2 % arg3;
            const modAddr = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(modAddr, 1, mod);
            return { ...state, ptr: state.ptr + 4 };


        case 12: // and
            const bwand = arg2 & arg3;
            const and = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(and, 1, bwand);
            return { ...state, ptr: state.ptr + 4 };
       

        case 13: // or
            const bwor = arg2 | arg3;
            const or = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(or, 1, bwor);
            return { ...state, ptr: state.ptr + 4 };

        case 14: // not
            const bin = (arg2).toString(2).padStart(15, "0");
            const dec = [...bin].map(x => x==="0" ? "1" : "0").join('');
            const bwnot = parseInt(dec, 2);

            const not = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(not, 1, bwnot);
            return { ...state, ptr: state.ptr + 3 };

        case 15: // rmem
            const read = state.read(arg2);
            const rmemAddr = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(rmemAddr, 1, read);
            return { ...state, ptr: state.ptr + 3 };

        case 16: // rmem
            const write = state.read(arg2);
            state.write(write, arg3)
            return { ...state, ptr: state.ptr + 3 };
            
// rmem: 15 a b
// read memory at address <b> and write it to <a>

// wmem: 16 a b
// write the value from <b> into memory at address <a>

        case 17: // call
            return {
                ...state,
                stack: [state.ptr + 2 , ...state.stack],
                ptr: arg1
            };

// ret: 18
// remove the top element from the stack and jump to it; empty stack = halt

        case 19:  // out
            print(arg1);
            return { ...state, ptr: state.ptr + 2 };

// in: 20 a
// read a character from the terminal and write its ascii code to <a>; it can be assumed that once input starts, it will continue until a newline is encountered; this means that you can safely read whole lines from the keyboard and trust that they will be fully read


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
