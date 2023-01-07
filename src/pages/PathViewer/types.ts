export interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}
export enum TransactionFlow {
  Incoming = "incoming",
  Outgoing = "outgoing",
}
export interface ProcessedTransaction extends EtherscanTransaction {
  valueInEth: number; // negative for outgoing, positive for incoming
  flow: TransactionFlow;
}

export interface AnalysisNode {
  id: string;
  address: string;
  transactions: {
    all: ProcessedTransaction[];
    incoming: ProcessedTransaction[];
    outgoing: ProcessedTransaction[];
  };
  incomingAmount: string;
  outgoingAmount: string;
  incomingEth: number;
  outgoingEth: number;
}
