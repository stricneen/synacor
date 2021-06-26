"use strict";
exports.__esModule = true;
exports.State = void 0;
var State = /** @class */ (function () {
    function State(buf) {
        var _this = this;
        this.read = function (address) {
            var value = _this.memory[address];
            if (value >= 32768 && value <= 32775) {
                return _this.register[value - 32768];
            }
            return value;
        };
        this.read2 = function (address) {
            return _this.memory[address] - 32768;
        };
        this.ptr = 0;
        this.register = [0, 0, 0, 0, 0, 0, 0, 0];
        this.stack = [];
        this.memory = [];
        for (var i = 0; i < buf.length; i += 2) {
            var l = buf.readUInt8(i);
            var h = buf.readUInt8(i + 1) & 0x7FFF;
            var v = (h << 8) + l;
            this.memory.push(v);
        }
    }
    return State;
}());
exports.State = State;
