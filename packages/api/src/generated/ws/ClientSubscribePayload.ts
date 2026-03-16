
interface ClientSubscribePayload {
  'type': 'subscribe';
  'accountId': string;
  'pageIndex'?: number;
  'pageSize'?: number;
  'additionalProperties'?: Map<string, any>;
}
export type { ClientSubscribePayload };