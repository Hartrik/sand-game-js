import {ElementTail} from "./ElementTail.js";

/**
 * Double buffered renderer. With motion blur.
 *
 * @author Patrik Harag
 * @version 2022-11-08
 */
export class Renderer {

    /** @type CanvasRenderingContext2D */
    #context;

    /** @type ElementArea */
    #elementArea;

    /** @type number */
    #width;
    /** @type number */
    #height;

    /** @type number */
    #chunkSize;
    /** @type number */
    #horChunkCount;
    /** @type number */
    #verChunkCount;

    /** @type boolean[] */
    #triggeredChunks

    /** @type ImageData */
    #buffer;

    /** @type boolean[] */
    #blur;

    /** @type boolean[] */
    #canBeBlurred;

    constructor(elementArea, chunkSize, context) {
        this.#context = context;
        this.#elementArea = elementArea;
        this.#width = elementArea.getWidth();
        this.#height = elementArea.getHeight();

        this.#chunkSize = chunkSize;
        this.#horChunkCount = Math.ceil(this.#width / this.#chunkSize);
        this.#verChunkCount = Math.ceil(this.#height / this.#chunkSize);
        this.#triggeredChunks = new Array(this.#horChunkCount * this.#verChunkCount).fill(true);

        this.#buffer = this.#context.createImageData(this.#width, this.#height);
        // set up alpha color component
        const data = this.#buffer.data;
        for (let y = 0; y < this.#height; y++) {
            for (let x = 0; x < this.#width; x++) {
                let index = 4 * (this.#width * y + x);
                data[index + 3] = 0xFF;
            }
        }

        this.#blur = new Array(this.#width * this.#height).fill(false);
        this.#canBeBlurred = new Array(this.#width * this.#height).fill(false);
    }

    trigger(x, y) {
        const cx = Math.trunc(x / this.#chunkSize);
        const cy = Math.trunc(y / this.#chunkSize);
        const chunkIndex = cy * this.#horChunkCount + cx;
        this.#triggeredChunks[chunkIndex] = true;
    }

    triggerChunk(cx, cy) {
        const chunkIndex = cy * this.#horChunkCount + cx;
        this.#triggeredChunks[chunkIndex] = true;
    }

    /**
     *
     * @param activeChunks {boolean[]}
     * @param showActiveChunks {boolean}
     * @return {void}
     */
    render(activeChunks, showActiveChunks) {
        for (let cy = 0; cy < this.#verChunkCount; cy++) {
            for (let cx = 0; cx < this.#horChunkCount; cx++) {
                const chunkIndex = cy * this.#horChunkCount + cx;
                const active = activeChunks[chunkIndex];
                const triggered = this.#triggeredChunks[chunkIndex];
                if (active) {
                    // repaint at least once more because of motion blur
                    this.#triggeredChunks[chunkIndex] = true;
                } else if (triggered) {
                    // unset
                    this.#triggeredChunks[chunkIndex] = false;
                }
                if (active || triggered) {
                    this.#renderChunk(cx, cy, active && showActiveChunks);
                }
            }
        }

        this.#context.putImageData(this.#buffer, 0, 0, 0, 0, this.#width, this.#height);
    }

    #renderChunk(cx, cy, highlight) {
        if (highlight) {
            const setHighlightingPixel = (x, y) => {
                if (x < this.#width && y < this.#height) {
                    const index = (this.#width * y + x) * 4;
                    this.#buffer.data[index] = 0x00;
                    this.#buffer.data[index + 1] = 0xFF;
                    this.#buffer.data[index + 2] = 0x00;
                }
            }
            for (let i = 0; i < this.#chunkSize; i++) {
                // top
                setHighlightingPixel(cx * this.#chunkSize + i, cy * this.#chunkSize);
                // bottom
                setHighlightingPixel(cx * this.#chunkSize + i, (cy + 1) * this.#chunkSize - 1);
                // left
                setHighlightingPixel(cx * this.#chunkSize, cy * this.#chunkSize + i);
                // right
                setHighlightingPixel((cx + 1) * this.#chunkSize - 1, cy * this.#chunkSize + i);
            }
            const mx = Math.min((cx + 1) * this.#chunkSize - 1, this.#width);
            const my = Math.min((cy + 1) * this.#chunkSize - 1, this.#height);
            for (let y = cy * this.#chunkSize + 1; y < my; y++) {
                for (let x = cx * this.#chunkSize + 1; x < mx; x++) {
                    this.#renderPixel(x, y, this.#buffer.data);
                }
            }
            this.triggerChunk(cx, cy);  // to repaint highlighting
        } else {
            const mx = Math.min((cx + 1) * this.#chunkSize, this.#width);
            const my = Math.min((cy + 1) * this.#chunkSize, this.#height);
            for (let y = cy * this.#chunkSize; y < my; y++) {
                for (let x = cx * this.#chunkSize; x < mx; x++) {
                    this.#renderPixel(x, y, this.#buffer.data);
                }
            }
        }
    }

    #renderPixel(x, y, data) {
        const elementTail = this.#elementArea.getElementTail(x, y);

        const pixelIndex = this.#width * y + x;
        const dataIndex = pixelIndex * 4;

        if (ElementTail.isRenderingModifierBackground(elementTail)) {
            // motion blur

            if (this.#canBeBlurred[pixelIndex] && Renderer.#isWhite(elementTail)) {
                // init fading here

                this.#blur[pixelIndex] = true;
                this.#canBeBlurred[pixelIndex] = false;
            }

            if (this.#blur[pixelIndex]) {
                // paint - continue fading

                const r = data[dataIndex];
                const g = data[dataIndex + 1];
                const b = data[dataIndex + 2];

                const alpha = 0.875 + (Math.random() * 0.1 - 0.05);
                const whiteBackground = 255 * (1.0 - alpha);

                const nr = Math.trunc((r * alpha) + whiteBackground);
                const ng = Math.trunc((g * alpha) + whiteBackground);
                const nb = Math.trunc((b * alpha) + whiteBackground);

                if (r === nr && g === ng && b === nb) {
                    // no change => fading completed
                    this.#blur[pixelIndex] = false;
                    data[dataIndex] = 0xFF;
                    data[dataIndex + 1] = 0xFF;
                    data[dataIndex + 2] = 0xFF;
                } else {
                    data[dataIndex] = nr;
                    data[dataIndex + 1] = ng;
                    data[dataIndex + 2] = nb;
                    this.trigger(x, y);  // request next repaint
                }
                return;
            }
        }

        // paint - no blur
        data[dataIndex] = ElementTail.getColorRed(elementTail);
        data[dataIndex + 1] = ElementTail.getColorGreen(elementTail);
        data[dataIndex + 2] = ElementTail.getColorBlue(elementTail);
        this.#canBeBlurred[pixelIndex] = ElementTail.isRenderingModifierBlurEnabled(elementTail);
        this.#blur[pixelIndex] = false;
    }

    static #isWhite(element) {
        return ElementTail.getColorRed(element) === 255
            && ElementTail.getColorGreen(element) === 255
            && ElementTail.getColorBlue(element) === 255;
    }
}