import {
    calculateSubmissionSeries,
    type SubmissionSeriesDisplayNames,
} from "./submission-series";
import { parseNominations } from "./submissions";

export async function calculateSubmissionSeriesFromManageResponse(
    data: unknown,
    names: SubmissionSeriesDisplayNames
) {
    const nominations = parseNominations(data);
    return await calculateSubmissionSeries(nominations, names);
}
