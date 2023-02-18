import {Brush} from "./Brush.js";
import {ElementTail} from "./ElementTail.js";
import {Assets} from "../Assets.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-01-28
 */
export class TextureBrush extends Brush {
    static ofBase64(innerBrush, base64) {
        return new TextureBrush(innerBrush, base64);
    }

    /** @type Brush */
    #innerBrush;

    /** @type ImageData|null */
    #imageData = null;

    constructor(innerBrush, base64) {
        super();
        this.#innerBrush = innerBrush;

        Assets.asImageData(base64).then(imageData => this.#imageData = imageData);
    }

    apply(x, y, random) {
        const element = this.#innerBrush.apply(x, y, random);

        if (this.#imageData != null) {
            const cx = x % this.#imageData.width;
            const cy = y % this.#imageData.height;
            const index = (cy * this.#imageData.width + cx) * 4;

            const red = this.#imageData.data[index];
            const green = this.#imageData.data[index + 1];
            const blue = this.#imageData.data[index + 2];
            // const alpha = this.#imageData.data[index + 3];

            element.elementTail = ElementTail.setColor(element.elementTail, red, green, blue);
        }
        return element;
    }
}