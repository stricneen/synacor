"use strict";
exports.__esModule = true;
var io_1 = require("./io");
var BufferReader = /** @class */ (function () {
    function BufferReader(buffer) {
        this.buffer = buffer;
    }
    BufferReader.prototype.read = function (index) {
        return this.buffer.readUInt16LE(index);
    };
    return BufferReader;
}());
console.log();
var ptr = 0;
var halt = false;
var b = new BufferReader(io_1.readfile('challenge.bin'));
// let tt = 0;
// while(true) {
//     console.log(b.read(tt));
//     tt += 2;
//     if (tt === 2000) break;
// }
while (true) {
    var cmd = b.read(ptr);
    ptr += 2;
    io_1.log(cmd);
    switch (cmd) {
        case 0: // halt
            halt = true;
            break;
        case 6: // jmp
            var p6 = b.read(ptr);
            ptr = (p6 * 2);
            break;
        case 7:
            var p7a = b.read(ptr);
            var p7b = b.read(ptr + 2);
            ptr = p7a === 0 ? ptr + 4 : p7b * 2;
            break;
        //             jf: 8 a b
        //   if <a> is zero, jump to <b>
        case 8:
            var p8a = b.read(ptr);
            var p8b = b.read(ptr + 2);
            ptr = p8a === 0 ? p8b * 2 : ptr + 4;
            break;
        case 19: // out
            var p19 = b.read(ptr);
            io_1.print(p19);
            ptr += 2;
            break;
        case 21: // noop
            // ptr += 2;
            break;
        default:
            console.log("COMMAND MISSING : " + cmd);
            break;
    }
    if (halt)
        break;
}
// console.log('-- typescript --');
// 1 : OKjvrkoklplG
// 2 : lJsOWtHjOMQj
// 3 : 
