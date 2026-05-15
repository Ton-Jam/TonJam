import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type Listing = {
    $$type: 'Listing';
    owner: Address;
    price: bigint;
}

export function storeListing(src: Listing) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeCoins(src.price);
    };
}

export function loadListing(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _price = sc_0.loadCoins();
    return { $$type: 'Listing' as const, owner: _owner, price: _price };
}

export function loadTupleListing(source: TupleReader) {
    const _owner = source.readAddress();
    const _price = source.readBigNumber();
    return { $$type: 'Listing' as const, owner: _owner, price: _price };
}

export function loadGetterTupleListing(source: TupleReader) {
    const _owner = source.readAddress();
    const _price = source.readBigNumber();
    return { $$type: 'Listing' as const, owner: _owner, price: _price };
}

export function storeTupleListing(source: Listing) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.price);
    return builder.build();
}

export function dictValueParserListing(): DictionaryValue<Listing> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeListing(src)).endCell());
        },
        parse: (src) => {
            return loadListing(src.loadRef().beginParse());
        }
    }
}

export type NFTHistory = {
    $$type: 'NFTHistory';
    previous_owner: Address;
    forward_payload: Cell;
}

export function storeNFTHistory(src: NFTHistory) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.previous_owner);
        b_0.storeRef(src.forward_payload);
    };
}

export function loadNFTHistory(slice: Slice) {
    const sc_0 = slice;
    const _previous_owner = sc_0.loadAddress();
    const _forward_payload = sc_0.loadRef();
    return { $$type: 'NFTHistory' as const, previous_owner: _previous_owner, forward_payload: _forward_payload };
}

export function loadTupleNFTHistory(source: TupleReader) {
    const _previous_owner = source.readAddress();
    const _forward_payload = source.readCell();
    return { $$type: 'NFTHistory' as const, previous_owner: _previous_owner, forward_payload: _forward_payload };
}

export function loadGetterTupleNFTHistory(source: TupleReader) {
    const _previous_owner = source.readAddress();
    const _forward_payload = source.readCell();
    return { $$type: 'NFTHistory' as const, previous_owner: _previous_owner, forward_payload: _forward_payload };
}

export function storeTupleNFTHistory(source: NFTHistory) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.previous_owner);
    builder.writeCell(source.forward_payload);
    return builder.build();
}

export function dictValueParserNFTHistory(): DictionaryValue<NFTHistory> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNFTHistory(src)).endCell());
        },
        parse: (src) => {
            return loadNFTHistory(src.loadRef().beginParse());
        }
    }
}

export type ListNFT = {
    $$type: 'ListNFT';
    query_id: bigint;
    nft_address: Address;
    price: bigint;
}

export function storeListNFT(src: ListNFT) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(505469326, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeAddress(src.nft_address);
        b_0.storeCoins(src.price);
    };
}

export function loadListNFT(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 505469326) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _nft_address = sc_0.loadAddress();
    const _price = sc_0.loadCoins();
    return { $$type: 'ListNFT' as const, query_id: _query_id, nft_address: _nft_address, price: _price };
}

export function loadTupleListNFT(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _nft_address = source.readAddress();
    const _price = source.readBigNumber();
    return { $$type: 'ListNFT' as const, query_id: _query_id, nft_address: _nft_address, price: _price };
}

export function loadGetterTupleListNFT(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _nft_address = source.readAddress();
    const _price = source.readBigNumber();
    return { $$type: 'ListNFT' as const, query_id: _query_id, nft_address: _nft_address, price: _price };
}

export function storeTupleListNFT(source: ListNFT) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeAddress(source.nft_address);
    builder.writeNumber(source.price);
    return builder.build();
}

export function dictValueParserListNFT(): DictionaryValue<ListNFT> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeListNFT(src)).endCell());
        },
        parse: (src) => {
            return loadListNFT(src.loadRef().beginParse());
        }
    }
}

export type BuyNFT = {
    $$type: 'BuyNFT';
    query_id: bigint;
    nft_address: Address;
}

