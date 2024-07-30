// spell-checker: ignore echarts
import type {
    Day,
    NominationSubmission,
    SubmissionStatus,
} from "./submissions";

const privateTaggedSymbol = Symbol("privateTaggedSymbol");
type Tagged<T, TTag> = T & { readonly [privateTaggedSymbol]: TTag };
export type Ticks = Tagged<number, "Ticks">;
type MonthTicks = Ticks;
type DayTicks = Ticks;

export type SubmissionSeries = echarts.EChartOption.Series & {
    name: string;
    data: [Ticks, number][];
};

let tempDate: Date | null = null;
function getStartOfLocalMonth(time: Ticks) {
    const d = (tempDate ??= new Date());
    d.setTime(time);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime() as MonthTicks;
}
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

function parseAsLocalTicks(dayString: Day) {
    const [year, month, day] = dayString.split("-");
    const d = (tempDate ??= new Date());
    d.setTime(0);
    d.setFullYear(Number(year), Number(month) - 1, Number(day));
    d.setHours(0, 0, 0, 0);
    return d.getTime() as DayTicks;
}
function newMap<K, V>(): Map<K, V> {
    return new Map();
}
export interface SubmissionChartsDisplayNames {
    readonly cumulativeTourDistance: string;
    readonly acceptedRatioPerMonth: string;
    /** 累計承認率/日 */
    readonly cumulativeAcceptedRatioPerDay: string;
    /** {状態}数/月 */
    readonly statusCountPerMonth: string;
    readonly statuses: Readonly<Record<SubmissionStatus, string>>;
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

        if (0 === acceptedCount + notAcceptedCount) continue;
        data.push([period, acceptedCount / (acceptedCount + notAcceptedCount)]);
    }
    return data;
}
const statusToColor: Readonly<Partial<Record<SubmissionStatus, string>>> = {
    ACCEPTED: "#15803d", // 緑 ( 公式 )
    REJECTED: "#dc2626", // 赤 ( 公式 )
    DUPLICATE: "#dc9c26", // オレンジ
    HELD: "#211580", // 青
    WITHDRAWN: "#c026dc", // 紫
};
const lineSeries: echarts.EChartOption.SeriesLine = {
    type: "line",
    symbol: "none",
    step: "end",
};
const barSeries: echarts.EChartOption.SeriesBar = {
    type: "bar",
};
export async function calculateSubmissionSeries(
    nominations: readonly NominationSubmission[],
    names: SubmissionChartsDisplayNames
) {
    // 日時でソートする
    const nominationWithTicks = nominations
        .map((n) => ({
            ...n,
            dayTicks: parseAsLocalTicks(n.day),
        }))
        .sort((a, b) => a.dayTicks - b.dayTicks);

    // インデックスを作成
    const dayToStatusToNominations = new Map<
        DayTicks,
        Map<SubmissionStatus, NominationSubmission[]>
    >();
    const statusToDayToNominations = new Map<
        SubmissionStatus,
        Map<DayTicks, NominationSubmission[]>
    >();
    const dayToNominations = new Map<DayTicks, NominationSubmission[]>();
    const statusToMonthToNominations = new Map<
        SubmissionStatus,
        Map<MonthTicks, NominationSubmission[]>
    >();
    const monthToStatusToNominations = new Map<
        MonthTicks,
        Map<SubmissionStatus, NominationSubmission[]>
    >();
    for (const n of nominationWithTicks) {
        const month = getStartOfLocalMonth(n.dayTicks);
        getOrCreate(
            getOrCreate(dayToStatusToNominations, n.dayTicks, newMap),
            n.status,
            Array
        ).push(n);
        getOrCreate(
            getOrCreate(statusToDayToNominations, n.status, newMap),
            n.dayTicks,
            Array
        ).push(n);
        getOrCreate(dayToNominations, n.dayTicks, Array).push(n);
        getOrCreate(
            getOrCreate(statusToMonthToNominations, n.status, newMap),
            month,
            Array
        ).push(n);
        getOrCreate(
            getOrCreate(monthToStatusToNominations, month, newMap),
            n.status,
            Array
        ).push(n);
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
            ...lineSeries,
            name: `${names.statuses[status] || status}`,
            data,
            itemStyle: {
                color: statusToColor[status],
            },
        } satisfies echarts.EChartOption.SeriesLine);
    }

    // 月毎状態数
    for (const [status, months] of statusToMonthToNominations) {
        const data: SubmissionSeries["data"] = [];
        for (const [month, nominations] of months) {
            data.push([month, nominations.length]);
        }
        result.push({
            ...barSeries,
            name: `${names.statuses[status] || status}/${
                names.statusCountPerMonth
            }`,
            data,
            itemStyle: {
                color: statusToColor[status],
            },
        });
    }

    // 日毎の累計承認率
    result.push({
        ...lineSeries,
        name: names.cumulativeAcceptedRatioPerDay,
        data: calculateAcceptedRatios(dayToStatusToNominations, true),
        itemStyle: { color: statusToColor["ACCEPTED"] },
    });

    // 月毎の承認率
    result.push({
        ...barSeries,
        name: names.acceptedRatioPerMonth,
        data: calculateAcceptedRatios(monthToStatusToNominations, false),
    });

    return result;
}
