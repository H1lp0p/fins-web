import type {TransactionOperation} from './TransactionOperation';
import type {SortObject} from './SortObject';
import type {PageableObject} from './PageableObject';
interface PageTransactionOperation {
  'totalPages'?: number;
  'totalElements'?: number;
  'size'?: number;
  'content'?: TransactionOperation[];
  'number'?: number;
  'sort'?: SortObject;
  'numberOfElements'?: number;
  'first'?: boolean;
  'last'?: boolean;
  'pageable'?: PageableObject;
  'empty'?: boolean;
  'additionalProperties'?: Map<string, any>;
}
export type { PageTransactionOperation };