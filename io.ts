import {readFileSync} from 'fs';
import * as path from 'path';

const debug = (msg: string) => console.log(msg);

export const readfile = (fn: string) => {
    const fp = path.join(__dirname, `./${fn}`);
    return readFileSync(fp);
}

export const print = (ascii: number): void => {
    process.stdout.write(String.fromCharCode(ascii));
}

export const log = (num: number) => {
    switch(num) {
        // case 0: debug('halt'); break;
        case 1: debug('set'); break;
        case 2: debug('push'); break;
        case 3: debug('pop'); break;
        case 4: debug('eq'); break;
        case 5: debug('gt'); break;
        // case 6: debug('jmp'); break;
        // case 7: debug('jt'); break;
        // case 8: debug('jf'); break;
        case 9: debug('add'); break;
        case 10: debug('mult'); break;
        case 11: debug('mod'); break;
        case 12: debug('and'); break;
        case 13: debug('or'); break;
        case 14: debug('not'); break;
        case 15: debug('rmen'); break;
        case 16: debug('wmen'); break;
        case 17: debug('call'); break;
        case 18: debug('ret'); break;
        // case 19: debug('out'); break;
        case 20: debug('in'); break;
        // case 21: debug('noop'); break;
    }
};