// ==UserScript==
// @id           wayfarer-statistics-charts
// @name         Wayfarer Statistics Charts
// @namespace    http://tampermonkey.net/
// @downloadURL  https://github.com/wiinuk/wayfarer-statistics-charts/raw/main/wayfarer-statistics-charts.user.js
// @updateURL    https://github.com/wiinuk/wayfarer-statistics-charts/raw/main/wayfarer-statistics-charts.user.js
// @homepageURL  https://github.com/wiinuk/wayfarer-statistics-charts
// @version      0.4.0
// @description  Visualize statistics of Niantic Wayfarer submissions.
// @author       Wiinuk
// @match        https://wayfarer.scopely.com/*
// @grant        none
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?sz=64&domain=scopely.com
// ==/UserScript==

import * as MainModule from "./wayfarer-statistics-charts";
await MainModule.asyncMain();
