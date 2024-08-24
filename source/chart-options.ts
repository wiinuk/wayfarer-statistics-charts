//spell-checker: ignore echarts meiryo comlink treemap
import type { EChartOption } from "echarts";
import type { SubmissionChartsDisplayNames, Ticks } from "./submission-series";
import BackgroundWorker from "worker-loader?inline=no-fallback!./background.worker";
import {
    parseNominations,
    type NominationSubmission,
    type SubmissionStatus,
} from "./submissions";
import { error, getOrCreate } from "./standard-extensions";
import { escapeHtml } from "./document-extensions";

function createBaseEChartOption() {
    return {
        textStyle: {
            fontFamily: "'Yu Gothic UI', 'Meiryo UI', sans-serif",
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: "none",
                },
                restore: {},
                saveAsImage: {},
            },
        },
    } satisfies EChartOption;
}

type RemoteBackgroundModule = Promise<
    import("comlink").Remote<import("./background.worker").Module>
>;
async function loadBackgroundModule(): Promise<RemoteBackgroundModule> {
    const comlink = await import(
        "https://cdn.jsdelivr.net/npm/comlink@4.4.1/+esm"
    );
    return comlink.wrap(new BackgroundWorker());
}

let backgroundModule: Promise<RemoteBackgroundModule> | undefined;
function importBackgroundModule() {
    return (backgroundModule ??= loadBackgroundModule());
}

export async function* createCurrentChartOption(
    response: string,
    names: SubmissionChartsDisplayNames
) {
    const submissions = parseNominations(response);
    const statusToCount = new Map<SubmissionStatus, number>();
    for (const { status } of submissions) {
        const count = statusToCount.get(status) ?? 0;
        statusToCount.set(status, count + 1);
    }
    const statusAndCounts = [...statusToCount.entries()]
        .sort((a, b) => a[1] - b[1])
        .reverse();

    const series: EChartOption.SeriesPie = {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "70%"],
        startAngle: 180,
        //@ts-expect-error 追加のオプション
        endAngle: 360,
        label: {
            // align: "edge",
            formatter: "{name|{b}}\n{count|{c}}",
            rich: {
                count: {
                    fontSize: 10,
                    color: "#999",
                },
            },
        },
        itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
        },
        data: statusAndCounts.map(([status, value]) => ({
            name: names.statuses[status] || status,
            value,
        })),
    };
    yield {
        ...createBaseEChartOption(),
        legend: {
            left: "center",
        },
        series: [series],
    } satisfies EChartOption<EChartOption.SeriesPie>;
}

export async function* createHistoryChartOption(
    response: string,
    names: SubmissionChartsDisplayNames
) {
    const background = await importBackgroundModule();
    const series = await background.calculateSubmissionCharts(response, names);
    yield {
        ...createBaseEChartOption(),
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
            name: names.historyChartYAxisName,
        },
        dataZoom: [{}],
        series,
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
            data: series.map((series) => series.name),
            selected: {},
        },
    } satisfies EChartOption;
}

function newMap() {
    return new Map<never, never>();
}
export async function* createCitiesChartOption(
    response: string,
    _names: SubmissionChartsDisplayNames
) {
    const nominations = parseNominations(response);
    const stateToCityToNominations = new Map<
        string,
        Map<string, NominationSubmission[]>
    >();
    for (const nomination of nominations) {
        const { state, city } = nomination;
        const cityToNominations = getOrCreate(
            stateToCityToNominations,
            state,
            newMap
        );
        const nominations = getOrCreate(cityToNominations, city, Array);
        nominations.push(nomination);
    }
    type DataObject = EChartOption.SeriesTreemap.DataObject;
    const data: DataObject[] = [];
    for (const [state, cityToNominations] of stateToCityToNominations) {
        let nominationCountAtState = 0;
        const childrenAtState: DataObject[] = [];
        for (const [city, nominations] of cityToNominations) {
            const nominationCountAtCity = nominations.length;
            nominationCountAtState += nominationCountAtCity;
            childrenAtState.push({
                value: nominationCountAtCity,
                name: city,
            });
        }
        {
            data.push({
                value: nominationCountAtState,
                name: state,
                children: childrenAtState,
            });
        }
        const series: EChartOption.SeriesTreemap = {
            ...createBaseEChartOption(),
            type: "treemap",
            visibleMin: 300,
            label: {
                show: true,
                formatter: "{b}",
            },
            itemStyle: {
                borderColor: "#fff",
            },
            levels: [
                {
                    itemStyle: { borderWidth: 0, gapWidth: 5 },
                },
                {
                    itemStyle: { gapWidth: 1 },
                },
                {
                    //@ts-expect-error ライブラリの型付け
                    colorSaturation: [0.35, 0.5],
                    itemStyle: {
                        gapWidth: 1,
                        borderColorSaturation: "0.6",
                    },
                },
            ],
            data,
        };
        yield {
            tooltip: {
                formatter(info) {
                    if (Array.isArray(info))
                        return error`${info} should be an array`;
                    const value = info.value;
                    const treePathInfo: readonly unknown[] =
                        "treePathInfo" in info &&
                        Array.isArray(info.treePathInfo)
                            ? info.treePathInfo
                            : [];
                    const treePath = treePathInfo.map((path) => {
                        if (
                            path != null &&
                            typeof path === "object" &&
                            "name" in path &&
                            typeof path.name === "string"
                        ) {
                            return path.name;
                        }
                        return error`path is not a string or an array`;
                    });
                    return [
                        `<div class='tooltip-title'>`,
                        escapeHtml(treePath.join("/")),
                        `</div>`,
                        value == null ? "" : value,
                    ].join("");
                },
            },
            series: [series],
        } satisfies EChartOption<EChartOption.SeriesTreemap>;
    }
}
