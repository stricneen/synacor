"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.printCommand = exports.print = exports.readfile = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const debug = (msg) => console.log(msg);
const readfile = (fn) => {
    const fp = path.join(__dirname, `./${fn}`);
    return fs_1.readFileSync(fp);
};
exports.readfile = readfile;
const print = (ascii) => {
    process.stdout.write(String.fromCharCode(ascii));
};
exports.print = print;
const commands = [
    { cmd: 0, name: 'halt', params: 0 },
    { cmd: 1, name: 'set', params: 2 },
    { cmd: 2, name: 'push', params: 1 },
    { cmd: 3, name: 'pop', params: 1 },
    { cmd: 4, name: 'eq', params: 3 },
    { cmd: 5, name: 'gt', params: 3 },
    { cmd: 6, name: 'jmp', params: 1 },
    { cmd: 7, name: 'jt', params: 2 },
    { cmd: 8, name: 'jf', params: 2 },
    { cmd: 9, name: 'add', params: 3 },
    { cmd: 10, name: 'mult', params: 3 },
    { cmd: 11, name: 'mod', params: 3 },
    { cmd: 12, name: 'and', params: 3 },
    { cmd: 13, name: 'or', params: 3 },
    { cmd: 14, name: 'not', params: 2 },
    { cmd: 15, name: 'rmem', params: 2 },
    { cmd: 16, name: 'wmem', params: 2 },
    { cmd: 17, name: 'call', params: 1 },
    { cmd: 18, name: 'ret', params: 0 },
    { cmd: 19, name: 'out', params: 1 },
    { cmd: 20, name: 'in', params: 1 },
    { cmd: 21, name: 'noop', params: 0 },
];
const printCommand = (state) => {
    const cmd = state.read(state.ptr);
    const command = commands.find(c => c.cmd === cmd);
    if (command === undefined)
        return;
    const args = [
        state.read(state.ptr + 1),
        state.read(state.ptr + 2),
        state.read(state.ptr + 3),
    ];
    const raw = [
        state.memory[state.ptr + 1],
        state.memory[state.ptr + 2],
        state.memory[state.ptr + 3],
    ];
    const opargs = args.slice(0, command?.params);
    const arg1 = state.read(state.ptr + 1);
    const arg2 = state.read(state.ptr + 2);
    const arg3 = state.read(state.ptr + 3);
    console.log(`${command?.name}\t(${state.ptr})\t${opargs}\t\t ${raw} \t\t${state.register} `);
};
exports.printCommand = printCommand;
const log = (num) => {
    switch (num) {
        // case 0: debug('halt'); break;
        case 1:
            debug('set');
            break;
        case 2:
            debug('push');
            break;
        case 3:
            debug('pop');
            break;
        case 4:
            debug('eq');
            break;
        case 5:
            debug('gt');
            break;
        case 6:
            debug('jmp');
            break;
        case 7:
            debug('jt');
            break;
        case 8:
            debug('jf');
            break;
        case 9:
            debug('add');
            break;
        case 10:
            debug('mult');
            break;
        case 11:
            debug('mod');
            break;
        case 12:
            debug('and');
            break;
        case 13:
            debug('or');
            break;
        case 14:
            debug('not');
            break;
        case 15:
            debug('rmen');
            break;
        case 16:
            debug('wmen');
            break;
        case 17:
            debug('call');
            break;
        case 18:
            debug('ret');
            break;
        case 19:
            debug('out');
            break;
        case 20:
            debug('in');
            break;
        case 21:
            debug('noop');
            break;
    }
};
exports.log = log;
