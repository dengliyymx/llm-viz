import { TipPos, Tooltip } from '@/src/utils/Tooltip';
import { isNil, isNotNil } from '@/src/utils/data';
import clsx from 'clsx';
import React, { useMemo } from 'react';

// Want a nice html view of an instruction, showing the bit encoding, the nmemonic, and the description.

// Like how the RiscvInsDecode component is rendered

export const InstructionTable: React.FC<{
    children?: React.ReactNode;
}> = ({ children }) => {
    return <div className='mx-8 my-4 self-center bg-slate-200 py-2 px-4 max-sm:scale-75'>
        {children}
    </div>;
};

export const InstructionDetail: React.FC<{
    name: string;
    isHeader?: boolean;
    wrap?: boolean;
    children?: React.ReactNode;
}> = ({ name, wrap, isHeader }) => {

    // let's render an r-type instruction first
    let allInstructions = useMemo(() => makeInstructions(), []);

    let ins = allInstructions.find(x => x.name === name || x.mnemonics.some(m => m.name === name));

    if (!ins) {
        return <div>Unknown instruction: {name}</div>;
    }

    let mnemonic = ins.mnemonics.find(x => x.name === name) ?? ins.mnemonics[0];

    let bitNodes = bitRangesToNodes(ins, mnemonic);

    if (isHeader) {
        bitNodes = joinSameBitRanges(bitNodes);
    }

    return <div className={clsx('flex font-mono', wrap && 'bg-slate-200 px-4 py-2 m-4')}>
        <div className='w-[15rem] flex'>
            {isHeader && <Tooltip tip={"Name in RISC-V Assembly"} pos={1}>
                <div className='text-base font-normal italic top-1 relative block'>mnemonic</div>
            </Tooltip>}
            {!isHeader && <>
                <span className='pr-1'>{mnemonic.name.padEnd(5,'\u00a0')}</span>
                {ins.fields.map((field, i) => {
                    return <span key={i} className={clsx('px-1', bitRangeTypeColor(field.type))}>{field.name}</span>;
                })}
            </>}
        </div>
        <span className='ml-4'>
            {bitNodes.map((node, i) => {
                let type = node.section?.type ?? BitRangeType.Code;
                let valStr = bitRangeToChar(type).repeat(node.nBits);
                let explicitValue = isNotNil(node.value);
                if (explicitValue && isNotNil(node.value)) {
                    valStr = node.value.toString(2).padStart(node.nBits, '0').slice(0, node.nBits);
                }
                return <span key={i} className={clsx(bitRangeTypeColor(type, node.muted), explicitValue ? 'font-bold' : '', isHeader && 'relative inline-flex justify-center')}>
                    <span style={{ visibility: isHeader ? 'hidden' : undefined }}>{valStr}</span>
                    {isHeader && <Tooltip tip={node.section?.desc} pos={1}>
                        <div className='text-base absolute top-1 left-1/2 -translate-x-1/2 text-center font-normal italic'>{node.section?.name}</div>
                    </Tooltip>}
                </span>;
            })}
        </span>
    </div>;
};

function joinSameBitRanges(nodes: IBitNode[]): IBitNode[] {
    let joined: IBitNode[] = [];
    let last: IBitNode | null = null;
    for (let node of nodes) {
        if (last && last.section?.name === node.section?.name && last.range.lo === node.range.hi + 1) {
            last.nBits += node.nBits;
            last.range.lo = node.range.lo;
        } else {
            last && joined.push(last);
            last = { ...node };
        }
    }
    last && joined.push(last);
    return joined;
}

interface IInsStructure {
    name: string;
    sections: IInsBitRep[];
    mnemonics: IMnemonic[];
    fields: IInsField[];
}

interface IMnemonic {
    name: string;
    title: React.ReactNode;
    desc?: React.ReactNode;
    vals?: IValueOverride[];
}

interface IValueOverride {
    section: BitRangeType;
    value?: number;
    muteAll?: boolean;
}

