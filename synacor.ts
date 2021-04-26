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

console.log();
let ptr = 0;
let halt = false;
const b = new BufferReader(readfile('challenge.bin'));

// let tt = 0;
// while(true) {
//     console.log(b.read(tt));
//     tt += 2;
//     if (tt === 2000) break;
// }

while(true) {

    const cmd = b.read(ptr);
    ptr += 2;

    log(cmd);

    switch (cmd) {
    
        case 0: // halt
            halt = true;
            break;

        case 6: // jmp
            const p6 = b.read(ptr);
            ptr = (p6 * 2);
            break;

        case 7:
            const p7a = b.read(ptr);
            const p7b = b.read(ptr + 2);
            ptr = p7a === 0 ? ptr + 4 : p7b * 2; 
            break;

//             jf: 8 a b
//   if <a> is zero, jump to <b>
        case 8:
            const p8a = b.read(ptr);
            const p8b = b.read(ptr + 2);
            ptr = p8a === 0 ? p8b * 2 : ptr + 4; 
            break;
            

        case 19:  // out
            const p19 = b.read(ptr);
            print(p19);
            ptr += 2;
            break;
    
        case 21: // noop
            // ptr += 2;
            break; 
    
        default:
           console.log(`COMMAND MISSING : ${cmd}`);
            break;
    }


    if (halt) break;

}

// console.log('-- typescript --');

// 1 : OKjvrkoklplG
// 2 : lJsOWtHjOMQj
// 3 : 
