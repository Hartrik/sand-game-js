// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import RenderingMode from "./RenderingMode.js";
import ElementHead from "../ElementHead.js";
import Assets from "../../Assets.js";

import _ASSET_GRADIENT_RAINBOW from './assets/heatmap.palette.png'

/**
 * @author Patrik Harag
 * @version 2023-08-14
 */
export default class RenderingModeHeatmap extends RenderingMode {

    /** @type ImageData */
    #gradientImageData = null;

    constructor() {
        super();
        Assets.asImageData(_ASSET_GRADIENT_RAINBOW).then(d => this.#gradientImageData = d);
    }

    apply(data, dataIndex, elementHead, elementTail) {
        if (this.#gradientImageData === null) {
            // not loaded yet
            return;
        }

        if (elementHead === 0x00) {
            // background
            data[dataIndex] = 0x00;
            data[dataIndex + 1] = 0x00;
            data[dataIndex + 2] = 0x00;
        } else {
            const temperature = ElementHead.getTemperature(elementHead);
            const x = Math.trunc(temperature / (1 << ElementHead.FIELD_TEMPERATURE_SIZE) * this.#gradientImageData.width);
            const gradIndex = x * 4;
            data[dataIndex] = this.#gradientImageData.data[gradIndex];
            data[dataIndex + 1] = this.#gradientImageData.data[gradIndex + 1];
            data[dataIndex + 2] = this.#gradientImageData.data[gradIndex + 2];
        }
    }
}