// spell-checker: ignore Niantic
type POIData = {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
    lat: number;
    lng: number;
    city: string;
    state: "LIVE";
    lastUpdateDate: `${number}/${number}/${number}` | "";
};
type RejectReasonKind = "DUPLICATE" | "OPR_CRITERIA" | "GENERIC" | "CRITERIA";
type RejectReason = {
    reason: RejectReasonKind;
};

export type SubmissionStatus =
    | "ACCEPTED"
    | "REJECTED"
    | "DUPLICATE"
    | "WITHDRAWN"
    | "HELD"
    | "VOTING"
    | "NOMINATED";

export type Day = `${number}-${number}-${number}`;
interface SubmissionBase {
    id: string;
    type: string;
    title: string;
    description: string;
    lat: number;
    lng: number;
    city: string;
    state: string;
    day: Day;
    order: number;
    imageUrl: string;
    nextUpgrade: boolean;
    upgraded: boolean;
    status: SubmissionStatus;
    isMutable: boolean;
    isNianticControlled: boolean;
    statement: string;
    supportingImageUrl: string;
    rejectReasons: RejectReason[];
    canAppeal: boolean;
    isClosed: boolean;
    appealNotes: string;
    canHold: boolean;
    canReleaseHold: boolean;
}

interface PhotoSubmission extends SubmissionBase {
    type: "PHOTO";
    poiData: POIData;
}

export interface NominationSubmission extends SubmissionBase {
    type: "NOMINATION";
    poiData: [];
}

interface EditTitleSubmission extends SubmissionBase {
    type: "EDIT_TITLE";
    poiData: POIData;
}

interface EditDescriptionSubmission extends SubmissionBase {
    type: "EDIT_DESCRIPTION";
    poiData: POIData;
}

type Submission =
    | PhotoSubmission
    | NominationSubmission
    | EditTitleSubmission
    | EditTitleSubmission
    | EditDescriptionSubmission;

interface ManageResult {
    submissions: Submission[];
    canAppeal: boolean;
    immediateUpgradeEnabled: boolean;
}
interface ManageResponse {
    result: ManageResult;
    message: null;
    code: "OK";
    errorsWithIcon: null;
    fieldErrors: null;
    errorDetails: null;
    version: string;
    captcha: boolean;
}

export function parseNominations(response: unknown) {
    if (typeof response !== "string")
        throw new Error("Invalid response from Wayfarer");
    const json: unknown = JSON.parse(response);
    if (json == null) throw new Error("Invalid response from Wayfarer");

    /** TODO: zod などで実行時チェックする */
    const data = json as ManageResponse;

    const nominations = data.result.submissions.filter(
        (s) => s.type === "NOMINATION"
    );
    return nominations;
}
