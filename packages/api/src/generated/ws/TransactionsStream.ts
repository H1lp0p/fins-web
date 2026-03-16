import type {ServerSnapshotPayload} from './ServerSnapshotPayload';
import type {ServerTransactionPayload} from './ServerTransactionPayload';
import type {ServerErrorPayload} from './ServerErrorPayload';
type TransactionsStream = ServerSnapshotPayload | ServerTransactionPayload | ServerErrorPayload;
export type { TransactionsStream };