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
var State = /** @class */ (function () {
    function State(memory) {
        var _this = this;
        this.read = function (address) {
            // console.log(address);
            if (address >= 32768 && address <= 32775) {
                console.log("accessing register " + (address - 32768) + " > " + _this.register[address - 32768]);
                return _this.register[address - 32768];
            }
            return _this.memory.readUInt16LE(address);
        };
        this.ptr = 0;
        this.memory = memory;
        this.register = [0, 0, 0, 0, 0, 0, 0, 0];
    }
    return State;
}());
console.log();
var tick = function (state) {
    var cmd = state.read(state.ptr);
    var arg1 = state.read(state.ptr + 2);
    var arg2 = state.read(state.ptr + 4);
    io_1.log(cmd);
    switch (cmd) {
        case 0: // halt
            return __assign(__assign({}, state), { ptr: -1 });
        case 6: // jmp
            return __assign(__assign({}, state), { ptr: arg1 * 2 });
        case 7: // jt
            return __assign(__assign({}, state), { ptr: arg1 === 0 ? state.ptr + 6 : arg2 * 2 });
        case 8: // jt
            return __assign(__assign({}, state), { ptr: arg1 === 0 ? arg2 * 2 : state.ptr + 6 });
        case 19: // out
            io_1.print(state.read(state.ptr + 2));
            return __assign(__assign({}, state), { ptr: state.ptr += 4 });
        case 21: // noop
            return __assign(__assign({}, state), { ptr: state.ptr += 2 });
        default:
            console.log(" *** COMMAND MISSING : " + cmd);
            break;
    }
    return __assign(__assign({}, state), { ptr: state.ptr + 2 });
};
var state = new State(io_1.readfile('challenge.bin'));
// let x = 0;
// while(true) {
//     let xx = state.read(x);
// // // if (xx >= 32768) console.log(xx);
//     x+=2;
// // //  if (x==30000) break;
// }
while (true) {
    state = tick(state);
    if (state.ptr < 0)
        break;
}
console.log('-- end --');
// 1 : OKjvrkoklplG
// 2 : lJsOWtHjOMQj
// 3 : 
