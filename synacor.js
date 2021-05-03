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
            // console.log('val', value);
            if (value >= 32768 && value <= 32775) {
                // console.log(`REG(${value-32768}) = ${this.register[value - 32768]}`)
                return _this.register[value - 32768];
            }
            return value;
        };
        this.ptr = 0;
        this.buffer = buf;
        this.register = [0, 0, 0, 0, 0, 0, 0, 0];
        this.stack = [];
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
            var popWrite = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(popWrite, 1, pop);
            return __assign(__assign({}, state), { stack: rem, ptr: state.ptr + 2 });
        case 4: // eq
            var eqset = arg2 === arg3 ? 1 : 0;
            var eq = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(eq, 1, eqset);
            return __assign(__assign({}, state), { ptr: state.ptr + 4 });
        case 5: // gt
            var set = arg2 > arg3 ? 1 : 0;
            var register = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(register, 1, set);
            return __assign(__assign({}, state), { ptr: state.ptr + 4 });
        case 6: // jmp
            return __assign(__assign({}, state), { ptr: arg1 });
        case 7: // jt
            return __assign(__assign({}, state), { ptr: arg1 === 0 ? state.ptr + 3 : arg2 });
        case 8: // jf
            return __assign(__assign({}, state), { ptr: arg1 === 0 ? arg2 : state.ptr + 3 });
        case 9: // add
            state.register.splice(arg1, 1, (arg2 + arg3) % 32768);
            return __assign(__assign({}, state), { ptr: state.ptr + 4 });
        case 12: // and
            var bwand = arg2 & arg3;
            var and = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(and, 1, bwand);
            return __assign(__assign({}, state), { ptr: state.ptr + 4 });
        case 13: // or
            var bwor = arg2 | arg3;
            var or = state.buffer.readUInt16LE((state.ptr + 1) * 2) - 32768;
            state.register.splice(or, 1, bwor);
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
