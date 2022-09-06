/**
 * Utility functions for the LeadData type.
 */
import { LeadData } from '@/model/states/model/lead_data';
import { ScorecardMessages } from '@/assets/messages/scorecard_messages';

export class LeadDataUtil {
  static LOW_LEAD_LIKELIHOOD = 0.33;
  static MEDIUM_LEAD_LIKELIHOOD = 0.66;

  /**
   * Returns the lead likelihood percentage for a water system given a LeadData object.
   */
  static waterSystemsPercentLead(leadData: LeadData | undefined): number | null {
    if (!leadData) return null;

    const leadServiceLines = leadData.leadServiceLines;
    const serviceLines = leadData.serviceLines;

    // Protect against dividing by 0.
    if (leadServiceLines != null && serviceLines != null && serviceLines != 0) {
      return leadServiceLines / serviceLines;
    }
    return null;
  }

  /**
   * Takes in a prediction and produces a phrase to describe the likelihood
   * as a phrase.
   * @param prediction percent lead prediction
   */
  static formatPredictionAsLikelihood(prediction: number | null): string | null {
    if (!prediction) return null;

    console.log('RETURNING PREDICTION');

    switch (true) {
      case prediction <= LeadDataUtil.LOW_LEAD_LIKELIHOOD:
        return ScorecardMessages.LOW_LIKELIHOOD;
      case prediction < LeadDataUtil.MEDIUM_LEAD_LIKELIHOOD:
        return ScorecardMessages.MEDIUM_LIKELIHOOD;
      case prediction >= LeadDataUtil.MEDIUM_LEAD_LIKELIHOOD:
        return ScorecardMessages.HIGH_LIKELIHOOD;
      default:
        return null;
    }
  }
}
