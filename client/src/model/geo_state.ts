import { GeoIdentifiers } from '@/model/geo_identifiers';
import { ScorecardData } from '@/model/scorecard';

/**
 * State of geo selection.
 */
export interface GeoState {
  geoids?: GeoIdentifiers;
  scorecard?: ScorecardData;
}
