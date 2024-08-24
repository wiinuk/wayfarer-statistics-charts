// ==UserScript==
// @id           wayfarer-statistics-charts
// @name         Wayfarer Statistics Charts
// @namespace    http://tampermonkey.net/
// @downloadURL  https://github.com/wiinuk/wayfarer-statistics-charts/raw/main/wayfarer-statistics-charts.user.js
// @updateURL    https://github.com/wiinuk/wayfarer-statistics-charts/raw/main/wayfarer-statistics-charts.user.js
// @homepageURL  https://github.com/wiinuk/wayfarer-statistics-charts
// @version      0.2.1
// @description  Visualize statistics of Niantic Wayfarer submissions.
// @author       Wiinuk
// @match        https://wayfarer.nianticlabs.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nianticlabs.com
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 999:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  c: () => (/* binding */ asyncMain)
});

// UNUSED EXPORTS: handleAsyncError

;// CONCATENATED MODULE: ./source/document-jsx/jsx-runtime.ts
function jsxs(name, properties, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_option) {
    const element = document.createElement(name);
    for (const [key, value] of Object.entries(properties ?? {})) {
        if (key === "children")
            continue;
        if (key === "style" && typeof value === "function") {
            value(element.style);
            continue;
        }
        if (key === "classList") {
            if (typeof value === "string") {
                element.classList.add(name);
            }
            else {
                for (const name of value) {
                    element.classList.add(name);
                }
            }
        }
        element.setAttribute(key, String(value));
    }
    const children = properties?.children;
    if (children) {
        if (Array.isArray(children)) {
            for (const child of children.flat()) {
                if (!child)
                    continue;
                element.append(child);
            }
        }
        else {
            element.append(children);
        }
    }
    return element;
}
const jsx = jsxs;

;// CONCATENATED MODULE: ./package.json
const package_namespaceObject = {};
;// CONCATENATED MODULE: ./source/standard-extensions.ts
function standard_extensions_error(template, ...substitutions) {
    const message = String.raw(template, ...substitutions.map((x) => typeof x === "string" ? x : JSON.stringify(x)));
    throw new Error(message);
}
function exhaustive(value) {
    return standard_extensions_error `unexpected value: ${value}`;
}
function id(x) {
    return x;
}
function standard_extensions_ignore(..._args) {
    /* 引数を無視する関数 */
}
let ignoreReporterCache;
function createProgressReporter(progress, total) {
    class MessagedProgressEvent extends ProgressEvent {
        constructor(message, options) {
            super("message", options);
            this.message = message;
        }
    }
    if (progress === undefined) {
        return (ignoreReporterCache ?? (ignoreReporterCache = {
            next: standard_extensions_ignore,
            done: standard_extensions_ignore,
        }));
    }
    let loaded = 0;
    return {
        next(message) {
            loaded = Math.max(loaded + 1, total);
            progress(new MessagedProgressEvent(message, {
                lengthComputable: true,
                loaded,
                total,
            }));
        },
        done(message) {
            progress(new MessagedProgressEvent(message, {
                lengthComputable: true,
                loaded: total,
                total,
            }));
        },
    };
}
class AbortError extends Error {
    constructor(message) {
        super(message);
        this.name = "AbortError";
    }
}
function standard_extensions_newAbortError(message = "The operation was aborted.") {
    if (typeof DOMException === "function") {
        return new DOMException(message, "AbortError");
    }
    else {
        return new AbortError(message);
    }
}
function throwIfAborted(signal) {
    if (signal?.aborted) {
        throw standard_extensions_newAbortError();
    }
}
function sleep(milliseconds, option) {
    return new Promise((resolve, reject) => {
        const signal = option?.signal;
        if (signal?.aborted) {
            reject(standard_extensions_newAbortError());
            return;
        }
        const onAbort = signal
            ? () => {
                clearTimeout(id);
                reject(standard_extensions_newAbortError());
            }
            : standard_extensions_ignore;
        const id = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, milliseconds);
        signal?.addEventListener("abort", onAbort);
    });
}
function microYield() {
    return Promise.resolve();
}
function cancelToReject(promise, onCancel = standard_extensions_ignore) {
    return promise.catch((e) => {
        if (e instanceof Error && e.name === "AbortError") {
            return onCancel();
        }
        throw e;
    });
}
function createAsyncCancelScope(handleAsyncError) {
    let lastCancel = new AbortController();
    return (process) => {
        // 前の操作をキャンセル
        lastCancel.abort();
        lastCancel = new AbortController();
        handleAsyncError(
        // キャンセル例外を無視する
        cancelToReject(process(lastCancel.signal)));
    };
}
function assertTrue() {
    // 型レベルアサーション関数
}
function pipe(value, ...processes) {
    let a = value;
    for (const p of processes) {
        switch (typeof p) {
            case "function":
                a = p(a);
                break;
            case "string":
                a = a == null ? a : a[p];
                break;
            default: {
                const [f, ...xs] = p;
                a = f.call(null, a, ...xs);
                break;
            }
        }
    }
    return a;
}
const isArray = Array.isArray;
function getOrCreate(map, key, createValue) {
    if (map.has(key)) {
        return map.get(key);
    }
    const value = createValue();
    map.set(key, value);
    return value;
}

;// CONCATENATED MODULE: ./source/document-extensions.ts


