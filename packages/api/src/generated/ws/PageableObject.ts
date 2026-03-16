import type {SortObject} from './SortObject';
interface PageableObject {
  'offset'?: number;
  'sort'?: SortObject;
  'paged'?: boolean;
  'unpaged'?: boolean;
  'pageNumber'?: number;
  'pageSize'?: number;
  'additionalProperties'?: Map<string, any>;
}
export type { PageableObject };