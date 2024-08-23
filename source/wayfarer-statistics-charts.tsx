// spell-checker: ignore echarts
import { addStyle } from "./document-extensions";
import classNames, { cssText } from "./styles.module.css";
import type { SubmissionChartsDisplayNames } from "./submission-series";
import { error } from "./standard-extensions";
import type { EChartOption } from "echarts";
import {
    createCitiesChartOption,
    createCurrentChartOption,
    createHistoryChartOption,
} from "./chart-options";

export function handleAsyncError(e: unknown) {
    console.error(e);
}
function makeDraggable(element: HTMLElement, handleElement: HTMLElement) {
    let isDragging = false;
    let offsetX = 0,
        offsetY = 0;

    element.addEventListener("mousedown", (e) => {
        if (e.target !== handleElement) return;

        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            element.style.left = `${e.clientX - offsetX}px`;
            element.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
}

function displayDialog<TChoice extends string>(
    innerElement: HTMLElement,
    choices: readonly TChoice[],
    title = ""
): Promise<TChoice> {
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
        const titleDiv = (
            <div class={classNames["display-preview-title"]}>{title}</div>
        );
        const previewDiv = (
            <div class={classNames["display-preview"]}>
                {titleDiv}
                <div class={classNames["display-preview-inner-container"]}>
                    {innerElement}
                </div>
                <div>{buttons}</div>
            </div>
        );

        makeDraggable(previewDiv, titleDiv);

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

async function createResizableChartContainer() {
    const containerElement = (
        <div class={classNames["chart-container"]} />
    ) as HTMLDivElement;

    const echarts = await import(
        "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.esm.min.mjs"
    );
    const chart = echarts.init(containerElement, undefined, {
        width: 300,
        height: 200,
    });

    new ResizeObserver((entries) => {
        for (const { contentRect } of entries) {
            chart.resize({
                width: contentRect.width,
                height: contentRect.height,
            });
        }
    }).observe(containerElement);

    return { containerElement, chart };
}

async function setChartOptionsAsync(
    containerElement: HTMLElement,
    dynamicOptions: AsyncIterable<EChartOption>
) {
    const { containerElement: element, chart } =
        await createResizableChartContainer();
    containerElement.appendChild(element);
    for await (const option of dynamicOptions) {
        chart.setOption(option);
    }
}

async function displayCharts(
    statistics: readonly AsyncIterable<EChartOption>[]
) {
    const chartContainerElements = statistics.map((dynamicOptions) => {
        const container = <div></div>;
        setChartOptionsAsync(container, dynamicOptions).catch((e) => {
            container.append(
                <div>{e instanceof Error ? e.message : String(e)}</div>
            );
            handleAsyncError(e);
        });
        return container;
    });
    const statisticsContainerElement = <div>{chartContainerElements}</div>;
    await displayDialog(statisticsContainerElement, ["OK"]);
}

function getDefaultNames(): SubmissionChartsDisplayNames {
    return {
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
    };
}
const statisticsNamesKey =
    "wayfarer-statistics-names-0f7497e6-35bc-4810-88e4-1d2510b4ae08";
function loadNames(): SubmissionChartsDisplayNames {
    const names = localStorage.getItem(statisticsNamesKey);
    if (names == null) {
        return getDefaultNames();
    }
    try {
        return {
            ...getDefaultNames(),
            ...JSON.parse(names),
            // TODO: statuses のマージ
        };
    } catch (e) {
        return getDefaultNames();
    }
}
export async function asyncMain() {
    addStyle(cssText);

    for await (const value of await interceptApiToValues()) {
        const response: unknown = (value.currentTarget as XMLHttpRequest)
            .response;
        console.debug("manage response: ", response);
        if (typeof response !== "string")
            return error`response must be a string`;

        const names = loadNames();
        await displayCharts([
            createCurrentChartOption(response, names),
            createCitiesChartOption(response, names),
            createHistoryChartOption(response, names),
        ]);
    }
}