function waitElementLoaded() {
    if (document.readyState !== "loading") {
        return Promise.resolve();
    }
    return new Promise((resolve) => document.addEventListener("DOMContentLoaded", () => resolve()));
}
let styleElement = null;
function addStyle(cssOrTemplate, ...substitutions) {
    const css = typeof cssOrTemplate === "string"
        ? cssOrTemplate
        : String.raw(cssOrTemplate, ...substitutions);
    if (styleElement == null) {
        styleElement = document.createElement("style");
        document.head.appendChild(styleElement);
    }
    styleElement.textContent += css + "\n";
    document.head.appendChild(styleElement);
}
function addScript(url) {
    return new Promise((onSuccess, onError) => {
        const script = document.createElement("script");
        script.onload = onSuccess;
        script.onerror = onError;
        document.head.appendChild(script);
        script.src = url;
    });
}
async function loadPackageScript(name, path) {
    function getVersion(dependency) {
        if (dependency === "" || dependency === "*") {
            return "latest";
        }
        for (const range of dependency.split("||")) {
            // `2.2 - 3.5` = `>=2.2 <=3.5`
            const version2 = /^([^\s]+)\s+-\s+([^\s]+)$/.exec(range)?.[1];
            if (version2 != null) {
                return version2;
            }
            const singleVersion = /^\s*((~|^|>=|<=)?[^\s]+)\s*$/.exec(dependency)?.[0];
            // `5.x`, `^5.2`, `~5.2`, `<=5.2`, `>5.2` などは cdn で処理されるので変換不要
            if (singleVersion != null) {
                return singleVersion;
            }
            // `>=2.2 <=3.5` など複雑な指定子は非対応
            return error `非対応のバージョン指定子 ( ${dependency} ) です。`;
        }
        return error `ここには来ない`;
    }
    function getPackageBaseUrl(name, dependency) {
        // url
        if (/^(https?:\/\/|file:)/.test(dependency)) {
            return dependency;
        }
        // ローカルパス
        if (/^(\.\.\/|~\/|\.\/|\/)/.test(dependency)) {
            return `file:${dependency}`;
        }
        // git
        if (/^git(\+(ssh|https))?:\/\//.test(dependency)) {
            return error `git URL 依存関係は対応していません。`;
        }
        // github
        if (/^[^\\]+\/.+$/.test(dependency)) {
            return error `github URL 依存関係は対応していません。`;
        }
        // 普通のバージョン指定
        const version = getVersion(dependency);
        return `https://cdn.jsdelivr.net/npm/${name}@${version}`;
    }
    const dependency = packageJson.dependencies[name];
    const baseUrl = getPackageBaseUrl(name, dependency);
    const url = `${baseUrl}/${path}`;
    await addScript(url);
    console.debug(`${url} からスクリプトを読み込みました`);
    return;
}
let parseCssColorTemp = null;
let parseCssColorRegex = null;
function parseCssColor(cssColor, result = { r: 0, g: 0, b: 0, a: 0 }) {
    const d = (parseCssColorTemp ?? (parseCssColorTemp = document.createElement("div")));
    d.style.color = cssColor;
    const m = d.style
        .getPropertyValue("color")
        .match((parseCssColorRegex ?? (parseCssColorRegex = /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/i)));
    if (!m) {
        return error `color "${cssColor}" is could not be parsed.`;
    }
    const [, r, g, b, a] = m;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    result.r = parseInt(r);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    result.g = parseInt(g);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    result.b = parseInt(b);
    result.a = a === undefined ? 1 : parseFloat(a);
    return result;
}
function addListeners(element, eventListenerMap) {
    for (const [type, listener] of Object.entries(eventListenerMap)) {
        element.addEventListener(type, listener);
    }
    return element;
}
let e;
function escapeHtml(text) {
    (e ?? (e = document.createElement("div"))).innerText = text;
    return e.innerHTML;
}
function sleepUntilNextAnimationFrame(options) {
    return new Promise((resolve, reject) => {
        const signal = options?.signal;
        if (signal?.aborted) {
            return reject(newAbortError());
        }
        const onAbort = signal
            ? () => {
                cancelAnimationFrame(id);
                reject(newAbortError());
            }
            : ignore;
        const id = requestAnimationFrame((time) => {
            signal?.removeEventListener("abort", onAbort);
            resolve(time);
        });
        signal?.addEventListener("abort", onAbort);
    });
}

;// CONCATENATED MODULE: ./source/styles.module.css
const cssText = ".display-preview-e902778cd317c5e3f3164587b5c501ef3594f1b4 {\r\n    position: fixed;\r\n    top: var(--drag-top-55daa1200ef9f5017e0db456624d226f9e5a1d3e, calc(100% - 300px));\r\n    left: var(--drag-left-2763393c4305f245944784555a1314cbf7ca062a, calc(100% - 400px));\r\n    height: 300px;\r\n    width: 400px;\r\n\r\n    background: repeating-linear-gradient(45deg,\r\n            #cccccc80,\r\n            #cccccc80 10px,\r\n            #ffffff80 10px,\r\n            #ffffff80 20px);\r\n    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);\r\n    border-radius: 1rem 1rem 0 0;\r\n    z-index: 10000;\r\n\r\n    overflow: auto;\r\n    resize: both;\r\n    display: flex;\r\n    flex-direction: column;\r\n}\r\n.maximized-0aacca35b55f11b18bc963fa58672a19352b3a34 {\r\n    /* resize: both によってブラウザによって設定されたインラインスタイルを上書きするため */\r\n    width: 100% !important;\r\n    height: 100% !important;\r\n    left: 0;\r\n    top: 0;\r\n    resize: none;\r\n}\r\n\r\n.display-preview-title-e6606ec1808ce1e6a2abe2acc9845151866c8de2 {\r\n    width: 100%;\r\n    min-height: 2em;\r\n    text-align: center;\r\n    align-content: center;\r\n    user-select: none;\r\n\r\n    padding: 0.3em;\r\n    background-color: aliceblue;\r\n    border-radius: 1rem 1rem 0 0;\r\n}\r\n.display-preview-inner-container-eb9c888ffe2cd2956bfd3d415a6e0e083971c11e {\r\n    flex-grow: 1;\r\n    overflow: auto;\r\n}\r\n.display-preview-button-b34538f3d01eefbfb538b99b78bc2bbc02731e8a {\r\n    background: whitesmoke;\r\n    border-radius: 1rem;\r\n    padding: 0.5em 1em;\r\n    margin: 0.3em 0 0.3em 0.3em\r\n}\r\n\r\n.chart-container-cdefc2f72ceaac2d40d0a1c5fd8b4bebb5db5d0d {\r\n    resize: vertical;\r\n    overflow: auto;\r\n\r\n    background: white;\r\n    width: 100%;\r\n    height: auto;\r\n    aspect-ratio: 16 / 9;\r\n}\r\n";
const variables = {
    "--drag-top": "--drag-top-55daa1200ef9f5017e0db456624d226f9e5a1d3e",
    "--drag-left": "--drag-left-2763393c4305f245944784555a1314cbf7ca062a",
};
/* harmony default export */ const styles_module = ({
    "display-preview": "display-preview-e902778cd317c5e3f3164587b5c501ef3594f1b4",
    maximized: "maximized-0aacca35b55f11b18bc963fa58672a19352b3a34",
    "display-preview-title": "display-preview-title-e6606ec1808ce1e6a2abe2acc9845151866c8de2",
    "display-preview-inner-container": "display-preview-inner-container-eb9c888ffe2cd2956bfd3d415a6e0e083971c11e",
    "display-preview-button": "display-preview-button-b34538f3d01eefbfb538b99b78bc2bbc02731e8a",
    "chart-container": "chart-container-cdefc2f72ceaac2d40d0a1c5fd8b4bebb5db5d0d",
});

