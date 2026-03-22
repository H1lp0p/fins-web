
interface ClientUnsubscribePayload {
  'type': 'unsubscribe';
  'accountId': string;
  'additionalProperties'?: Map<string, any>;
}
export type { ClientUnsubscribePayload };