interface IInsField {
    name: string;
    description: React.ReactNode;
    type: BitRangeType;
}

interface IInsBitRep {
    type: BitRangeType;
    name: string;
    desc: string;
    bitRange: IBitRange | IBitRange[];
    value?: number;
}

enum BitRangeType {
    Code,
    Funct3,
    Funct7,
    Rd,
    Rs1,
    Rs2,
    Imm,
}

interface IBitNode {
    range: IBitRange;
    nBits: number;
    srcIdx: number;
    section?: IInsBitRep;
    subIdx: number;
    value?: number;
    muted: boolean;
}

function bitRangesToNodes(ins: IInsStructure, mnemonic?: IMnemonic): IBitNode[] {

    let subRanges = ins.sections.flatMap((x, i) => {
        let bitOffset = 0;
        let ranges = Array.isArray(x.bitRange) ? x.bitRange : [x.bitRange];
        let totalBits = ranges.reduce((acc, r) => acc + r.hi - r.lo + 1, 0);
        return ranges.map((r, j) => {
            let localBitOffset = bitOffset;
            bitOffset += r.hi - r.lo + 1;
            return { range: r, srcIdx: i, subIdx: j, bitOffset: localBitOffset, totalBits };
        });
    });

    subRanges = subRanges.sort((a, b) => b.range.hi - a.range.hi);

    let topBit = 32;

    let nodes: IBitNode[] = [];

    for (let range of subRanges) {
        if (range.range.hi < topBit - 1) {
            nodes.push({ nBits: topBit - range.range.hi - 1, srcIdx: -1, subIdx: -1, range: { lo: range.range.hi + 1, hi: topBit - 1 }, muted: false });
            topBit = range.range.hi + 1;
        }

        let nBits = range.range.hi - range.range.lo + 1;
        let section = ins.sections[range.srcIdx];
        let value = section.value;
        let allMuted = false;
        if (mnemonic && mnemonic.vals) {
            let valueOverride = mnemonic.vals.find(x => x.section === section.type);
            if (valueOverride) {
                value = valueOverride.value ?? 0;
                let fullStr = value.toString(2).padStart(range.totalBits, '0');
                value = parseInt(fullStr.slice(range.bitOffset, range.bitOffset + nBits), 2);
                allMuted = valueOverride.muteAll ?? false;
            }
        }
        nodes.push({ nBits, srcIdx: range.srcIdx, section, subIdx: range.subIdx, range: range.range, value, muted: allMuted ? true : range.range.muted ?? false });
        topBit = range.range.lo;
    }

    return nodes;
}

function bitRangeTypeColor(type: BitRangeType, muted?: boolean) {
    switch (type) {
        case BitRangeType.Code: return 'text-red-600';
        case BitRangeType.Funct3: return muted ? 'text-gray-400' : 'text-black';
        case BitRangeType.Funct7: return muted ? 'text-gray-400' : 'text-black';
        case BitRangeType.Imm: return 'text-purple-600';
        case BitRangeType.Rd: return 'text-yellow-600';
        case BitRangeType.Rs1: return 'text-green-600';
        case BitRangeType.Rs2: return 'text-blue-600';
        default: return 'text-black';
    }
}

function bitRangeToChar(type: BitRangeType) {
    switch (type) {
        case BitRangeType.Rd: return 'd';
        case BitRangeType.Rs1: return 'a';
        case BitRangeType.Rs2: return 'b';
        case BitRangeType.Imm: return 'i';
        default: return 'x';
    }
}

