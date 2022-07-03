export type Asset = {
  tokenId: string;
  index?: number;
  amount: number;
  name?: string;
  decimals?: number;
  type?: string;
};

export type Subscriber = {
  ergoTree: string;
  trackAddress: string;
  triggerType: string;
  webhook?: string;
  handlerType: string;
  userId: string;
  label?: string;
};

export type AdditionalRegisters = {
  R4?: string;
  R5?: string;
  R6?: string;
  R7?: string;
  R8?: string;
  R9?: string;
};

export type InputBox = {
  boxId: string;
  spendingProof: {
    proofBytes: string;
    extension: any;
  };
};

export type OutputBox = {
  boxId: string;
  value: number;
  ergoTree: string;
  assets: Asset[];
  creationHeight: number;
  additionalRegisters: AdditionalRegisters;
  transactionId: string;
  index: number;
};

export type DataInput = {
  boxId: string;
};

export type NodeTransaction = {
  id: string;
  inputs: InputBox[];
  outputs: OutputBox[];
  dataInputs: DataInput[];
  size: number;
};

export type SerializedRegister = {
  serializedValue: string;
  sigmaType: string;
  renderedValue: string;
};

export type ExplorerBox = {
  additionalRegisters: AdditionalRegisters;
  value: number;
  creationHeight: number;
  ergoTree: string;
  assets: Asset[];
  boxId?: string;
  transactionId?: string;
  blockId?: string;
  extension?: {};
};

export type UtxoBoxAsset = Omit<Asset, 'amount'> & { amount: string };

export type UtxoBox = {
  boxId: string;
  value: number;
  ergoTree: string;
  assets: Asset[];
  creationHeight: number;
  transactionId: string;
  index: number;
  additionalRegisters: any;
  confirmed?: boolean;
};

export type TransactionJson = {
  inputs: {
    additionalRegisters: any;
    value: string;
    extension: {};
    creationHeight: number;
    ergoTree: string;
    assets: Asset[];
    boxId?: string | undefined;
    transactionId?: string | undefined;
    blockId?: string | undefined;
  }[];
  outputs: {
    additionalRegisters: any;
    value: string;
    extension: {};
    creationHeight: number;
    ergoTree: string;
    assets: Asset[];
    boxId?: string | undefined;
    transactionId?: string | undefined;
    blockId?: string | undefined;
  }[];
  fee: string;
  dataInputs: [];
};
