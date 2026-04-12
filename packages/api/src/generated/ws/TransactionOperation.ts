import type {CardAccount} from './CardAccount';
import {AnonymousSchema_22} from './AnonymousSchema_22';
import {AnonymousSchema_23} from './AnonymousSchema_23';
interface TransactionOperation {
  'id'?: string;
  'account'?: CardAccount;
  'dateTime'?: string;
  'transactionType'?: AnonymousSchema_22;
  'transactionStatus'?: AnonymousSchema_23;
  'action'?: string;
  'currency'?: string;
  'money'?: number;
  'additionalProperties'?: Map<string, any>;
}
export type { TransactionOperation };