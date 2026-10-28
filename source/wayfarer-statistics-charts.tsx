// spell-checker: ignore echarts NIANTIC
import { addStyle, waitElementLoaded } from "./document-extensions";
import classNames, { cssText, variables } from "./styles.module.css";
import type { SubmissionChartsDisplayNames } from "./submission-series";
import type { EChartOption } from "echarts";
import {
    createCitiesChartOption,
    createCurrentChartOption,
    createHistoryChartOption,
} from "./chart-options";

export function handleAsyncError(e: unknown) {
    console.error(e);
}
function makeDraggable(
    element: HTMLElement,
    handleElement: HTMLElement,
    options?: {
        propertyNames?: { left: string; top: string };
    }
) {
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
            if (options?.propertyNames) {
                const { left, top } = options.propertyNames;
                element.style.setProperty(left, `${e.clientX - offsetX}px`);
                element.style.setProperty(top, `${e.clientY - offsetY}px`);
            } else {
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }
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

        titleDiv.addEventListener("dblclick", () =>
            previewDiv.classList.toggle(classNames["maximized"])
        );

        makeDraggable(previewDiv, titleDiv, {
            propertyNames: {
                left: variables["--drag-left"],
                top: variables["--drag-top"],
            },
        });

        document.body.appendChild(previewDiv);
    });
}

function createAsyncQueue<T>() {
    const values: T[] = [];
    const waiting: ((value: T) => void)[] = [];
    return {
        push(value: T) {
            const resolve = waiting.shift();
            if (resolve) resolve(value);
            else values.push(value);
        },
        [Symbol.asyncIterator]() {
            return {
                next() {
                    const value = values.shift();
                    if (value !== undefined) {
                        return Promise.resolve({ value, done: false });
                    }
                    return new Promise<IteratorResult<T>>((resolve) => {
                        waiting.push((value) =>
                            resolve({ value, done: false })
                        );
                    });
                },
            };
        },
    };
}

function interceptApiToValues() {
    const responses = createAsyncQueue<string>();
    const originalFetch = window.fetch.bind(window);
    window.fetch = (...args) => {
        const requestUrl =
            args[0] instanceof Request ? args[0].url : String(args[0]);
        const endpoint = "/api/v1/vault/manage";
        const matchesEndpoint = (url: string) =>
            requestUrl === url ||
            requestUrl.startsWith(`${url}?`) ||
            requestUrl.startsWith(`${url}#`);
        const response = originalFetch(...args);
        if (
            matchesEndpoint(endpoint) ||
            matchesEndpoint(`${location.origin}${endpoint}`)
        ) {
            void response
                .then((value) => value.clone().text())
                .then((value) => responses.push(value))
                .catch(handleAsyncError);
        }
        return response;
    };
    return responses;
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
        historyChartYAxisName: "件数",
        cumulativeAcceptedRatioPerDay: "承認率",
        statusCountPerMonth: "月",
        acceptedRatioPerMonth: "承認率/月",
        cumulativeTourDistance: "推定移動距離",
        statuses: {
            ACCEPTED: "承認",
            DUPLICATE: "重複",
            HELD: "保留",
            NOMINATED: "待機中",
            REJECTED: "否認",
            VOTING: "審査中",
            WITHDRAWN: "取下済",
            NIANTIC_REVIEW: "🎈審査",
        },
    };
}
const statisticsNamesKey =
    "wayfarer-statistics-names-0f7497e6-35bc-4810-88e4-1d2510b4ae08";
function loadNames(): SubmissionChartsDisplayNames {
    const baseNames = getDefaultNames();

    let extendedNames: Partial<typeof baseNames> | undefined;
    {
        const namesJson = localStorage.getItem(statisticsNamesKey);
        if (namesJson != null) {
            try {
                extendedNames = JSON.parse(namesJson);
            } catch {
                // ignore
            }
        }
    }
    if (extendedNames == null) return baseNames;
    return {
        ...baseNames,
        ...extendedNames,
        // TODO: DeepMerge
    };
}
export async function asyncMain() {
    const responses = interceptApiToValues();
    await waitElementLoaded();
    addStyle(cssText);

    for await (const response of responses) {
        const names = loadNames();
        await displayCharts([
            createCurrentChartOption(response, names),
            createCitiesChartOption(response, names),
            createHistoryChartOption(response, names),
        ]);
    }
}
