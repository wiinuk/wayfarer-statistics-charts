import * as comlink from "comlink";
import * as module from "./background-module";
export type Module = typeof import("./background-module");
comlink.expose(module);