export function storeBuyNFT(src: BuyNFT) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(112407828, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeAddress(src.nft_address);
    };
}

export function loadBuyNFT(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 112407828) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _nft_address = sc_0.loadAddress();
    return { $$type: 'BuyNFT' as const, query_id: _query_id, nft_address: _nft_address };
}

export function loadTupleBuyNFT(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _nft_address = source.readAddress();
    return { $$type: 'BuyNFT' as const, query_id: _query_id, nft_address: _nft_address };
}

export function loadGetterTupleBuyNFT(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _nft_address = source.readAddress();
    return { $$type: 'BuyNFT' as const, query_id: _query_id, nft_address: _nft_address };
}

export function storeTupleBuyNFT(source: BuyNFT) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeAddress(source.nft_address);
    return builder.build();
}

export function dictValueParserBuyNFT(): DictionaryValue<BuyNFT> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBuyNFT(src)).endCell());
        },
        parse: (src) => {
            return loadBuyNFT(src.loadRef().beginParse());
        }
    }
}

export type CancelSale = {
    $$type: 'CancelSale';
    query_id: bigint;
    nft_address: Address;
}

export function storeCancelSale(src: CancelSale) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1393330205, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeAddress(src.nft_address);
    };
}

export function loadCancelSale(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1393330205) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _nft_address = sc_0.loadAddress();
    return { $$type: 'CancelSale' as const, query_id: _query_id, nft_address: _nft_address };
}

export function loadTupleCancelSale(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _nft_address = source.readAddress();
    return { $$type: 'CancelSale' as const, query_id: _query_id, nft_address: _nft_address };
}

export function loadGetterTupleCancelSale(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _nft_address = source.readAddress();
    return { $$type: 'CancelSale' as const, query_id: _query_id, nft_address: _nft_address };
}

export function storeTupleCancelSale(source: CancelSale) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeAddress(source.nft_address);
    return builder.build();
}

export function dictValueParserCancelSale(): DictionaryValue<CancelSale> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCancelSale(src)).endCell());
        },
        parse: (src) => {
            return loadCancelSale(src.loadRef().beginParse());
        }
    }
}

export type OwnershipAssigned = {
    $$type: 'OwnershipAssigned';
    query_id: bigint;
    prev_owner: Address;
    forward_payload: Slice;
}

export function storeOwnershipAssigned(src: OwnershipAssigned) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3788238085, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeAddress(src.prev_owner);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadOwnershipAssigned(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3788238085) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _prev_owner = sc_0.loadAddress();
    const _forward_payload = sc_0;
    return { $$type: 'OwnershipAssigned' as const, query_id: _query_id, prev_owner: _prev_owner, forward_payload: _forward_payload };
}

export function loadTupleOwnershipAssigned(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _prev_owner = source.readAddress();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'OwnershipAssigned' as const, query_id: _query_id, prev_owner: _prev_owner, forward_payload: _forward_payload };
}

export function loadGetterTupleOwnershipAssigned(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _prev_owner = source.readAddress();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'OwnershipAssigned' as const, query_id: _query_id, prev_owner: _prev_owner, forward_payload: _forward_payload };
}

export function storeTupleOwnershipAssigned(source: OwnershipAssigned) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeAddress(source.prev_owner);
    builder.writeSlice(source.forward_payload.asCell());
    return builder.build();
}

export function dictValueParserOwnershipAssigned(): DictionaryValue<OwnershipAssigned> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeOwnershipAssigned(src)).endCell());
        },
        parse: (src) => {
            return loadOwnershipAssigned(src.loadRef().beginParse());
        }
    }
}

export type Transfer = {
    $$type: 'Transfer';
    query_id: bigint;
    new_owner: Address;
    response_destination: Address | null;
    custom_payload: Cell | null;
    forward_amount: bigint;
    forward_payload: Slice;
}

