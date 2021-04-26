import { readfile, log, print } from './io';

class BufferReader {
    private readonly buffer: Buffer;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    read(index: number) {
        return this.buffer.readUInt16LE(index);
    }
} 

interface VMState {
    memory: BufferReader;
    ptr: number;
}

console.log();

const initialState: VMState = {
    ptr: 0,
    memory: new BufferReader(readfile('challenge.bin')),
}

const tick = (state: VMState): VMState => {

    const cmd = state.memory.read(state.ptr);
    log(cmd);
    switch (cmd) {
        case 0: // halt
            return { ...state, ptr: -1 }; 

        case 6:
            return { ...state, ptr: state.memory.read(state.ptr + 2) * 2 }; 

        case 7:
            const p7a = state.memory.read(state.ptr + 2);
            const p7b = state.memory.read(state.ptr + 4);
            return { ...state, ptr: p7a === 0 ? state.ptr + 6 : p7b * 2 }; 
         
        case 8:
            const p8a = state.memory.read(state.ptr + 2);
            const p8b = state.memory.read(state.ptr + 4);
            return { ...state, ptr: p8a === 0 ? p8b * 2 : state.ptr + 6 }; 
                 
//         case 7:
//             const p7a = b.read(ptr);
//             const p7b = b.read(ptr + 2);
//             ptr = p7a === 0 ? ptr + 4 : p7b * 2; 
//             break;


        case 19:  // out
            print(state.memory.read(state.ptr + 2));
            return { ...state, ptr: state.ptr += 4 }; 

        case 21:
            return { ...state, ptr: state.ptr += 2 }; 

        default:
            console.log(` *** COMMAND MISSING : ${cmd}`);
            break;
    }

    return { ...state, ptr: state.ptr + 2 };
}
    
let state = initialState;
while(true) {

    state = tick(state);


   if (state.ptr < 0) break;
    

    

//     switch (cmd) {
    
//         case 7:
//             const p7a = b.read(ptr);
//             const p7b = b.read(ptr + 2);
//             ptr = p7a === 0 ? ptr + 4 : p7b * 2; 
//             break;

// //             jf: 8 a b
// //   if <a> is zero, jump to <b>
//         case 8:
//             const p8a = b.read(ptr);
//             const p8b = b.read(ptr + 2);
//             ptr = p8a === 0 ? p8b * 2 : ptr + 4; 
//             break;
            


    
//         case 21: // noop
//             // ptr += 2;
//             break; 
    
//         default:
//            console.log(`COMMAND MISSING : ${cmd}`);
//             break;
//     }




}

console.log('-- end --');

// 1 : OKjvrkoklplG
// 2 : lJsOWtHjOMQj
// 3 : 
