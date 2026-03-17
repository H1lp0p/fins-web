import {AnonymousSchema_16} from './AnonymousSchema_16';
import {AnonymousSchema_18} from './AnonymousSchema_18';
import type {MoneyValueDto} from './MoneyValueDto';
interface TransactionOperation {
  'id'?: string;
  'cardAccountId'?: string;
  'dateTime'?: string;
  'transactionType'?: AnonymousSchema_16;
  'transactionActoin'?: string;
  'transactionStatus'?: AnonymousSchema_18;
  'money'?: MoneyValueDto;
  'additionalProperties'?: Map<string, any>;
}
export type { TransactionOperation };