// ==UserScript==
// @id           wayfarer-statistics-charts
// @name         Wayfarer Statistics Charts
// @namespace    http://tampermonkey.net/
// @downloadURL  https://github.com/wiinuk/wayfarer-statistics-charts/raw/main/wayfarer-statistics-charts.user.js
// @updateURL    https://github.com/wiinuk/wayfarer-statistics-charts/raw/main/wayfarer-statistics-charts.user.js
// @homepageURL  https://github.com/wiinuk/wayfarer-statistics-charts
// @version      0.2.0
// @description  Visualize statistics of Niantic Wayfarer submissions.
// @author       Wiinuk
// @match        https://wayfarer.nianticlabs.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nianticlabs.com
// @grant        GM_info
// ==/UserScript==

import * as MainModule from "./wayfarer-statistics-charts";
await MainModule.asyncMain();
