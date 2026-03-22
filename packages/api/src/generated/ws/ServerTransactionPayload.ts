import type {TransactionOperation} from './TransactionOperation';
interface ServerTransactionPayload {
  'type': 'transaction';
  'accountId': string;
  'operation': TransactionOperation;
  'additionalProperties'?: Map<string, any>;
}
export type { ServerTransactionPayload };