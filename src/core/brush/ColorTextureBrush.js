// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import AbstractEffectBrush from "./AbstractEffectBrush";
import Assets from "../../Assets";
import ElementTail from "../ElementTail";
import Element from "../Element";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-05
 */
export default class ColorTextureBrush extends AbstractEffectBrush {

    /** @type ImageData|null */
    #imageData = null;

    constructor(innerBrush, base64) {
        super(innerBrush);

        Assets.asImageData(base64).then(imageData => this.#imageData = imageData);
    }

    apply(x, y, random, oldElement) {
        const element = this._retrieveElement(x, y, random, oldElement);

        if (this.#imageData != null) {
            const cx = x % this.#imageData.width;
            const cy = y % this.#imageData.height;
            const index = (cy * this.#imageData.width + cx) * 4;

            const red = this.#imageData.data[index];
            const green = this.#imageData.data[index + 1];
            const blue = this.#imageData.data[index + 2];
            // const alpha = this.#imageData.data[index + 3];

            const newElementTail = ElementTail.setColor(element.elementTail, red, green, blue);
            return new Element(element.elementHead, newElementTail);

        } else {
            return element;
        }
    }
}