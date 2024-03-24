// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ElementTail from "../ElementTail";
import ElementArea from "../ElementArea";
import RenderingMode from "./RenderingMode";
import Renderer from "./Renderer";

/**
 * Double buffered renderer. With motion blur.
 *
 * @author Patrik Harag
 * @version 2023-08-27
 */
export default class Renderer2D extends Renderer {

    /**
     *
     * @param elementArea {ElementArea}
     * @param context {CanvasRenderingContext2D}
     * @param alpha 0x00 = fully transparent, 0xFF = fully opaque
     */
    static renderPreview(elementArea, context, alpha=0xFF) {
        const w = elementArea.getWidth();
        const h = elementArea.getHeight();

        const buffer = context.createImageData(w, h);
        const data = buffer.data;

        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                const pixelIndex = w * y + x;
                const dataIndex = pixelIndex * 4;

                const elementTail = elementArea.getElementTail(x, y);

                if (elementTail === ElementArea.TRANSPARENT_ELEMENT.elementTail
                        && elementArea.getElementHead(x, y) === ElementArea.TRANSPARENT_ELEMENT.elementHead) {

                    // transparent
                    data[dataIndex + 3] = 0;
                } else {
                    data[dataIndex] = ElementTail.getColorRed(elementTail);
                    data[dataIndex + 1] = ElementTail.getColorGreen(elementTail);
                    data[dataIndex + 2] = ElementTail.getColorBlue(elementTail);
                    data[dataIndex + 3] = alpha;
                }
            }
        }

        context.putImageData(buffer, 0, 0, 0, 0, w, h);
    }


    /** @type CanvasRenderingContext2D */
    #context;

    /** @type RenderingMode|null */
    #mode = null;

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
        super();
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

    triggerChunks(activeChunks) {
        if (activeChunks.length !== this.#triggeredChunks.length) {
            throw 'Array must be of the same size';
        }
        for (let i = 0; i < activeChunks.length; i++) {
            const active = activeChunks[i];
            if (active) {
                this.#triggeredChunks[i] = active;
            }
        }
    }

    setMode(mode) {
        this.#mode = mode;
        // ensure repaint
        this.#triggeredChunks.fill(true);
        this.#blur.fill(false);
        this.#canBeBlurred.fill(false);
    }

    /**
     *
     * @param changedChunks {boolean[]}
     * @return {void}
     */
    render(changedChunks) {
        for (let cy = 0; cy < this.#verChunkCount; cy++) {
            for (let cx = 0; cx < this.#horChunkCount; cx++) {
                const chunkIndex = cy * this.#horChunkCount + cx;

                const triggered = this.#triggeredChunks[chunkIndex];
                if (triggered) {
                    // unset
                    this.#triggeredChunks[chunkIndex] = false;
                }

                const changed = changedChunks[chunkIndex];
                if (changed) {
                    // repaint at least once
                    this.#triggeredChunks[chunkIndex] = true;
                }

                if (triggered || changed) {

                    // neighbours can be changed without triggering
                    let includeRowUnder = false;
                    if (cy + 1 < this.#horChunkCount) {
                        const chunkIndexUnder = (cy + 1) * this.#horChunkCount + cx;
                        if (!this.#triggeredChunks[chunkIndexUnder] && !changedChunks[chunkIndexUnder]) {
                            includeRowUnder = true;
                        }
                    }

                    this.#renderChunk(cx, cy, includeRowUnder);
                }
            }
        }

        // TODO: ? multiple partial putImageData
        this.#context.putImageData(this.#buffer, 0, 0, 0, 0, this.#width, this.#height);
    }

    #renderChunk(cx, cy, includeRowUnder) {
        const mx = Math.min((cx + 1) * this.#chunkSize, this.#width);
        const my = Math.min((cy + 1) * this.#chunkSize + (includeRowUnder ? 1 : 0), this.#height);
        for (let y = cy * this.#chunkSize; y < my; y++) {
            for (let x = cx * this.#chunkSize; x < mx; x++) {
                this.#renderPixel(x, y, this.#buffer.data);
            }
        }
    }

    #renderPixel(x, y, data) {
        const elementTail = this.#elementArea.getElementTail(x, y);

        const pixelIndex = this.#width * y + x;
        const dataIndex = pixelIndex * 4;

        const blurBehaviour = ElementTail.getBlurType(elementTail);

        if (blurBehaviour === ElementTail.BLUR_TYPE_BACKGROUND) {
            // motion blur

            if (this.#canBeBlurred[pixelIndex] && Renderer2D.#isWhite(elementTail)) {
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
        if (this.#mode === null) {
            data[dataIndex] = ElementTail.getColorRed(elementTail);
            data[dataIndex + 1] = ElementTail.getColorGreen(elementTail);
            data[dataIndex + 2] = ElementTail.getColorBlue(elementTail);
            this.#canBeBlurred[pixelIndex] = (blurBehaviour === ElementTail.BLUR_TYPE_1);
            this.#blur[pixelIndex] = false;
        } else {
            // custom rendering mode
            let elementHead = this.#elementArea.getElementHead(x, y);
            this.#mode.apply(data, dataIndex, elementHead, elementTail);
        }
    }

    static #isWhite(element) {
        return ElementTail.getColorRed(element) === 255
            && ElementTail.getColorGreen(element) === 255
            && ElementTail.getColorBlue(element) === 255;
    }
}