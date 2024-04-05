"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = exports.DappletOverlay = void 0;
__exportStar(require("./engine"), exports);
var dapplet_overlay_1 = require("./custom-elements/dapplet-overlay");
Object.defineProperty(exports, "DappletOverlay", { enumerable: true, get: function () { return dapplet_overlay_1.DappletOverlay; } });
var local_storage_1 = require("./storage/local-storage");
Object.defineProperty(exports, "LocalStorage", { enumerable: true, get: function () { return local_storage_1.LocalStorage; } });