// EXTERNAL MODULE: ./node_modules/worker-loader/dist/runtime/inline.js
var inline = __webpack_require__(512);
var inline_default = /*#__PURE__*/__webpack_require__.n(inline);
;// CONCATENATED MODULE: ./node_modules/worker-loader/dist/cjs.js?inline=no-fallback!./source/background.worker.ts



function Worker_fn() {
  return inline_default()("/******/ (() => { // webpackBootstrap\n/******/ \t\"use strict\";\n/******/ \t// The require scope\n/******/ \tvar __webpack_require__ = {};\n/******/ \t\n/************************************************************************/\n/******/ \t/* webpack/runtime/define property getters */\n/******/ \t(() => {\n/******/ \t\t// define getter functions for harmony exports\n/******/ \t\t__webpack_require__.d = (exports, definition) => {\n/******/ \t\t\tfor(var key in definition) {\n/******/ \t\t\t\tif(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {\n/******/ \t\t\t\t\tObject.defineProperty(exports, key, { enumerable: true, get: definition[key] });\n/******/ \t\t\t\t}\n/******/ \t\t\t}\n/******/ \t\t};\n/******/ \t})();\n/******/ \t\n/******/ \t/* webpack/runtime/hasOwnProperty shorthand */\n/******/ \t(() => {\n/******/ \t\t__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))\n/******/ \t})();\n/******/ \t\n/******/ \t/* webpack/runtime/make namespace object */\n/******/ \t(() => {\n/******/ \t\t// define __esModule on exports\n/******/ \t\t__webpack_require__.r = (exports) => {\n/******/ \t\t\tif(typeof Symbol !== 'undefined' && Symbol.toStringTag) {\n/******/ \t\t\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });\n/******/ \t\t\t}\n/******/ \t\t\tObject.defineProperty(exports, '__esModule', { value: true });\n/******/ \t\t};\n/******/ \t})();\n/******/ \t\n/************************************************************************/\nvar __webpack_exports__ = {};\n\n// NAMESPACE OBJECT: ./source/background-module.ts\nvar background_module_namespaceObject = {};\n__webpack_require__.r(background_module_namespaceObject);\n__webpack_require__.d(background_module_namespaceObject, {\n  calculateSubmissionCharts: () => (calculateSubmissionCharts)\n});\n\n;// CONCATENATED MODULE: ./node_modules/comlink/dist/esm/comlink.mjs\n/**\n * @license\n * Copyright 2019 Google LLC\n * SPDX-License-Identifier: Apache-2.0\n */\nconst proxyMarker = Symbol(\"Comlink.proxy\");\nconst createEndpoint = Symbol(\"Comlink.endpoint\");\nconst releaseProxy = Symbol(\"Comlink.releaseProxy\");\nconst finalizer = Symbol(\"Comlink.finalizer\");\nconst throwMarker = Symbol(\"Comlink.thrown\");\nconst isObject = (val) => (typeof val === \"object\" && val !== null) || typeof val === \"function\";\n/**\n * Internal transfer handle to handle objects marked to proxy.\n */\nconst proxyTransferHandler = {\n    canHandle: (val) => isObject(val) && val[proxyMarker],\n    serialize(obj) {\n        const { port1, port2 } = new MessageChannel();\n        expose(obj, port1);\n        return [port2, [port2]];\n    },\n    deserialize(port) {\n        port.start();\n        return wrap(port);\n    },\n};\n/**\n * Internal transfer handler to handle thrown exceptions.\n */\nconst throwTransferHandler = {\n    canHandle: (value) => isObject(value) && throwMarker in value,\n    serialize({ value }) {\n        let serialized;\n        if (value instanceof Error) {\n            serialized = {\n                isError: true,\n                value: {\n                    message: value.message,\n                    name: value.name,\n                    stack: value.stack,\n                },\n            };\n        }\n        else {\n            serialized = { isError: false, value };\n        }\n        return [serialized, []];\n    },\n    deserialize(serialized) {\n        if (serialized.isError) {\n            throw Object.assign(new Error(serialized.value.message), serialized.value);\n        }\n        throw serialized.value;\n    },\n};\n/**\n * Allows customizing the serialization of certain values.\n */\nconst transferHandlers = new Map([\n    [\"proxy\", proxyTransferHandler],\n    [\"throw\", throwTransferHandler],\n]);\nfunction isAllowedOrigin(allowedOrigins, origin) {\n    for (const allowedOrigin of allowedOrigins) {\n        if (origin === allowedOrigin || allowedOrigin === \"*\") {\n            return true;\n        }\n        if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {\n            return true;\n        }\n    }\n    return false;\n}\nfunction expose(obj, ep = globalThis, allowedOrigins = [\"*\"]) {\n    ep.addEventListener(\"message\", function callback(ev) {\n        if (!ev || !ev.data) {\n            return;\n        }\n        if (!isAllowedOrigin(allowedOrigins, ev.origin)) {\n            console.warn(`Invalid origin '${ev.origin}' for comlink proxy`);\n            return;\n        }\n        const { id, type, path } = Object.assign({ path: [] }, ev.data);\n        const argumentList = (ev.data.argumentList || []).map(fromWireValue);\n        let returnValue;\n        try {\n            const parent = path.slice(0, -1).reduce((obj, prop) => obj[prop], obj);\n            const rawValue = path.reduce((obj, prop) => obj[prop], obj);\n            switch (type) {\n                case \"GET\" /* MessageType.GET */:\n                    {\n                        returnValue = rawValue;\n                    }\n                    break;\n                case \"SET\" /* MessageType.SET */:\n                    {\n                        parent[path.slice(-1)[0]] = fromWireValue(ev.data.value);\n                        returnValue = true;\n                    }\n                    break;\n                case \"APPLY\" /* MessageType.APPLY */:\n                    {\n                        returnValue = rawValue.apply(parent, argumentList);\n                    }\n                    break;\n                case \"CONSTRUCT\" /* MessageType.CONSTRUCT */:\n                    {\n                        const value = new rawValue(...argumentList);\n                        returnValue = proxy(value);\n                    }\n                    break;\n                case \"ENDPOINT\" /* MessageType.ENDPOINT */:\n                    {\n                        const { port1, port2 } = new MessageChannel();\n                        expose(obj, port2);\n                        returnValue = transfer(port1, [port1]);\n                    }\n                    break;\n                case \"RELEASE\" /* MessageType.RELEASE */:\n                    {\n                        returnValue = undefined;\n                    }\n                    break;\n                default:\n                    return;\n            }\n        }\n        catch (value) {\n            returnValue = { value, [throwMarker]: 0 };\n        }\n        Promise.resolve(returnValue)\n            .catch((value) => {\n            return { value, [throwMarker]: 0 };\n        })\n            .then((returnValue) => {\n            const [wireValue, transferables] = toWireValue(returnValue);\n            ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);\n            if (type === \"RELEASE\" /* MessageType.RELEASE */) {\n                // detach and deactive after sending release response above.\n                ep.removeEventListener(\"message\", callback);\n                closeEndPoint(ep);\n                if (finalizer in obj && typeof obj[finalizer] === \"function\") {\n                    obj[finalizer]();\n                }\n            }\n        })\n            .catch((error) => {\n            // Send Serialization Error To Caller\n            const [wireValue, transferables] = toWireValue({\n                value: new TypeError(\"Unserializable return value\"),\n                [throwMarker]: 0,\n            });\n            ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);\n        });\n    });\n    if (ep.start) {\n        ep.start();\n    }\n}\nfunction isMessagePort(endpoint) {\n    return endpoint.constructor.name === \"MessagePort\";\n}\nfunction closeEndPoint(endpoint) {\n    if (isMessagePort(endpoint))\n        endpoint.close();\n}\nfunction wrap(ep, target) {\n    return createProxy(ep, [], target);\n}\nfunction throwIfProxyReleased(isReleased) {\n    if (isReleased) {\n        throw new Error(\"Proxy has been released and is not useable\");\n    }\n}\nfunction releaseEndpoint(ep) {\n    return requestResponseMessage(ep, {\n        type: \"RELEASE\" /* MessageType.RELEASE */,\n    }).then(() => {\n        closeEndPoint(ep);\n    });\n}\nconst proxyCounter = new WeakMap();\nconst proxyFinalizers = \"FinalizationRegistry\" in globalThis &&\n    new FinalizationRegistry((ep) => {\n        const newCount = (proxyCounter.get(ep) || 0) - 1;\n        proxyCounter.set(ep, newCount);\n        if (newCount === 0) {\n            releaseEndpoint(ep);\n        }\n    });\nfunction registerProxy(proxy, ep) {\n    const newCount = (proxyCounter.get(ep) || 0) + 1;\n    proxyCounter.set(ep, newCount);\n    if (proxyFinalizers) {\n        proxyFinalizers.register(proxy, ep, proxy);\n    }\n}\nfunction unregisterProxy(proxy) {\n    if (proxyFinalizers) {\n        proxyFinalizers.unregister(proxy);\n    }\n}\nfunction createProxy(ep, path = [], target = function () { }) {\n    let isProxyReleased = false;\n    const proxy = new Proxy(target, {\n        get(_target, prop) {\n            throwIfProxyReleased(isProxyReleased);\n            if (prop === releaseProxy) {\n                return () => {\n                    unregisterProxy(proxy);\n                    releaseEndpoint(ep);\n                    isProxyReleased = true;\n                };\n            }\n            if (prop === \"then\") {\n                if (path.length === 0) {\n                    return { then: () => proxy };\n                }\n                const r = requestResponseMessage(ep, {\n                    type: \"GET\" /* MessageType.GET */,\n                    path: path.map((p) => p.toString()),\n                }).then(fromWireValue);\n                return r.then.bind(r);\n            }\n            return createProxy(ep, [...path, prop]);\n        },\n        set(_target, prop, rawValue) {\n            throwIfProxyReleased(isProxyReleased);\n            // FIXME: ES6 Proxy Handler `set` methods are supposed to return a\n            // boolean. To show good will, we return true asynchronously ¯\\_(ツ)_/¯\n            const [value, transferables] = toWireValue(rawValue);\n            return requestResponseMessage(ep, {\n                type: \"SET\" /* MessageType.SET */,\n                path: [...path, prop].map((p) => p.toString()),\n                value,\n            }, transferables).then(fromWireValue);\n        },\n        apply(_target, _thisArg, rawArgumentList) {\n            throwIfProxyReleased(isProxyReleased);\n            const last = path[path.length - 1];\n            if (last === createEndpoint) {\n                return requestResponseMessage(ep, {\n                    type: \"ENDPOINT\" /* MessageType.ENDPOINT */,\n                }).then(fromWireValue);\n            }\n            // We just pretend that `bind()` didn’t happen.\n            if (last === \"bind\") {\n                return createProxy(ep, path.slice(0, -1));\n            }\n            const [argumentList, transferables] = processArguments(rawArgumentList);\n            return requestResponseMessage(ep, {\n                type: \"APPLY\" /* MessageType.APPLY */,\n                path: path.map((p) => p.toString()),\n                argumentList,\n            }, transferables).then(fromWireValue);\n        },\n        construct(_target, rawArgumentList) {\n            throwIfProxyReleased(isProxyReleased);\n            const [argumentList, transferables] = processArguments(rawArgumentList);\n            return requestResponseMessage(ep, {\n                type: \"CONSTRUCT\" /* MessageType.CONSTRUCT */,\n                path: path.map((p) => p.toString()),\n                argumentList,\n            }, transferables).then(fromWireValue);\n        },\n    });\n    registerProxy(proxy, ep);\n    return proxy;\n}\nfunction myFlat(arr) {\n    return Array.prototype.concat.apply([], arr);\n}\nfunction processArguments(argumentList) {\n    const processed = argumentList.map(toWireValue);\n    return [processed.map((v) => v[0]), myFlat(processed.map((v) => v[1]))];\n}\nconst transferCache = new WeakMap();\nfunction transfer(obj, transfers) {\n    transferCache.set(obj, transfers);\n    return obj;\n}\nfunction proxy(obj) {\n    return Object.assign(obj, { [proxyMarker]: true });\n}\nfunction windowEndpoint(w, context = globalThis, targetOrigin = \"*\") {\n    return {\n        postMessage: (msg, transferables) => w.postMessage(msg, targetOrigin, transferables),\n        addEventListener: context.addEventListener.bind(context),\n        removeEventListener: context.removeEventListener.bind(context),\n    };\n}\nfunction toWireValue(value) {\n    for (const [name, handler] of transferHandlers) {\n        if (handler.canHandle(value)) {\n            const [serializedValue, transferables] = handler.serialize(value);\n            return [\n                {\n                    type: \"HANDLER\" /* WireValueType.HANDLER */,\n                    name,\n                    value: serializedValue,\n                },\n                transferables,\n            ];\n        }\n    }\n    return [\n        {\n            type: \"RAW\" /* WireValueType.RAW */,\n            value,\n        },\n        transferCache.get(value) || [],\n    ];\n}\nfunction fromWireValue(value) {\n    switch (value.type) {\n        case \"HANDLER\" /* WireValueType.HANDLER */:\n            return transferHandlers.get(value.name).deserialize(value.value);\n        case \"RAW\" /* WireValueType.RAW */:\n            return value.value;\n    }\n}\nfunction requestResponseMessage(ep, msg, transfers) {\n    return new Promise((resolve) => {\n        const id = generateUUID();\n        ep.addEventListener(\"message\", function l(ev) {\n            if (!ev.data || !ev.data.id || ev.data.id !== id) {\n                return;\n            }\n            ep.removeEventListener(\"message\", l);\n            resolve(ev.data);\n        });\n        if (ep.start) {\n            ep.start();\n        }\n        ep.postMessage(Object.assign({ id }, msg), transfers);\n    });\n}\nfunction generateUUID() {\n    return new Array(4)\n        .fill(0)\n        .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))\n        .join(\"-\");\n}\n\n\n;// CONCATENATED MODULE: ./source/standard-extensions.ts\nfunction error(template, ...substitutions) {\n    const message = String.raw(template, ...substitutions.map((x) => typeof x === \"string\" ? x : JSON.stringify(x)));\n    throw new Error(message);\n}\nfunction exhaustive(value) {\n    return error `unexpected value: ${value}`;\n}\nfunction id(x) {\n    return x;\n}\nfunction ignore(..._args) {\n    /* 引数を無視する関数 */\n}\nlet ignoreReporterCache;\nfunction createProgressReporter(progress, total) {\n    class MessagedProgressEvent extends ProgressEvent {\n        constructor(message, options) {\n            super(\"message\", options);\n            this.message = message;\n        }\n    }\n    if (progress === undefined) {\n        return (ignoreReporterCache ?? (ignoreReporterCache = {\n            next: ignore,\n            done: ignore,\n        }));\n    }\n    let loaded = 0;\n    return {\n        next(message) {\n            loaded = Math.max(loaded + 1, total);\n            progress(new MessagedProgressEvent(message, {\n                lengthComputable: true,\n                loaded,\n                total,\n            }));\n        },\n        done(message) {\n            progress(new MessagedProgressEvent(message, {\n                lengthComputable: true,\n                loaded: total,\n                total,\n            }));\n        },\n    };\n}\nclass AbortError extends Error {\n    constructor(message) {\n        super(message);\n        this.name = \"AbortError\";\n    }\n}\nfunction newAbortError(message = \"The operation was aborted.\") {\n    if (typeof DOMException === \"function\") {\n        return new DOMException(message, \"AbortError\");\n    }\n    else {\n        return new AbortError(message);\n    }\n}\nfunction throwIfAborted(signal) {\n    if (signal?.aborted) {\n        throw newAbortError();\n    }\n}\nfunction sleep(milliseconds, option) {\n    return new Promise((resolve, reject) => {\n        const signal = option?.signal;\n        if (signal?.aborted) {\n            reject(newAbortError());\n            return;\n        }\n        const onAbort = signal\n            ? () => {\n                clearTimeout(id);\n                reject(newAbortError());\n            }\n            : ignore;\n        const id = setTimeout(() => {\n            signal?.removeEventListener(\"abort\", onAbort);\n            resolve();\n        }, milliseconds);\n        signal?.addEventListener(\"abort\", onAbort);\n    });\n}\nfunction microYield() {\n    return Promise.resolve();\n}\nfunction cancelToReject(promise, onCancel = ignore) {\n    return promise.catch((e) => {\n        if (e instanceof Error && e.name === \"AbortError\") {\n            return onCancel();\n        }\n        throw e;\n    });\n}\nfunction createAsyncCancelScope(handleAsyncError) {\n    let lastCancel = new AbortController();\n    return (process) => {\n        // 前の操作をキャンセル\n        lastCancel.abort();\n        lastCancel = new AbortController();\n        handleAsyncError(\n        // キャンセル例外を無視する\n        cancelToReject(process(lastCancel.signal)));\n    };\n}\nfunction assertTrue() {\n    // 型レベルアサーション関数\n}\nfunction pipe(value, ...processes) {\n    let a = value;\n    for (const p of processes) {\n        switch (typeof p) {\n            case \"function\":\n                a = p(a);\n                break;\n            case \"string\":\n                a = a == null ? a : a[p];\n                break;\n            default: {\n                const [f, ...xs] = p;\n                a = f.call(null, a, ...xs);\n                break;\n            }\n        }\n    }\n    return a;\n}\nconst isArray = Array.isArray;\nfunction getOrCreate(map, key, createValue) {\n    if (map.has(key)) {\n        return map.get(key);\n    }\n    const value = createValue();\n    map.set(key, value);\n    return value;\n}\n\n;// CONCATENATED MODULE: ./source/submission-series.ts\n// spell-checker: ignore echarts\n\nconst privateTaggedSymbol = Symbol(\"privateTaggedSymbol\");\nlet tempDate = null;\nfunction getStartOfLocalMonth(time) {\n    const d = (tempDate ?? (tempDate = new Date()));\n    d.setTime(time);\n    d.setDate(1);\n    d.setHours(0, 0, 0, 0);\n    return d.getTime();\n}\nfunction parseAsLocalTicks(dayString) {\n    const [year, month, day] = dayString.split(\"-\");\n    const d = (tempDate ?? (tempDate = new Date()));\n    d.setTime(0);\n    d.setFullYear(Number(year), Number(month) - 1, Number(day));\n    d.setHours(0, 0, 0, 0);\n    return d.getTime();\n}\nfunction newMap() {\n    return new Map();\n}\nfunction calculateAcceptedRatios(periodToStatusToNominations, cumulative) {\n    // 一定期間毎の承認率を算出\n    // 承認率 = 承認数 / (承認数 + 否認数 + 重複数 + 取下数)\n    let acceptedCount = 0;\n    let notAcceptedCount = 0;\n    const data = [];\n    for (const [period, statuses] of periodToStatusToNominations) {\n        const acceptedPerPeriod = statuses.get(\"ACCEPTED\")?.length ?? 0;\n        const notAcceptedPerPeriod = (statuses.get(\"REJECTED\")?.length ?? 0) +\n            (statuses.get(\"DUPLICATE\")?.length ?? 0) +\n            (statuses.get(\"WITHDRAWN\")?.length ?? 0);\n        acceptedCount = cumulative\n            ? acceptedCount + acceptedPerPeriod\n            : acceptedPerPeriod;\n        notAcceptedCount = cumulative\n            ? notAcceptedCount + notAcceptedPerPeriod\n            : notAcceptedPerPeriod;\n        if (0 === acceptedCount + notAcceptedCount)\n            continue;\n        data.push([period, acceptedCount / (acceptedCount + notAcceptedCount)]);\n    }\n    return data;\n}\nconst statusToColor = {\n    ACCEPTED: \"#15803d\", // 緑 ( 公式 )\n    REJECTED: \"#dc2626\", // 赤 ( 公式 )\n    DUPLICATE: \"#dc9c26\", // オレンジ\n    HELD: \"#211580\", // 青\n    WITHDRAWN: \"#c026dc\", // 紫\n};\nconst lineSeries = {\n    type: \"line\",\n    symbol: \"none\",\n    step: \"end\",\n};\nconst barSeries = {\n    type: \"bar\",\n};\nasync function calculateSubmissionSeries(nominations, names) {\n    // 日時でソートする\n    const nominationWithTicks = nominations\n        .map((n) => ({\n        ...n,\n        dayTicks: parseAsLocalTicks(n.day),\n    }))\n        .sort((a, b) => a.dayTicks - b.dayTicks);\n    // インデックスを作成\n    const dayToStatusToNominations = new Map();\n    const statusToDayToNominations = new Map();\n    const dayToNominations = new Map();\n    const statusToMonthToNominations = new Map();\n    const monthToStatusToNominations = new Map();\n    for (const n of nominationWithTicks) {\n        const month = getStartOfLocalMonth(n.dayTicks);\n        getOrCreate(getOrCreate(dayToStatusToNominations, n.dayTicks, newMap), n.status, Array).push(n);\n        getOrCreate(getOrCreate(statusToDayToNominations, n.status, newMap), n.dayTicks, Array).push(n);\n        getOrCreate(dayToNominations, n.dayTicks, Array).push(n);\n        getOrCreate(getOrCreate(statusToMonthToNominations, n.status, newMap), month, Array).push(n);\n        getOrCreate(getOrCreate(monthToStatusToNominations, month, newMap), n.status, Array).push(n);\n    }\n    const result = [];\n    // 日毎の累計状態数\n    for (const [status, days] of statusToDayToNominations) {\n        const data = [];\n        let cumulativeCount = 0;\n        for (const [day, nominations] of days) {\n            data.push([day, (cumulativeCount += nominations.length)]);\n        }\n        result.push({\n            ...lineSeries,\n            name: `${names.statuses[status] || status}`,\n            data,\n            itemStyle: {\n                color: statusToColor[status],\n            },\n        });\n    }\n    // 月毎状態数\n    for (const [status, months] of statusToMonthToNominations) {\n        const data = [];\n        for (const [month, nominations] of months) {\n            data.push([month, nominations.length]);\n        }\n        result.push({\n            ...barSeries,\n            name: `${names.statuses[status] || status}/${names.statusCountPerMonth}`,\n            data,\n            itemStyle: {\n                color: statusToColor[status],\n            },\n        });\n    }\n    // 日毎の累計承認率\n    result.push({\n        ...lineSeries,\n        name: names.cumulativeAcceptedRatioPerDay,\n        data: calculateAcceptedRatios(dayToStatusToNominations, true),\n        itemStyle: { color: statusToColor[\"ACCEPTED\"] },\n    });\n    // 月毎の承認率\n    result.push({\n        ...barSeries,\n        name: names.acceptedRatioPerMonth,\n        data: calculateAcceptedRatios(monthToStatusToNominations, false),\n    });\n    return result;\n}\n\n;// CONCATENATED MODULE: ./source/submissions.ts\nfunction parseNominations(response) {\n    const json = JSON.parse(response);\n    if (json == null)\n        throw new Error(\"Invalid response from Wayfarer\");\n    /** TODO: zod などで実行時チェックする */\n    const data = json;\n    const nominations = data.result.submissions.filter((s) => s.type === \"NOMINATION\");\n    return nominations;\n}\n\n;// CONCATENATED MODULE: ./source/background-module.ts\n\n\nasync function calculateSubmissionCharts(data, names) {\n    const nominations = parseNominations(data);\n    return await calculateSubmissionSeries(nominations, names);\n}\n\n;// CONCATENATED MODULE: ./node_modules/ts-loader/index.js!./source/background.worker.ts\n\n\nexpose(background_module_namespaceObject);\n\n/******/ })()\n;\n//# sourceMappingURL=wayfarer-statistics-charts.user.worker.js.map", "Worker", undefined, undefined);
}

