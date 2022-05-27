/**
 * A data layer on the map.
 *
 * A data layer is a visual layer of data which can be viewed on the map, for
 * example, the predicted number of lead service lines per water system. A data
 * layer consists of a name.
 *
 * TODO(kailamjeter): elaborate here when DataLayer contains more fields.
 */
export interface DataLayer {
  name: string;
}