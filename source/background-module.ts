import {
    calculateSubmissionSeries,
    type SubmissionChartsDisplayNames,
} from "./submission-series";
import { parseNominations } from "./submissions";

export async function calculateSubmissionCharts(
    data: string,
    names: SubmissionChartsDisplayNames
) {
    const nominations = parseNominations(data);
    return await calculateSubmissionSeries(nominations, names);
}