;// CONCATENATED MODULE: ./source/submissions.ts
function parseNominations(response) {
    const json = JSON.parse(response);
    if (json == null)
        throw new Error("Invalid response from Wayfarer");
    /** TODO: zod などで実行時チェックする */
    const data = json;
    const nominations = data.result.submissions.filter((s) => s.type === "NOMINATION");
    return nominations;
}

;// CONCATENATED MODULE: ./source/chart-options.ts




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
    };
}
async function loadBackgroundModule() {
    const comlink = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 144));
    return comlink.wrap(new Worker_fn());
}
let backgroundModule;
function importBackgroundModule() {
    return (backgroundModule ?? (backgroundModule = loadBackgroundModule()));
}
async function* createCurrentChartOption(response, names) {
    const submissions = parseNominations(response);
    const statusToCount = new Map();
    for (const { status } of submissions) {
        const count = statusToCount.get(status) ?? 0;
        statusToCount.set(status, count + 1);
    }
    const statusAndCounts = [...statusToCount.entries()]
        .sort((a, b) => a[1] - b[1])
        .reverse();
    const series = {
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
    };
}
async function* createHistoryChartOption(response, names) {
    const background = await importBackgroundModule();
    const series = await background.calculateSubmissionCharts(response, names);
    yield {
        ...createBaseEChartOption(),
        xAxis: {
            type: "time",
            axisLabel: {
                formatter: (value) => {
                    const date = new Date(value);
                    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
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
                let result = `${new Date((params[0]?.value)[0]).toLocaleString()}<br/>`;
                for (const param of params) {
                    result += `${param.seriesName}: ${param.value[1]}<br/>`;
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
function newMap() {
    return new Map();
}
async function* createCitiesChartOption(response, _names) {
    const nominations = parseNominations(response);
    const stateToCityToNominations = new Map();
    for (const nomination of nominations) {
        const { state, city } = nomination;
        const cityToNominations = getOrCreate(stateToCityToNominations, state, newMap);
        const nominations = getOrCreate(cityToNominations, city, Array);
        nominations.push(nomination);
    }
    const data = [];
    for (const [state, cityToNominations] of stateToCityToNominations) {
        let nominationCountAtState = 0;
        const childrenAtState = [];
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
        const series = {
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
                        return standard_extensions_error `${info} should be an array`;
                    const value = info.value;
                    const treePathInfo = "treePathInfo" in info &&
                        Array.isArray(info.treePathInfo)
                        ? info.treePathInfo
                        : [];
                    const treePath = treePathInfo.map((path) => {
                        if (path != null &&
                            typeof path === "object" &&
                            "name" in path &&
                            typeof path.name === "string") {
                            return path.name;
                        }
                        return standard_extensions_error `path is not a string or an array`;
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
        };
    }
}

;// CONCATENATED MODULE: ./source/wayfarer-statistics-charts.tsx

// spell-checker: ignore echarts




function handleAsyncError(e) {
    console.error(e);
}
function makeDraggable(element, handleElement, options) {
    let isDragging = false;
    let offsetX = 0, offsetY = 0;
    element.addEventListener("mousedown", (e) => {
        if (e.target !== handleElement)
            return;
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
            }
            else {
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }
        }
    });
    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
}
function displayDialog(innerElement, choices, title = "") {
    return new Promise((resolve) => {
        const buttons = choices.map((choice) => {
            const button = (jsx("button", { class: styles_module["display-preview-button"], children: choice }));
            button.addEventListener("click", () => {
                document.body.removeChild(previewDiv);
                resolve(choice);
            });
            return button;
        });
        const titleDiv = (jsx("div", { class: styles_module["display-preview-title"], children: title }));
        const previewDiv = (jsxs("div", { class: styles_module["display-preview"], children: [titleDiv, jsx("div", { class: styles_module["display-preview-inner-container"], children: innerElement }), jsx("div", { children: buttons })] }));
        titleDiv.addEventListener("dblclick", () => previewDiv.classList.toggle(styles_module["maximized"]));
        makeDraggable(previewDiv, titleDiv, {
            propertyNames: {
                left: variables["--drag-left"],
                top: variables["--drag-top"],
            },
        });
        document.body.appendChild(previewDiv);
    });
}
function eventToAsyncIterator(target, eventName) {
    let listeners = [];
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
    function onEvent(event) {
        const listener = listeners.shift();
        listener?.({ value: event, done: false });
    }
}
function interceptApiToValues() {
    return new Promise((resolve) => {
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (...args) {
            const [method, url] = args;
            if (url == "/api/v1/vault/manage") {
                if (method == "GET") {
                    resolve(eventToAsyncIterator(this, "load"));
                }
            }
            originalOpen.apply(this, args);
        };
    });
}
async function createResizableChartContainer() {
    const containerElement = (jsx("div", { class: styles_module["chart-container"] }));
    const echarts = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 229));
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
async function setChartOptionsAsync(containerElement, dynamicOptions) {
    const { containerElement: element, chart } = await createResizableChartContainer();
    containerElement.appendChild(element);
    for await (const option of dynamicOptions) {
        chart.setOption(option);
    }
}
async function displayCharts(statistics) {
    const chartContainerElements = statistics.map((dynamicOptions) => {
        const container = jsx("div", {});
        setChartOptionsAsync(container, dynamicOptions).catch((e) => {
            container.append(jsx("div", { children: e instanceof Error ? e.message : String(e) }));
            handleAsyncError(e);
        });
        return container;
    });
    const statisticsContainerElement = jsx("div", { children: chartContainerElements });
    await displayDialog(statisticsContainerElement, ["OK"]);
}
function getDefaultNames() {
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
            NOMINATED: "審査中",
            REJECTED: "否認",
            VOTING: "投票中",
            WITHDRAWN: "取下済",
        },
    };
}
const statisticsNamesKey = "wayfarer-statistics-names-0f7497e6-35bc-4810-88e4-1d2510b4ae08";
function loadNames() {
    const baseNames = getDefaultNames();
    let extendedNames;
    {
        const namesJson = localStorage.getItem(statisticsNamesKey);
        if (namesJson != null) {
            try {
                extendedNames = JSON.parse(namesJson);
            }
            catch {
                // ignore
            }
        }
    }
    if (extendedNames == null)
        return baseNames;
    return {
        ...baseNames,
        ...extendedNames,
        // TODO: DeepMerge
    };
}
async function asyncMain() {
    addStyle(cssText);
    for await (const value of await interceptApiToValues()) {
        const response = value.currentTarget
            .response;
        console.debug("manage response: ", response);
        if (typeof response !== "string")
            return standard_extensions_error `response must be a string`;
        const names = loadNames();
        await displayCharts([
            createCurrentChartOption(response, names),
            createCitiesChartOption(response, names),
            createHistoryChartOption(response, names),
        ]);
    }
}


/***/ }),

/***/ 529:
/***/ ((module, __unused_webpack___webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony import */ var _wayfarer_statistics_charts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(999);
await _wayfarer_statistics_charts__WEBPACK_IMPORTED_MODULE_0__/* .asyncMain */ .c();

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ }),

/***/ 512:
/***/ ((module) => {



/* eslint-env browser */

/* eslint-disable no-undef, no-use-before-define, new-cap */
module.exports = function (content, workerConstructor, workerOptions, url) {
  var globalScope = self || window;

  try {
    try {
      var blob;

      try {
        // New API
        blob = new globalScope.Blob([content]);
      } catch (e) {
        // BlobBuilder = Deprecated, but widely implemented
        var BlobBuilder = globalScope.BlobBuilder || globalScope.WebKitBlobBuilder || globalScope.MozBlobBuilder || globalScope.MSBlobBuilder;
        blob = new BlobBuilder();
        blob.append(content);
        blob = blob.getBlob();
      }

      var URL = globalScope.URL || globalScope.webkitURL;
      var objectURL = URL.createObjectURL(blob);
      var worker = new globalScope[workerConstructor](objectURL, workerOptions);
      URL.revokeObjectURL(objectURL);
      return worker;
    } catch (e) {
      return new globalScope[workerConstructor]("data:application/javascript,".concat(encodeURIComponent(content)), workerOptions);
    }
  } catch (e) {
    if (!url) {
      throw Error("Inline worker is not supported");
    }

    return new globalScope[workerConstructor](url, workerOptions);
  }
};

/***/ }),

/***/ 144:
/***/ ((module) => {

module.exports = import("https://cdn.jsdelivr.net/npm/comlink@4.4.1/+esm");;

/***/ }),

/***/ 229:
/***/ ((module) => {

module.exports = import("https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.esm.min.mjs");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			body((deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}, (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue)));
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(529);
/******/ 	
/******/ })()
;
//# sourceMappingURL=wayfarer-statistics-charts.user.js.map