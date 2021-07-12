
export class State {
    public ptr: number;
    public register: number[];
    public stack: number[];
    public memory: number[];

    public terminate: number;

    constructor(buf: Buffer) {
        this.ptr = 0;
        this.register = [0, 0, 0, 0, 0, 0, 0, 0];
        this.stack = [];
        this.memory = [];
        this.terminate = 2;
        for (let i = 0; i < buf.length ; i+=2) {
            const l = buf.readUInt8(i);
            const h = buf.readUInt8(i+1) & 0x7FFF;
            const v = (h << 8) + l;
            this.memory.push(v);
        }            
    }

    read = (address: number) => {
        const value = this.memory[address];
        if (value >= 32768 && value <= 32775) {
            return this.register[value - 32768];
        }
        return value;
    }

    read2 = (address: number) => {
        return this.memory[address] - 32768;
    }

    
    // r3 = () => {
    //     // const or = this.ptr + 1;
    //     return this.memory[this.ptr + 1] - 32768;
    // }
}
