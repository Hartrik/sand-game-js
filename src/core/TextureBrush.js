import {Brush} from "./Brush.js";
import {ElementTail} from "./ElementTail.js";

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

        // http://stackoverflow.com/questions/3528299/get-pixel-color-of-base64-png-using-javascript
        let image = new Image();
        image.onload = () => {
            let canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;

            let context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);

            this.#imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        };
        image.src = base64;
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