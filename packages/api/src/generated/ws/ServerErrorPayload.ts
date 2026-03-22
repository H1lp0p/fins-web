
interface ServerErrorPayload {
  'type': 'error';
  'message': string;
  'code'?: string;
  'fieldErrors'?: Map<string, string[]>;
  'additionalProperties'?: Map<string, any>;
}
export type { ServerErrorPayload };