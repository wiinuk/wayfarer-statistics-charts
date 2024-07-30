// spell-checker: ignore echarts comlink
import { addStyle } from "./document-extensions";
import classNames, { cssText } from "./styles.module.css";
import BackgroundWorker from "worker-loader?inline=no-fallback!./background.worker";
import type {
    SubmissionSeries,
    SubmissionChartsDisplayNames,
    Ticks,
} from "./submission-series";
import { error } from "./standard-extensions";
import type { EChartOption } from "echarts";

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

function createEChartOptionsFromSubmissionSeries(
    series: SubmissionSeries[]
): EChartOption<EChartOption.Series> {
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
    };
}

async function displayCharts(series: SubmissionSeries[]) {
    const option = createEChartOptionsFromSubmissionSeries(series);
    const echarts = await import(
        "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.esm.min.mjs"
    );
    const chartContainerElement = (
        <div class={classNames["chart-container"]} />
    ) as HTMLDivElement;
    const displayInnerElement = <div>{chartContainerElement}</div>;

    const chart = echarts.init(chartContainerElement, undefined, {
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
    }).observe(chartContainerElement);

    await displayPreview(displayInnerElement, ["OK"]);
}

let backgroundModule:
    | import("comlink").Remote<import("./background.worker").Module>
    | undefined;
async function importBackgroundModule() {
    if (backgroundModule) {
        return backgroundModule;
    }
    const comlink = await import(
        "https://cdn.jsdelivr.net/npm/comlink@4.4.1/+esm"
    );
    backgroundModule = comlink.wrap(new BackgroundWorker());
    return backgroundModule;
}

export async function asyncMain() {
    addStyle(cssText);

    for await (const value of await interceptApiToValues()) {
        const r: unknown = (value.currentTarget as XMLHttpRequest).response;
        console.debug("manage response: ", r);
        if (typeof r !== "string") return error`response must be a string`;

        const names = {
            cumulativeAcceptedRatioPerDay: "承認率",
            statusCountPerMonth: "月",
            acceptedRatioPerMonth: "承認率/月",
            cumulativeTourDistance: "推定移動距離",
            statuses: {
                ACCEPTED: "承認",
                DUPLICATE: "重複",
                HELD: "保留",
                NOMINATED: "審査中",
                REJECTED: "否認",
                VOTING: "投票中",
                WITHDRAWN: "取下済",
            },
        } satisfies SubmissionChartsDisplayNames;

        const backgroundModule = await importBackgroundModule();
        const submissionSeries =
            await backgroundModule.calculateSubmissionCharts(r, names);
        await displayCharts(submissionSeries);
    }
}
