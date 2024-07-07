// spell-checker: ignore niantic echarts
import { addStyle } from "./document-extensions";
import classNames, { cssText } from "./styles.module.css";

type MapKey<TMap extends Map<unknown, unknown>> = TMap extends Map<
    infer k,
    infer _
>
    ? k
    : never;
type MapValue<TMap extends Map<unknown, unknown>> = TMap extends Map<
    infer _,
    infer V
>
    ? V
    : never;
function getOrCreate<TMap extends Map<unknown, unknown>>(
    map: TMap,
    key: MapKey<TMap>,
    createValue: () => MapValue<TMap>
) {
    if (map.has(key)) {
        return map.get(key) as NonNullable<MapValue<TMap>>;
    }
    const value = createValue();
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

type Day = `${number}-${number}-${number}`;
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

type Id<T> = (x: T) => T;
const id: <T>(x: T) => T = (x) => x;

const privateTaggedSymbol = Symbol("privateTaggedSymbol ");
type Tagged<T, TTag> = T & { readonly [privateTaggedSymbol]: TTag };
type MonthTicks = Ticks;
type DayTicks = Ticks;
function asTagged<T, TTag>(value: T, _tag: Id<TTag>) {
    return value as Tagged<T, TTag>;
}
type Ticks = Tagged<number, "Ticks">;

let tempDate: Date | null = null;
function getStartOfLocalMonth(time: Ticks) {
    const d = (tempDate ??= new Date());
    d.setTime(time);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime() as MonthTicks;
}
function getStartOfLocalDay(time: Ticks) {
    const d = (tempDate ??= new Date());
    d.setTime(time);
    d.setHours(0, 0, 0, 0);
    return d.getTime() as DayTicks;
}
function parseAsLocalTicks(dayString: Day) {
    const [year, month, day] = dayString.split("-");
    const d = (tempDate ??= new Date());
    d.setTime(0);
    d.setFullYear(Number(year), Number(month), Number(day));
    d.setHours(0, 0, 0, 0);
    return d.getTime() as DayTicks;
}
function newMap<K, V>(): Map<K, V> {
    return new Map();
}
interface SubmissionSeriesDisplayNames {
    acceptedRatioPerMonth: string;
    /** 累計承認率/日 */
    readonly cumulativeAcceptedRatioPerDay: string;
    /** {状態}数/月 */
    readonly statusCountPerMonth: string;
}
function calculateAcceptedRatios(
    periodToStatusToNominations: ReadonlyMap<
        Ticks,
        ReadonlyMap<SubmissionStatus, readonly NominationSubmission[]>
    >,
    cumulative: boolean
) {
    // 一定期間毎の承認率を算出
    // 承認率 = 承認数 / (承認数 + 否認数 + 重複数 + 取下数)
    let acceptedCount = 0;
    let notAcceptedCount = 0;
    const data: SubmissionSeries["data"] = [];
    for (const [period, statuses] of periodToStatusToNominations) {
        const acceptedPerPeriod = statuses.get("ACCEPTED")?.length ?? 0;
        const notAcceptedPerPeriod =
            (statuses.get("REJECTED")?.length ?? 0) +
            (statuses.get("DUPLICATE")?.length ?? 0) +
            (statuses.get("WITHDRAWN")?.length ?? 0);

        acceptedCount = cumulative
            ? acceptedCount + acceptedPerPeriod
            : acceptedPerPeriod;
        notAcceptedCount = cumulative
            ? notAcceptedCount + notAcceptedPerPeriod
            : notAcceptedPerPeriod;

        data.push([period, acceptedCount / (acceptedCount + notAcceptedCount)]);
    }
    return data;
}
function calculateSubmissionSeries(
    nominations: readonly NominationSubmission[],
    statusToDisplayName: ReadonlyMap<SubmissionStatus, string>,
    names: SubmissionSeriesDisplayNames
) {
    // 日時でソートする
    const nominationWithTicks = nominations
        .map((n) => ({
            ...n,
            dayTicks: parseAsLocalTicks(n.day),
        }))
        .sort((a, b) => a.dayTicks - b.dayTicks);

    // 日毎にまとめる
    const dayToStatusToNominations = new Map<
        DayTicks,
        Map<SubmissionStatus, NominationSubmission[]>
    >();
    for (const n of nominationWithTicks) {
        getOrCreate(
            getOrCreate(dayToStatusToNominations, n.dayTicks, newMap),
            n.status,
            Array
        ).push(n);
    }
    const statusToDayToNominations = new Map<
        SubmissionStatus,
        Map<DayTicks, NominationSubmission[]>
    >();
    for (const n of nominationWithTicks) {
        getOrCreate(
            getOrCreate(statusToDayToNominations, n.status, newMap),
            n.dayTicks,
            Array
        ).push(n);
    }

    // 月毎にまとめる
    const statusToMonthToNominations = new Map<
        SubmissionStatus,
        Map<MonthTicks, NominationSubmission[]>
    >();
    for (const [status, days] of statusToDayToNominations) {
        const months = getOrCreate(statusToMonthToNominations, status, newMap);
        for (const [day, nominations] of days) {
            getOrCreate(months, getStartOfLocalMonth(day), Array).push(
                ...nominations
            );
        }
    }
    const monthToStatusToNominations = new Map<
        MonthTicks,
        Map<SubmissionStatus, NominationSubmission[]>
    >();
    for (const [day, statuses] of dayToStatusToNominations) {
        const month = getStartOfLocalMonth(day);
        const months = getOrCreate(monthToStatusToNominations, month, newMap);
        for (const [status, nominations] of statuses) {
            getOrCreate(months, status, Array).push(...nominations);
        }
    }

    const result: SubmissionSeries[] = [];

    // 日毎の累計状態数
    for (const [status, days] of statusToDayToNominations) {
        const data: SubmissionSeries["data"] = [];
        let cumulativeCount = 0;
        for (const [day, nominations] of days) {
            data.push([day, (cumulativeCount += nominations.length)]);
        }
        result.push({
            name: `${statusToDisplayName.get(status) || status}`,
            data,
        });
    }

    // 日毎の累計承認率
    result.push({
        name: names.cumulativeAcceptedRatioPerDay,
        data: calculateAcceptedRatios(dayToStatusToNominations, true),
    });

    // 月毎状態数
    for (const [status, months] of statusToMonthToNominations) {
        const data: SubmissionSeries["data"] = [];
        for (const [month, nominations] of months) {
            data.push([month, nominations.length]);
        }
        result.push({
            name: `${statusToDisplayName.get(status) || status}/${
                names.statusCountPerMonth
            }`,
            data,
        });
    }

    // 月毎の承認率
    result.push({
        name: names.acceptedRatioPerMonth,
        data: calculateAcceptedRatios(monthToStatusToNominations, false),
    });

    return result;
}

type SubmissionSeries = { name: string; data: [Ticks, number][] };
async function displayCharts(
    submissionSeriesList: readonly SubmissionSeries[]
) {
    const echarts = await import(
        "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.esm.min.mjs"
    );
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
        series: submissionSeriesList.map(
            (series) =>
                ({
                    name: series.name,
                    data: series.data,
                    type: "line",
                    symbol: "none",
                } satisfies echarts.EChartOption.SeriesLine)
        ),
        tooltip: {
            trigger: "axis",
            formatter: (ps) => {
                const params = Array.isArray(ps) ? ps : [ps];
                let result = `${new Date(
                    (params[0]?.value as [Ticks, number])[0]
                ).toLocaleString()}<br/>`;
                for (const param of params) {
                    result += `${param.seriesName}: ${
                        (param.value as [Ticks, number])[1]
                    }<br/>`;
                }
                return result;
            },
        },
        legend: {
            data: submissionSeriesList.map((series) => series.name),
            selected: {},
        },
    } satisfies echarts.EChartOption<echarts.EChartOption.SeriesLine>;

    const containerElement = (
        <div class={classNames["chart-container"]} />
    ) as HTMLDivElement;

    const chart = echarts.init(containerElement, undefined, {
        width: 300,
        height: 200,
    });
    chart.setOption(option);

    new ResizeObserver((entries) => {
        for (const { contentRect } of entries) {
            chart.resize({
                width: contentRect.width,
                height: contentRect.height,
            });
        }
    }).observe(containerElement);

    await displayPreview(containerElement, ["OK"]);
}

export async function asyncMain() {
    addStyle(cssText);

    for await (const value of await interceptApiToValues()) {
        const r: unknown = (value.currentTarget as XMLHttpRequest).response;
        console.debug("manage response: ", r);
        await displayCharts(
            calculateSubmissionSeries(
                parseNominations(r),
                new Map<SubmissionStatus, string>([
                    ["ACCEPTED", "承認"],
                    ["DUPLICATE", "重複"],
                    ["HELD", "保留"],
                    ["NOMINATED", "審査中"],
                    ["REJECTED", "否認"],
                    ["VOTING", "投票中"],
                    ["WITHDRAWN", "取下済"],
                ]),
                {
                    cumulativeAcceptedRatioPerDay: "累計承認率",
                    statusCountPerMonth: "月",
                    acceptedRatioPerMonth: "承認率/月",
                }
            )
        );
    }
}