export function storeTransfer(src: Transfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1312029976, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeAddress(src.new_owner);
        b_0.storeAddress(src.response_destination);
        if (src.custom_payload !== null && src.custom_payload !== undefined) { b_0.storeBit(true).storeRef(src.custom_payload); } else { b_0.storeBit(false); }
        b_0.storeCoins(src.forward_amount);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1312029976) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _new_owner = sc_0.loadAddress();
    const _response_destination = sc_0.loadMaybeAddress();
    const _custom_payload = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _forward_amount = sc_0.loadCoins();
    const _forward_payload = sc_0;
    return { $$type: 'Transfer' as const, query_id: _query_id, new_owner: _new_owner, response_destination: _response_destination, custom_payload: _custom_payload, forward_amount: _forward_amount, forward_payload: _forward_payload };
}

export function loadTupleTransfer(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _new_owner = source.readAddress();
    const _response_destination = source.readAddressOpt();
    const _custom_payload = source.readCellOpt();
    const _forward_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'Transfer' as const, query_id: _query_id, new_owner: _new_owner, response_destination: _response_destination, custom_payload: _custom_payload, forward_amount: _forward_amount, forward_payload: _forward_payload };
}

export function loadGetterTupleTransfer(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _new_owner = source.readAddress();
    const _response_destination = source.readAddressOpt();
    const _custom_payload = source.readCellOpt();
    const _forward_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'Transfer' as const, query_id: _query_id, new_owner: _new_owner, response_destination: _response_destination, custom_payload: _custom_payload, forward_amount: _forward_amount, forward_payload: _forward_payload };
}

export function storeTupleTransfer(source: Transfer) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeAddress(source.new_owner);
    builder.writeAddress(source.response_destination);
    builder.writeCell(source.custom_payload);
    builder.writeNumber(source.forward_amount);
    builder.writeSlice(source.forward_payload.asCell());
    return builder.build();
}

export function dictValueParserTransfer(): DictionaryValue<Transfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadTransfer(src.loadRef().beginParse());
        }
    }
}

export type TonJamMarketplace$Data = {
    $$type: 'TonJamMarketplace$Data';
    owner: Address;
    fee_destination: Address;
    fee_percentage: bigint;
    listings: Dictionary<Address, Listing>;
    nft_histories: Dictionary<Address, NFTHistory>;
}

export function storeTonJamMarketplace$Data(src: TonJamMarketplace$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.fee_destination);
        b_0.storeUint(src.fee_percentage, 16);
        b_0.storeDict(src.listings, Dictionary.Keys.Address(), dictValueParserListing());
        b_0.storeDict(src.nft_histories, Dictionary.Keys.Address(), dictValueParserNFTHistory());
    };
}

export function loadTonJamMarketplace$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _fee_destination = sc_0.loadAddress();
    const _fee_percentage = sc_0.loadUintBig(16);
    const _listings = Dictionary.load(Dictionary.Keys.Address(), dictValueParserListing(), sc_0);
    const _nft_histories = Dictionary.load(Dictionary.Keys.Address(), dictValueParserNFTHistory(), sc_0);
    return { $$type: 'TonJamMarketplace$Data' as const, owner: _owner, fee_destination: _fee_destination, fee_percentage: _fee_percentage, listings: _listings, nft_histories: _nft_histories };
}

export function loadTupleTonJamMarketplace$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _fee_destination = source.readAddress();
    const _fee_percentage = source.readBigNumber();
    const _listings = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserListing(), source.readCellOpt());
    const _nft_histories = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserNFTHistory(), source.readCellOpt());
    return { $$type: 'TonJamMarketplace$Data' as const, owner: _owner, fee_destination: _fee_destination, fee_percentage: _fee_percentage, listings: _listings, nft_histories: _nft_histories };
}

export function loadGetterTupleTonJamMarketplace$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _fee_destination = source.readAddress();
    const _fee_percentage = source.readBigNumber();
    const _listings = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserListing(), source.readCellOpt());
    const _nft_histories = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserNFTHistory(), source.readCellOpt());
    return { $$type: 'TonJamMarketplace$Data' as const, owner: _owner, fee_destination: _fee_destination, fee_percentage: _fee_percentage, listings: _listings, nft_histories: _nft_histories };
}

