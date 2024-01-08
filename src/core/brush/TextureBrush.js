import {Assets} from "../../Assets";
import {ElementTail} from "../ElementTail";
import {Brush} from "./Brush";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-20
 */
export class TextureBrush extends Brush {

    /** @type Brush */
    #innerBrush;

    /** @type ImageData|null */
    #imageData = null;

    constructor(innerBrush, base64) {
        super();
        this.#innerBrush = innerBrush;

        Assets.asImageData(base64).then(imageData => this.#imageData = imageData);
    }

    apply(x, y, random, oldElement) {
        const element = this.#innerBrush.apply(x, y, random);
        if (element === null) {
            return null;
        }

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