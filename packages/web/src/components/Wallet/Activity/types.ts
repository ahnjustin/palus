export interface Transaction {
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  isError: string;
  type: string;
  blockNumber: string;
  input?: string;
  confirmations?: string;
}

export interface TransactionsResponse {
  status: string;
  message: string;
  result: Transaction[];
}

export interface ActivityProps {
  account: string;
}

export interface BlockRange {
  endBlock: number;
  startBlock: number;
  startBlockTimestamp: number;
}