export function storeTupleTonJamMarketplace$Data(source: TonJamMarketplace$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.fee_destination);
    builder.writeNumber(source.fee_percentage);
    builder.writeCell(source.listings.size > 0 ? beginCell().storeDictDirect(source.listings, Dictionary.Keys.Address(), dictValueParserListing()).endCell() : null);
    builder.writeCell(source.nft_histories.size > 0 ? beginCell().storeDictDirect(source.nft_histories, Dictionary.Keys.Address(), dictValueParserNFTHistory()).endCell() : null);
    return builder.build();
}

export function dictValueParserTonJamMarketplace$Data(): DictionaryValue<TonJamMarketplace$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTonJamMarketplace$Data(src)).endCell());
        },
        parse: (src) => {
            return loadTonJamMarketplace$Data(src.loadRef().beginParse());
        }
    }
}

 type TonJamMarketplace_init_args = {
    $$type: 'TonJamMarketplace_init_args';
    owner: Address;
    fee_destination: Address;
    fee_percentage: bigint;
}

function initTonJamMarketplace_init_args(src: TonJamMarketplace_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.fee_destination);
        b_0.storeInt(src.fee_percentage, 257);
    };
}

async function TonJamMarketplace_init(owner: Address, fee_destination: Address, fee_percentage: bigint) {
    const __code = Cell.fromHex('b5ee9c72410211010004de000114ff00f4a413f4bcf2c80b01020162020c04e4d001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200019efa40fa40d30ff404f40455406c158e10fa40fa40810101d700552003d1586d6de206925f06e004d70d1ff2e082218210e1cbed05bae30221821006b33514bae302218210530c881dbae302018210946a98b6ba0305080b01da31d33ffa40f842c822cf16c92381010b02c85902ceccc922103b01206e953059f45930944133f413e221d749c21f8e2333fa00300181010b02c85902ce01fa02c910364170206e953059f45930944133f413e2e30e440302c87f01ca0055405045ce12cecb0ff400f400c9ed540400dc317080406d228b0826105804075520c8555082104e33fd185007cb1f15cb3f13ce01206e9430cf84809201cee2f40001fa02cec91843305a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb000301fe31d33ffa4030f8416f2430322781010b2459f40b6fa192306ddf206e92306d9ad0fa40fa00596c126f02e28200d085216eb3f2f46f228200ca2a5141be14f2f45325a8812710a9045133a1716d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f4000601fcc901fb005252716d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb007080406d228b0825105804065520c8555082104e33fd185007cb1f15cb3f13ce01206e9430cf84809201cee2f40001fa02cec92244445a6d6d40037fc8cf85800700d8ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0081010b6dc8216e925b6d9b016f22585902ce01fa02c9e2103612206e953059f45930944133f413e2440302c87f01ca0055405045ce12cecb0ff400f400c9ed5401b831d33ffa4030f8416f2410235f032681010b2359f40b6fa192306ddf206e92306d9ad0fa40fa00596c126f02e28200d085216eb3f2f46f22308200c2415321c70592327f945127c705e212f2f47080406d228b0825105804065520c80901ee555082104e33fd185007cb1f15cb3f13ce01206e9430cf84809201cee2f40001fa02cec92244445a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0081010b6dc8216e925b6d9b016f22585902ce01fa02c9e21036120a004c206e953059f45930944133f413e2440302c87f01ca0055405045ce12cecb0ff400f400c9ed5400aa8e4dd33f30c8018210aff90f5758cb1fcb3fc910354430f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055405045ce12cecb0ff400f400c9ed54e05f06f2c0820201200d0f015dbcdb876a268690000cf7d207d206987fa027a022aa0360ac7087d207d20408080eb802a9001e8ac36b6f16d9e3628c0e0018c825cf1624cf165230cb0fc90183beb9176a268690000cf7d207d206987fa027a022aa0360ac7087d207d20408080eb802a9001e8ac36b6f12a826d9e36289037491836ca37913781711037491836ef410003e81010b230259f40b6fa192306ddf206e92306d9ad0fa40fa00596c126f02e2a9137081');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initTonJamMarketplace_init_args({ $$type: 'TonJamMarketplace_init_args', owner, fee_destination, fee_percentage })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const TonJamMarketplace_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    49729: { message: "Unauthorized" },
    51754: { message: "Insufficient funds" },
    53381: { message: "NFT not listed" },
} as const

