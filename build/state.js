"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
class State {
    constructor(buf) {
        this.read = (address) => {
            const value = this.memory[address];
            if (value >= 32768 && value <= 32775) {
                return this.register[value - 32768];
            }
            return value;
        };
        this.read2 = (address) => {
            return this.memory[address] - 32768;
        };
        this.ptr = 0;
        this.register = [0, 0, 0, 0, 0, 0, 0, 0];
        this.stack = [];
        this.memory = [];
        this.terminate = 2;
        for (let i = 0; i < buf.length; i += 2) {
            const l = buf.readUInt8(i);
            const h = buf.readUInt8(i + 1) & 0x7FFF;
            const v = (h << 8) + l;
            this.memory.push(v);
        }
    }
}
exports.State = State;
