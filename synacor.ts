import { readfile, log, print } from './io';

class State {
    public buf: Buffer;
    public ptr: number;
    public register: number[];

    constructor(buf: Buffer) {
        this.ptr = 0;
        this.buf = buf;
        this.register = [0,0,0,0,0,0,0,0];
    }

    read = (address: number) => {
        const value = this.buf.readUInt16LE(address * 2);
        if (value >= 32768 && value <= 32775) {
            return this.register[value - 32768];
        }
        return value;
    }
}

console.log();

const tick = (state: State): State => {

    if (state.ptr > state.buf.length) {
        console.log('EOF');
        return { ...state, ptr: -1 }; 
    }

    const cmd = state.read(state.ptr);
    const arg1 = state.read(state.ptr + 1);
    const arg2 = state.read(state.ptr + 2);
    const arg3 = state.read(state.ptr + 3);
    
    switch (cmd) {
        case 0: // halt
            return { ...state, ptr: -1 }; 
        
        case 1: // set
            state.register.splice(state.ptr-32768, 1, arg2);
            return { ...state,  
                ptr: state.ptr + 3}; 

        case 6: // jmp
            return { ...state, ptr: arg1 }; 

        case 7: // jt
            return { ...state, ptr: arg1 === 0 ? state.ptr + 3 : arg2 }; 
         
        case 8: // jf
            return { ...state, ptr: arg1 === 0 ? arg2 : state.ptr + 3 }; 
                 
        case 9: // add
            state.register.splice(arg1, 1, (arg2 + arg3) % 32768);
            return { ...state, 
                ptr: state.ptr + 4 }; 

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

while(true) {
    state = tick(state);
    if (state.ptr < 0) break;
    // console.log(state.register);
}

// console.log(state.register);
console.log('-- end --');

// 1 : OKjvrkoklplG
// 2 : lJsOWtHjOMQj
// 3 : 
