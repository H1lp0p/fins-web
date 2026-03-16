import type {PageTransactionOperation} from './PageTransactionOperation';
interface ServerSnapshotPayload {
  'type': 'snapshot';
  'accountId': string;
  'page': PageTransactionOperation;
  'additionalProperties'?: Map<string, any>;
}
export type { ServerSnapshotPayload };