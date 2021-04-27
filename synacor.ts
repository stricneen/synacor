import { readfile, log, print } from './io';

class State {
     ptr: number;
     memory: Buffer;
     register: number[];

    constructor(memory: Buffer) {
        this.ptr = 0;
        this.memory = memory;
        this.register = [0,0,0,0,0,0,0,0];
    }

    read = (address: number) => {
        // console.log(address);
        if (address >= 32768 && address <= 32775){
            console.log(`accessing register ${address - 32768} > ${this.register[address - 32768]}` )
            return this.register[address - 32768];
        }
        return this.memory.readUInt16LE(address);
    }
}

console.log();

const tick = (state: State): State => {

    const cmd = state.read(state.ptr);
    const arg1 = state.read(state.ptr + 2);
    const arg2 = state.read(state.ptr + 4);
    
    log(cmd);
    switch (cmd) {
        case 0: // halt
            return { ...state, ptr: -1 }; 

        case 6: // jmp
            return { ...state, ptr: arg1 * 2 }; 

        case 7: // jt
            return { ...state, ptr: arg1 === 0 ? state.ptr + 6 : arg2 * 2 }; 
         
        case 8: // jt
            return { ...state, ptr: arg1 === 0 ? arg2 * 2 : state.ptr + 6 }; 
                 
        case 19:  // out
            print(state.read(state.ptr + 2));
            return { ...state, ptr: state.ptr += 4 }; 

        case 21: // noop
            return { ...state, ptr: state.ptr += 2 }; 

        default:
            console.log(` *** COMMAND MISSING : ${cmd}`);
            break;
    }

    return { ...state, ptr: state.ptr + 2 };
}
    
let state = new State(readfile('challenge.bin'));

// let x = 0;
// while(true) {
//     let xx = state.read(x);
// // // if (xx >= 32768) console.log(xx);
//     x+=2;
// // //  if (x==30000) break;
// }

while(true) {
    state = tick(state);
    if (state.ptr < 0) break;
}

console.log('-- end --');

// 1 : OKjvrkoklplG
// 2 : lJsOWtHjOMQj
// 3 : 
