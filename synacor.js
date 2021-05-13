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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
var io_1 = require("./io");
var State = /** @class */ (function () {
    function State(buf) {
        var _this = this;
        this.read = function (address) {
            var value = _this.buffer.readUInt16LE(address * 2);
            var value2 = _this.memory[address];
            if (value >= 32768 && value <= 32775) {
                // console.log(`REG(${value-32768}) = ${this.register[value - 32768]}`)
                return _this.register[value - 32768];
            }
            return value;
        };
        this.read2 = function (address) {
            // return this.memory[address] - 32768;
            return state.buffer.readUInt16LE((address) * 2) - 32768;
        };
        this.ptr = 0;
        this.buffer = buf;
        this.register = [0, 0, 0, 0, 0, 0, 0, 0];
        this.stack = [];
        this.memory = [];
        for (var i = 0; i < buf.length; i += 2) {
            var l = buf.readUInt8(i);
            var h = buf.readUInt8(i + 1) & 0x7FFF;
            var v = (h << 7) + l;
            // console.log(h.toString(2),l.toString(2),v);
            this.memory.push(v);
        }
    }
    return State;
}());
console.log();
var tick = function (state) {
    if (state.ptr > state.buffer.length) {
        console.log('EOF');
        return __assign(__assign({}, state), { ptr: -1 });
    }
    // console.log();console.log();
    var cmd = state.read(state.ptr);
    // log(cmd);
    var arg1 = state.read(state.ptr + 1);
    var arg2 = state.read(state.ptr + 2);
    var arg3 = state.read(state.ptr + 3);
    // console.log(cmd,arg1,arg2,arg3);
    switch (cmd) {
        case 0: // halt
            return __assign(__assign({}, state), { ptr: -1 });
        case 1: // set
            state.register.splice(state.ptr - 32768, 1, arg2);
            return __assign(__assign({}, state), { ptr: state.ptr + 3 });
        case 2: // push
            return __assign(__assign({}, state), { stack: __spread([arg1], state.stack), ptr: state.ptr + 2 });
        case 3: // pop
            var _a = __read(state.stack), pop = _a[0], rem = _a.slice(1);
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
            var dec = __spread(bin).map(function (x) { return x === "0" ? "1" : "0"; }).join('');
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
            var write = state.read(arg2);
            // state.write(write, arg3)
            return __assign(__assign({}, state), { ptr: state.ptr + 3 });
        case 17: // call
            return __assign(__assign({}, state), { stack: __spread([state.ptr + 2], state.stack), ptr: arg1 });
        // ret: 18
        // remove the top element from the stack and jump to it; empty stack = halt
        case 19: // out
            io_1.print(arg1);
            return __assign(__assign({}, state), { ptr: state.ptr + 2 });
        // in: 20 a
        // read a character from the terminal and write its ascii code to <a>; it can be assumed that once input starts, it will continue until a newline is encountered; this means that you can safely read whole lines from the keyboard and trust that they will be fully read
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
