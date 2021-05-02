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
    function State(buf) {
        var _this = this;
        this.read = function (address) {
            var addPtr = address;
            var value = _this.memory[addPtr];
            if (value >= 32768 && value <= 32775) {
                return _this.register[value - 32768];
            }
            return value;
        };
        this.ptr = 0;
        this.buf = buf;
        this.register = [0, 0, 0, 0, 0, 0, 0, 0];
        // this.memory = [9,32768,32769,4,19,32768];
        this.memory = [];
        // // console.log(buf.length);
        for (var index = 0; index < buf.length / 2; index += 2) {
            // const element = memoryBuffer.readInt15LE(index);
            var firstHalf = buf.readUInt8(index); // 4294967295
            var secondHalf = buf.readUInt8(index + 1); // 4294967295
            var t = (secondHalf << 8) + firstHalf;
            // console.log(firstHalf,secondHalf,'=',t);    
            this.memory.push(t);
        }
    }
    return State;
}());
console.log();
var tick = function (state) {
    if (state.ptr > state.buf.length) {
        console.log('EOF');
        return __assign(__assign({}, state), { ptr: -1 });
    }
    var cmd = state.read(state.ptr);
    var arg1 = state.read(state.ptr + 1);
    var arg2 = state.read(state.ptr + 2);
    var arg3 = state.read(state.ptr + 3);
    switch (cmd) {
        case 0: // halt
            return __assign(__assign({}, state), { ptr: -1 });
        case 1: // set
            state.register.splice(state.ptr - 32768, 1, arg2);
            return __assign(__assign({}, state), { 
                // register: state.register.splice(arg1, 1, arg2), 
                ptr: state.ptr + 3 });
        case 6: // jmp
            return __assign(__assign({}, state), { ptr: arg1 });
        case 7: // jt
            return __assign(__assign({}, state), { ptr: arg1 === 0 ? state.ptr + 3 : arg2 });
        case 8: // jf
            return __assign(__assign({}, state), { ptr: arg1 === 0 ? arg2 : state.ptr + 3 });
        case 9:
            // add: 9 a b c
            // assign into <a> the sum of <b> and <c> (modulo 32768)
            // const write = state.register;
            // write[arg1] = (arg2 + arg3) % 32768;
            state.register.splice(arg1, 1, (arg2 + arg3) % 32768);
            return __assign(__assign({}, state), { ptr: state.ptr + 4 });
        case 19: // out
            io_1.print(arg1);
            return __assign(__assign({}, state), { ptr: state.ptr + 2 });
        case 21: // noop
            return __assign(__assign({}, state), { ptr: state.ptr + 1 });
        default:
            console.log(" *** COMMAND MISSING *** : " + cmd);
            break;
    }
    return __assign(__assign({}, state), { ptr: state.ptr + 1 });
};
var state = new State(io_1.readfile('challenge.bin'));
while (true) {
    state = tick(state);
    if (state.ptr < 0)
        break;
    // console.log(state.register);
}
// console.log(state.register);
console.log('-- end --');
// 1 : OKjvrkoklplG
// 2 : lJsOWtHjOMQj
// 3 : 