export const TonJamMarketplace_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Unauthorized": 49729,
    "Insufficient funds": 51754,
    "NFT not listed": 53381,
} as const

const TonJamMarketplace_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Listing","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"price","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"NFTHistory","header":null,"fields":[{"name":"previous_owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"forward_payload","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"ListNFT","header":505469326,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nft_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"price","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"BuyNFT","header":112407828,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nft_address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"CancelSale","header":1393330205,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nft_address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"OwnershipAssigned","header":3788238085,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"prev_owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"forward_payload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"Transfer","header":1312029976,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"new_owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"response_destination","type":{"kind":"simple","type":"address","optional":true}},{"name":"custom_payload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forward_amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forward_payload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"TonJamMarketplace$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"fee_destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"fee_percentage","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"listings","type":{"kind":"dict","key":"address","value":"Listing","valueFormat":"ref"}},{"name":"nft_histories","type":{"kind":"dict","key":"address","value":"NFTHistory","valueFormat":"ref"}}]},
]

const TonJamMarketplace_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ListNFT": 505469326,
    "BuyNFT": 112407828,
    "CancelSale": 1393330205,
    "OwnershipAssigned": 3788238085,
    "Transfer": 1312029976,
}

const TonJamMarketplace_getters: ABIGetter[] = [
    {"name":"get_listing","methodId":120610,"arguments":[{"name":"nft_address","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"Listing","optional":true}},
    {"name":"get_marketplace_data","methodId":72560,"arguments":[],"returnType":{"kind":"simple","type":"cell","optional":false}},
]

export const TonJamMarketplace_getterMapping: { [key: string]: string } = {
    'get_listing': 'getGetListing',
    'get_marketplace_data': 'getGetMarketplaceData',
}

const TonJamMarketplace_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"OwnershipAssigned"}},
    {"receiver":"internal","message":{"kind":"typed","type":"BuyNFT"}},
    {"receiver":"internal","message":{"kind":"typed","type":"CancelSale"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class TonJamMarketplace implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = TonJamMarketplace_errors_backward;
    public static readonly opcodes = TonJamMarketplace_opcodes;
    
    static async init(owner: Address, fee_destination: Address, fee_percentage: bigint) {
        return await TonJamMarketplace_init(owner, fee_destination, fee_percentage);
    }
    
    static async fromInit(owner: Address, fee_destination: Address, fee_percentage: bigint) {
        const __gen_init = await TonJamMarketplace_init(owner, fee_destination, fee_percentage);
        const address = contractAddress(0, __gen_init);
        return new TonJamMarketplace(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new TonJamMarketplace(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  TonJamMarketplace_types,
        getters: TonJamMarketplace_getters,
        receivers: TonJamMarketplace_receivers,
        errors: TonJamMarketplace_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: OwnershipAssigned | BuyNFT | CancelSale | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'OwnershipAssigned') {
            body = beginCell().store(storeOwnershipAssigned(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'BuyNFT') {
            body = beginCell().store(storeBuyNFT(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CancelSale') {
            body = beginCell().store(storeCancelSale(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetListing(provider: ContractProvider, nft_address: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(nft_address);
        const source = (await provider.get('get_listing', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTupleListing(result_p) : null;
        return result;
    }
    
    async getGetMarketplaceData(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_marketplace_data', builder.build())).stack;
        const result = source.readCell();
        return result;
    }
    
}