
interface CardAccount {
  'id'?: string;
  'name'?: string;
  'isMain': boolean;
  'currency'?: string;
  'userId'?: string;
  'money'?: number;
  'deleted'?: boolean;
  'additionalProperties'?: Map<string, any>;
}
export type { CardAccount };