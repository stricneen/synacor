"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var initialState = {
    ptr: 0,
    memory: new BufferReader(io_1.readfile('challenge.bin'))
};
var tick = function (state) {
    var cmd = state.memory.read(state.ptr);
    io_1.log(cmd);
    switch (cmd) {
        case 0: // halt
            return __assign(__assign({}, state), { ptr: -1 });
        case 6:
            return __assign(__assign({}, state), { ptr: state.memory.read(state.ptr + 2) * 2 });
        case 7:
            var p7a = state.memory.read(state.ptr + 2);
            var p7b = state.memory.read(state.ptr + 4);
            return __assign(__assign({}, state), { ptr: p7a === 0 ? state.ptr + 6 : p7b * 2 });
        case 8:
            var p8a = state.memory.read(state.ptr + 2);
            var p8b = state.memory.read(state.ptr + 4);
            return __assign(__assign({}, state), { ptr: p8a === 0 ? p8b * 2 : state.ptr + 6 });
        //         case 7:
        //             const p7a = b.read(ptr);
        //             const p7b = b.read(ptr + 2);
        //             ptr = p7a === 0 ? ptr + 4 : p7b * 2; 
        //             break;
        case 19: // out
            io_1.print(state.memory.read(state.ptr + 2));
            return __assign(__assign({}, state), { ptr: state.ptr += 4 });
        case 21:
            return __assign(__assign({}, state), { ptr: state.ptr += 2 });
        default:
            console.log(" *** COMMAND MISSING : " + cmd);
            break;
    }
    return __assign(__assign({}, state), { ptr: state.ptr + 2 });
};
var state = initialState;
while (true) {
    state = tick(state);
    if (state.ptr < 0)
        break;
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
