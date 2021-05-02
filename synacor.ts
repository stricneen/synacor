import { readfile, log, print } from './io';

class State {
     ptr: number;
     buf: Buffer;
     register: number[];
    memory: number[];

    constructor(buf: Buffer) {
        this.ptr = 0;
        this.buf = buf;
        this.register = [0,0,0,0,0,0,0,0];
        // this.memory = [9,32768,32769,4,19,32768];
         this.memory = [];

        // // console.log(buf.length);
        for (let index = 0; index < buf.length / 2; index+=2) {
            // const element = memoryBuffer.readInt15LE(index);
            var firstHalf = buf.readUInt8(index); // 4294967295
            var secondHalf = buf.readUInt8(index + 1); // 4294967295
            const t = (secondHalf << 8) + firstHalf;
            // console.log(firstHalf,secondHalf,'=',t);    
            this.memory.push(t);
        }

        
    }

    read = (address: number) => {
        const addPtr = address ;
        const value = this.memory[addPtr];
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
                // register: state.register.splice(arg1, 1, arg2), 
                ptr: state.ptr + 3}; 

        case 6: // jmp
            return { ...state, ptr: arg1 }; 

        case 7: // jt
            return { ...state, ptr: arg1 === 0 ? state.ptr + 3 : arg2 }; 
         
        case 8: // jf
            return { ...state, ptr: arg1 === 0 ? arg2 : state.ptr + 3 }; 
                 
        case 9:
            // add: 9 a b c
            // assign into <a> the sum of <b> and <c> (modulo 32768)
            
            // const write = state.register;
            // write[arg1] = (arg2 + arg3) % 32768;
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
