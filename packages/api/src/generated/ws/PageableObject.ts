import type {SortObject} from './SortObject';
interface PageableObject {
  'unpaged'?: boolean;
  'pageNumber'?: number;
  'paged'?: boolean;
  'pageSize'?: number;
  'offset'?: number;
  'sort'?: SortObject;
  'additionalProperties'?: Map<string, any>;
}
export type { PageableObject };