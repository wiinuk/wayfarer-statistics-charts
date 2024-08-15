//spell-checker: ignore echarts meiryo comlink
import type { EChartOption } from "echarts";
import type { SubmissionChartsDisplayNames, Ticks } from "./submission-series";
import BackgroundWorker from "worker-loader?inline=no-fallback!./background.worker";
import { parseNominations, type SubmissionStatus } from "./submissions";

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
        title: {
            text: names.currentChartTitle,
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
        title: {
            text: names.historyChartTitle,
            left: "center",
        },
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
