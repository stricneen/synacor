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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var io_1 = require("./io");
var state_1 = require("./state");
console.log();
var surr = function (address, memory) {
    console.log(memory[address - 3], memory[address - 2], memory[address - 1], memory[address], memory[address + 1], memory[address + 2], memory[address + 3]);
};
var tick = function (state) {
    if (state.ptr > state.memory.length) {
        console.log('EOF');
        return __assign(__assign({}, state), { ptr: -1 });
    }
    var cmd = state.read(state.ptr);
    var arg1 = state.read(state.ptr + 1);
    var arg2 = state.read(state.ptr + 2);
    var arg3 = state.read(state.ptr + 3);
    //  log(cmd);
    console.log(cmd, arg1, arg2, arg3);
    switch (cmd) {
        case 0: // halt
            return __assign(__assign({}, state), { ptr: -1 });
        case 1: // set
            state.register.splice(state.ptr - 32768, 1, arg2);
            return __assign(__assign({}, state), { ptr: state.ptr + 3 });
        case 2: // push
            return __assign(__assign({}, state), { stack: __spreadArrays([arg1], state.stack), ptr: state.ptr + 2 });
        case 3: // pop
            var _a = state.stack, pop = _a[0], rem = _a.slice(1);
            var popWrite = state.read2(state.ptr + 1);
            state.register.splice(popWrite, 1, pop);
            return __assign(__assign({}, state), { stack: rem, ptr: state.ptr + 2 });
        case 4: // eq
            var eqset = arg2 === arg3 ? 1 : 0;
            var eq = state.read2(state.ptr + 1);
            state.register.splice(eq, 1, eqset);
            return __assign(__assign({}, state), { ptr: state.ptr + 4 });
        case 5: // gt
            var set = arg2 > arg3 ? 1 : 0;
            var register = state.read2(state.ptr + 1);
            state.register.splice(register, 1, set);
            return __assign(__assign({}, state), { ptr: state.ptr + 4 });
        case 6: // jmp
            return __assign(__assign({}, state), { ptr: arg1 });
        case 7: // jt
            return __assign(__assign({}, state), { ptr: arg1 === 0 ? state.ptr + 3 : arg2 });
        case 8: // jf
            return __assign(__assign({}, state), { ptr: arg1 === 0 ? arg2 : state.ptr + 3 });
        case 9: // add
            var add = (arg2 + arg3) % 32768;
            var addAddr = state.read2(state.ptr + 1);
            state.register.splice(addAddr, 1, add);
            return __assign(__assign({}, state), { ptr: state.ptr + 4 });
        case 10: // mult
            var mul = (arg2 * arg3) % 32768;
            var mulAddr = state.read2(state.ptr + 1);
            state.register.splice(mulAddr, 1, mul);
            return __assign(__assign({}, state), { ptr: state.ptr + 4 });
        case 11: // mod
            var mod = arg2 % arg3;
            var modAddr = state.read2(state.ptr + 1);
            state.register.splice(modAddr, 1, mod);
            return __assign(__assign({}, state), { ptr: state.ptr + 4 });
        case 12: // and
            var bwand = arg2 & arg3;
            var and = state.read2(state.ptr + 1);
            state.register.splice(and, 1, bwand);
            return __assign(__assign({}, state), { ptr: state.ptr + 4 });
        case 13: // or
            var bwor = arg2 | arg3;
            var or = state.read2(state.ptr + 1);
            state.register.splice(or, 1, bwor);
            return __assign(__assign({}, state), { ptr: state.ptr + 4 });
        case 14: // not
            var bin = (arg2).toString(2).padStart(15, "0");
            var dec = __spreadArrays(bin).map(function (x) { return x === "0" ? "1" : "0"; }).join('');
            var bwnot = parseInt(dec, 2);
            var not = state.read2(state.ptr + 1);
            state.register.splice(not, 1, bwnot);
            return __assign(__assign({}, state), { ptr: state.ptr + 3 });
        // rmem: 15 a b
        // read memory at address <b> and write it to <a>
        case 15: // rmem
            var read = state.read(arg2);
            var rmemAddr = state.read2(state.ptr + 1);
            state.register.splice(rmemAddr, 1, read);
            return __assign(__assign({}, state), { ptr: state.ptr + 3 });
        // wmem: 16 a b
        // write the value from <b> into memory at address <a>
        case 16: // wmem
            state.memory.splice(arg1, 1, arg2);
            return __assign(__assign({}, state), { ptr: state.ptr + 3 });
        // call: 17 a
        // write the address of the next instruction to the stack and jump to <a>
        case 17: // call
            return __assign(__assign({}, state), { stack: __spreadArrays([state.ptr + 2], state.stack), ptr: arg1 });
        case 18: // ret
            var _b = state.stack, ret = _b[0], rstack = _b.slice(1);
            return __assign(__assign({}, state), { stack: rstack, ptr: ret });
        case 19: // out
            io_1.print(arg1);
            return __assign(__assign({}, state), { ptr: state.ptr + 2 });
        // in: 20 a
        // read a character from the terminal and write its ascii code to <a>; it can be assumed that once input starts, it will continue until a newline is encountered; this means that you can safely read whole lines from the keyboard and trust that they will be fully read
        case 20:
            console.log('=== read ===');
            return state;
        case 21: // noop
            return __assign(__assign({}, state), { ptr: state.ptr + 1 });
        default:
            surr(state.ptr, state.memory);
            console.log(" *** COMMAND MISSING *** : " + cmd);
            break;
    }
    return __assign(__assign({}, state), { ptr: state.ptr + 1 });
};
var state = new state_1.State(io_1.readfile('challenge.bin'));
var instructionCount = 0;
while (true) {
    state = tick(state);
    instructionCount++;
    if (state.ptr < 0)
        break;
    // console.log(state.register);
}
// console.log(state.register);
console.log('Instructions : ', instructionCount);
console.log('-- end --');
// 1 : OKjvrkoklplG
// 2 : lJsOWtHjOMQj
// 3 : 