function makeInstructions() {
    function withVal(x: IInsBitRep, value: number) {
        return { ...x, value };
    }

    let codeRange: IInsBitRep = {
        type: BitRangeType.Code,
        name: 'code',
        desc: 'Instruction code',
        bitRange: { lo: 0, hi: 6 },
    };

    let rdRange: IInsBitRep = {
        type: BitRangeType.Rd,
        name: 'rd',
        desc: 'Destination register',
        bitRange: { lo: 7, hi: 11 },
    };

    let rs1Range: IInsBitRep = {
        type: BitRangeType.Rs1,
        name: 'rs1',
        desc: 'Source register 1',
        bitRange: { lo: 15, hi: 19 },
    };

    let rs2Range: IInsBitRep = {
        type: BitRangeType.Rs2,
        name: 'rs2',
        desc: 'Source register 2',
        bitRange: { lo: 20, hi: 24 },
    };

    let imm12Range: IInsBitRep = {
        type: BitRangeType.Imm,
        name: 'imm12',
        desc: 'Immediate value (12 bits)',
        bitRange: { lo: 20, hi: 31 },
    };

    let imm12StoreRange: IInsBitRep = {
        type: BitRangeType.Imm,
        name: 'imm12',
        desc: 'Immediate value (12 bits)',
        bitRange: [
            { lo: 7, hi: 11 },
            { lo: 25, hi: 31 },
        ],
    };

    let imm12BranchRange: IInsBitRep = {
        type: BitRangeType.Imm,
        name: 'imm12',
        desc: 'Immediate value (12 bits)',
        bitRange: [
            { lo: 8, hi: 13 },
            { lo: 25, hi: 30 },
            { lo: 7, hi: 7 },
            { lo: 31, hi: 31 },
        ],
    };

    let imm12JalrRange: IInsBitRep = {
        type: BitRangeType.Imm,
        name: 'imm12',
        desc: 'Immediate value (12 bits)',
        bitRange: { lo: 20, hi: 31 },
    };

    let imm20Range: IInsBitRep = {
        type: BitRangeType.Imm,
        name: 'imm20',
        desc: 'Immediate value (20 bits)',
        bitRange: { lo: 12, hi: 31 },
    };

    let imm20JalRange: IInsBitRep = {
        type: BitRangeType.Imm,
        name: 'imm20',
        desc: 'Immediate value (20 bits)',
        bitRange: [
            { lo: 21, hi: 30 },
            { lo: 20, hi: 20 },
            { lo: 12, hi: 19 },
            { lo: 31, hi: 31 },
        ]
    };

    let funct3Range: IInsBitRep = {
        type: BitRangeType.Funct3,
        name: 'func3',
        desc: 'Function code (3 bits)',
        bitRange: { lo: 12, hi: 14 },
    };

    let funct7Range: IInsBitRep = {
        type: BitRangeType.Funct7,
        name: 'func7',
        desc: 'Function code (7 bits)',
        bitRange: [
            { lo: 31, hi: 31, muted: true },
            { lo: 30, hi: 30 },
            { lo: 25, hi: 29, muted: true },
        ],
        value: 0b000_0000,
    };

    let shamtRange: IInsBitRep = {
        type: BitRangeType.Imm,
        name: 'shamt',
        desc: 'Shift amount (5 bits)',
        bitRange: { lo: 20, hi: 24 },
    };

    function rTypeVals(funct3: number, funct7?: number, muteAll?: boolean) {
        let vals: IValueOverride[] = [
            { section: BitRangeType.Funct3, value: funct3 },
            { section: BitRangeType.Funct7, value: funct7, muteAll: muteAll ?? isNil(funct7) },
        ];
        return vals;
    }

    let rType: IInsStructure = {
        name: 'r-type',
        sections: [withVal(codeRange, 0b011_0011), rdRange, funct3Range, funct7Range, rs1Range, rs2Range],
        mnemonics: [
            { name: 'add',  vals: rTypeVals(0b000, 0b000_0000), title: 'Addition' },
            { name: 'sub',  vals: rTypeVals(0b000, 0b010_0000), title: 'Subtraction' },
            { name: 'sll',  vals: rTypeVals(0b001),             title: 'Shift Left (logical)' },
            { name: 'slt',  vals: rTypeVals(0b010),             title: 'Set Less Than', desc: 'Set rd to 1 if rs1 < rs2 (signed comparison), otherwise set to 0' },
            { name: 'sltu', vals: rTypeVals(0b011),             title: 'Set Less Than (unsigned)' },
            { name: 'xor',  vals: rTypeVals(0b100),             title: 'Bitwise XOR' },
            { name: 'srl',  vals: rTypeVals(0b101, 0b000_0000), title: 'Shift Right (logical)' },
            { name: 'sra',  vals: rTypeVals(0b101, 0b010_0000), title: 'Shift Right (arithmetic)' },
            { name: 'or',   vals: rTypeVals(0b110),             title: 'Bitwise OR' },
            { name: 'and',  vals: rTypeVals(0b111),             title: 'Bitwise AND' },
        ],
        fields: [
            { type: BitRangeType.Rd,  name: 'rd', description: 'Destination register' },
            { type: BitRangeType.Rs1, name: 'rs1', description: 'Source register 1' },
            { type: BitRangeType.Rs2, name: 'rs2', description: 'Source register 2' },
        ],
    };

    let iType: IInsStructure = {
        name: 'i-type',
        sections: [withVal(codeRange, 0b001_0011), rdRange, funct3Range, rs1Range, imm12Range],
        mnemonics: [
            { name: 'addi',  vals: rTypeVals(0b000), title: 'Add Immediate' },
            { name: 'slti',  vals: rTypeVals(0b010), title: 'Set Less Than Immediate' },
            { name: 'sltiu', vals: rTypeVals(0b011), title: 'Set Less Than (unsigned) Immediate' },
            { name: 'xori',  vals: rTypeVals(0b100), title: 'Bitwise XOR Immediate' },
            { name: 'ori',   vals: rTypeVals(0b110), title: 'Bitwise OR Immediate' },
            { name: 'andi',  vals: rTypeVals(0b111), title: 'Bitwise AND Immediate' },
        ],
        fields: [
            { type: BitRangeType.Rd,  name: 'rd', description: 'Destination register' },
            { type: BitRangeType.Rs1, name: 'rs1', description: 'Source register 1' },
            { type: BitRangeType.Imm, name: 'imm', description: 'Immediate value' },
        ],
    };

    let iTypeShift: IInsStructure = {
        name: 'i-type-shift',
        sections: [withVal(codeRange, 0b001_0011), rdRange, funct3Range, rs1Range, funct7Range, shamtRange],
        mnemonics: [
            { name: 'slli',  vals: rTypeVals(0b001, 0b000_0000, true), title: 'Shift Left Logical Immediate' },
            { name: 'srli',  vals: rTypeVals(0b101, 0b000_0000), title: 'Shift Right Logical Immediate' },
            { name: 'srai',  vals: rTypeVals(0b101, 0b010_0000), title: 'Shift Right Arithmetic Immediate' },
        ],
        fields: [
            { type: BitRangeType.Rd,  name: 'rd', description: 'Destination register' },
            { type: BitRangeType.Rs1, name: 'rs1', description: 'Source register 1' },
            { type: BitRangeType.Imm, name: 'imm', description: 'Immediate value' },
        ],
    };

    let bType: IInsStructure = {
        name: 'b-type',
        sections: [withVal(codeRange, 0b110_0011), funct3Range, rs1Range, rs2Range, imm12BranchRange],
        mnemonics: [
            { name: 'beq',  vals: rTypeVals(0b000), title: 'Branch if Equal' },
            { name: 'bne',  vals: rTypeVals(0b001), title: 'Branch if Not Equal' },
            { name: 'blt',  vals: rTypeVals(0b100), title: 'Branch if Less Than' },
            { name: 'bge',  vals: rTypeVals(0b101), title: 'Branch if Greater Than or Equal' },
            { name: 'bltu', vals: rTypeVals(0b110), title: 'Branch if Less Than (unsigned)' },
            { name: 'bgeu', vals: rTypeVals(0b111), title: 'Branch if Greater Than or Equal (unsigned)' },
        ],
        fields: [
            { type: BitRangeType.Rs1, name: 'rs1', description: 'Source register 1' },
            { type: BitRangeType.Rs2, name: 'rs2', description: 'Source register 2' },
            { type: BitRangeType.Imm, name: 'imm', description: 'Immediate value' },
        ],
    };

    let jalType: IInsStructure = {
        name: 'jal-type',
        sections: [withVal(codeRange, 0b110_1111), rdRange, imm20JalRange],
        mnemonics: [
            { name: 'jal', title: 'Jump and Link' },
        ],
        fields: [
            { type: BitRangeType.Rd,  name: 'rd', description: 'Destination register' },
            { type: BitRangeType.Imm, name: 'imm', description: 'Immediate value' },
        ],
    };

    let jalrType: IInsStructure = {
        name: 'jalr-type',
        sections: [withVal(codeRange, 0b110_0111), rdRange, rs1Range, imm12JalrRange, withVal(funct3Range, 0)],
        mnemonics: [
            { name: 'jalr', title: 'Jump and Link Register', vals: [{ section: BitRangeType.Funct3, muteAll: true }] },
        ],
        fields: [
            { type: BitRangeType.Rd,  name: 'rd', description: 'Destination register' },
            { type: BitRangeType.Rs1, name: 'rs1', description: 'Source register 1' },
            { type: BitRangeType.Imm, name: 'imm', description: 'Immediate value' },
        ],
    };

    let uType: IInsStructure = {
        name: 'u-type',
        sections: [codeRange, rdRange, imm20Range],
        mnemonics: [
            { name: 'lui', title: 'Load Upper Immediate', vals: [{ section: BitRangeType.Code, value: 0b011_0111 }] },
            { name: 'auipc', title: 'Add Upper Immediate to PC', vals: [{ section: BitRangeType.Code, value: 0b001_0111 }] },
        ],
        fields: [
            { type: BitRangeType.Rd,  name: 'rd', description: 'Destination register' },
            { type: BitRangeType.Imm, name: 'imm', description: 'Immediate value' },
        ],
    };

    let loadType: IInsStructure = {
        name: 'load-type',
        sections: [withVal(codeRange, 0b000_0011), rdRange, funct3Range, rs1Range, imm12Range],
        mnemonics: [
            { name: 'lb',  vals: rTypeVals(0b000), title: 'Load Byte' },
            { name: 'lh',  vals: rTypeVals(0b001), title: 'Load Halfword' },
            { name: 'lw',  vals: rTypeVals(0b010), title: 'Load Word' },
            { name: 'lbu', vals: rTypeVals(0b100), title: 'Load Byte (unsigned)' },
            { name: 'lhu', vals: rTypeVals(0b101), title: 'Load Halfword (unsigned)' },
        ],
        fields: [
            { type: BitRangeType.Rd,  name: 'rd', description: 'Destination register' },
            { type: BitRangeType.Rs1, name: 'rs1', description: 'Source register 1' },
            { type: BitRangeType.Imm, name: 'imm', description: 'Immediate value' },
        ],
    };

    let storeType: IInsStructure = {
        name: 'store-type',
        sections: [withVal(codeRange, 0b010_0011), funct3Range, rs1Range, rs2Range, imm12StoreRange],
        mnemonics: [
            { name: 'sb', vals: rTypeVals(0b000), title: 'Store Byte' },
            { name: 'sh', vals: rTypeVals(0b001), title: 'Store Halfword' },
            { name: 'sw', vals: rTypeVals(0b010), title: 'Store Word' },
        ],
        fields: [
            { type: BitRangeType.Rs1, name: 'rs1', description: 'Source register 1' },
            { type: BitRangeType.Rs2, name: 'rs2', description: 'Source register 2' },
            { type: BitRangeType.Imm, name: 'imm', description: 'Immediate value' },
        ],
    };

    return [rType, iType, iTypeShift, bType, jalType, jalrType, uType, loadType, storeType];
}

interface IBitRange {
    lo: number; // inclusive
    hi: number; // inclusive
    muted?: boolean;
}
