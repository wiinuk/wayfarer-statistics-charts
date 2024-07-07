// spell-checker: ignore niantic echarts
import { addStyle } from "./document-extensions";
import classNames, { cssText } from "./styles.module.css";

function getOrCreate<TMap extends Map<unknown, unknown>>(
    map: TMap,
    key: TMap extends Map<infer k, infer _> ? k : never,
    Class: { new (): TMap extends Map<infer _, infer V> ? V : never }
) {
    if (map.has(key)) {
        return map.get(key) as NonNullable<
            TMap extends Map<infer _, infer V> ? V : never
        >;
    }
    const value = new Class();
    map.set(key, value);
    return value;
}

function displayPreview<TChoices>(
    innerElement: HTMLElement,
    choices: readonly TChoices[]
): Promise<TChoices> {
    return new Promise((resolve) => {
        const buttons = choices.map((choice) => {
            const button = (
                <button class={classNames["display-preview-button"]}>
                    {choice}
                </button>
            );
            button.addEventListener("click", () => {
                document.body.removeChild(previewDiv);
                resolve(choice);
            });
            return button;
        });
        const previewDiv = (
            <div class={classNames["display-preview"]}>
                {innerElement}
                {buttons}
            </div>
        );

        document.body.appendChild(previewDiv);
    });
}

interface HasEvent<E extends Event, N extends string> {
    addEventListener(
        eventName: N,
        listener: (event: E) => void,
        options?: { once?: boolean }
    ): void;
    removeEventListener(eventName: N, listener: (event: E) => void): void;
}
function eventToAsyncIterator<E extends Event, N extends string>(
    target: HasEvent<E, N>,
    eventName: N
): AsyncIterable<E> {
    let listeners: ((result: IteratorResult<E, void>) => void)[] = [];

    return {
        [Symbol.asyncIterator]() {
            return {
                next() {
                    return new Promise((resolve) => {
                        listeners.push(resolve);
                        target.addEventListener(eventName, onEvent, {
                            once: true,
                        });
                    });
                },
                return() {
                    target.removeEventListener(eventName, onEvent);
                    for (const listener of listeners) {
                        listener({ value: undefined, done: true });
                    }
                    listeners = [];
                    return Promise.resolve({ value: undefined, done: true });
                },
            };
        },
    };
    function onEvent(event: E) {
        const listener = listeners.shift();
        listener?.({ value: event, done: false });
    }
}

function interceptApiToValues() {
    return new Promise<AsyncIterable<ProgressEvent<XMLHttpRequestEventTarget>>>(
        (resolve) => {
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function (
                ...args: [method: string, url: string | URL, ...rest: unknown[]]
            ) {
                const [method, url] = args;
                if (url == "/api/v1/vault/manage") {
                    if (method == "GET") {
                        resolve(
                            eventToAsyncIterator<
                                ProgressEvent<XMLHttpRequestEventTarget>,
                                "load"
                            >(this, "load")
                        );
                    }
                }
                originalOpen.apply(
                    this,
                    args as Parameters<XMLHttpRequest["open"]>
                );
            };
        }
    );
}
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

type SubmissionStatus =
    | "ACCEPTED"
    | "REJECTED"
    | "DUPLICATE"
    | "WITHDRAWN"
    | "HELD"
    | "VOTING"
    | "NOMINATED";

interface SubmissionBase {
    id: string;
    type: string;
    title: string;
    description: string;
    lat: number;
    lng: number;
    city: string;
    state: string;
    day: `${number}-${number}-${number}`;
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

interface NominationSubmission extends SubmissionBase {
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

function parseNominations(response: unknown) {
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

function calculateEventCounts(dates: readonly unknown[]) {
    return dates.map((_, index) => index + 1);
}

async function displayCharts() {
    const echarts = await import(
        "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.esm.min.mjs"
    );

    const eventSeries = [
        {
            name: "イベントA",
            data: [
                "2023-10-25 00:00:00",
                "2023-10-26 00:00:00",
                "2024-01-02 00:00:00",
            ],
        },
        {
            name: "イベントB",
            data: [
                "2023-11-05 00:00:00",
                "2023-12-10 00:00:00",
                "2024-01-15 00:00:00",
                "2024-02-20 00:00:00",
            ],
        },
        {
            name: "イベントC",
            data: [
                "2023-10-30 00:00:00",
                "2023-11-30 00:00:00",
                "2024-01-30 00:00:00",
                "2024-02-28 00:00:00",
                "2024-03-30 00:00:00",
            ],
        },
    ];

    const option = {
        xAxis: {
            type: "time",
            axisLabel: {
                formatter: (value: string) => {
                    const date = new Date(value);
                    return `${date.getFullYear()}/${
                        date.getMonth() + 1
                    }/${date.getDate()}`;
                },
            },
        },
        yAxis: {
            type: "value",
            name: "イベント数",
        },
        series: eventSeries.map((series) => ({
            name: series.name,
            data: series.data.map((date, index) => [
                date,
                calculateEventCounts(series.data)[index],
            ]),
            type: "line",
            symbol: "none",
        })),
        tooltip: {
            trigger: "axis",
            formatter: (ps) => {
                const params = Array.isArray(ps) ? ps : [ps];
                let result = `${new Date(
                    (params[0]?.value as [string, number])[0]
                ).toLocaleString()}<br/>`;
                for (const param of params) {
                    result += `${param.seriesName}: ${
                        (param.value as [string, number])[1]
                    }<br/>`;
                }
                return result;
            },
        },
        legend: {
            data: eventSeries.map((series) => series.name),
            selected: {},
        },
    } satisfies echarts.EChartOption;

    const containerElement = (
        <div className={classNames["chart-container"]} />
    ) as HTMLDivElement;

    const chart = echarts.init(containerElement, undefined, {
        width: 300,
        height: 200,
    });
    chart.setOption(option);

    await displayPreview(containerElement, ["OK"]);
}

export async function asyncMain() {
    addStyle(cssText);

    for await (const value of await interceptApiToValues()) {
        const r: unknown = (value.currentTarget as XMLHttpRequest).response;
        console.debug("manage response: ", r);

        const stateToDayToNominations = new Map<
            string,
            Map<`${number}-${number}-${number}`, NominationSubmission[]>
        >();
        const collectingStates = new Set(["ACCEPTED", "REJECTED", "DUPLICATE"]);
        for (const n of parseNominations(r)) {
            if (collectingStates.has(n.status)) {
                getOrCreate(
                    getOrCreate(stateToDayToNominations, n.status, Map),
                    n.day,
                    Array
                ).push(n);
            }
        }
        await displayCharts();
    }
}
