import {Element} from "./Element.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-04
 */
export class ElementArea {
    static LITTLE_ENDIAN = true;

    static create(width, height, defaultElement) {
        let instance = new ElementArea(width, height, new DataView(new ArrayBuffer(width * height * 8)));

        // set default elements
        for (let y = 0; y < instance.#height; y++) {
            for (let x = 0; x < instance.#width; x++) {
                instance.setElement(x, y, defaultElement);
            }
        }
        return instance;
    }

    static from(width, height, arrayBuffer) {
        return new ElementArea(width, height, new DataView(arrayBuffer));
    }


    /** @type number */
    #width;

    /** @type number */
    #height;

    /** @type DataView */
    #buffer;

    constructor(width, height, buffer) {
        this.#width = width;
        this.#height = height;
        this.#buffer = buffer;
    }

    isValidPosition(x, y) {
        if (x < 0 || y < 0) {
            return false;
        }
        if (x >= this.#width || y >= this.#height) {
            return false;
        }
        return true;
    }

    setElement(x, y, element) {
        if (element !== null) {
            this.setElementHeadAndTail(x, y, element.elementHead, element.elementTail);
        }
        // brushes can produce nulls
    }

    setElementHeadAndTail(x, y, elementHead, elementTail) {
        const byteOffset = (this.#width * y + x) * 8;
        this.#buffer.setUint32(byteOffset, elementHead, ElementArea.LITTLE_ENDIAN);
        this.#buffer.setUint32(byteOffset + 4, elementTail, ElementArea.LITTLE_ENDIAN);
    }

    setElementHead(x, y, elementHead) {
        const byteOffset = (this.#width * y + x) * 8;
        this.#buffer.setUint32(byteOffset, elementHead, ElementArea.LITTLE_ENDIAN);
    }

    setElementTail(x, y, elementTail) {
        const byteOffset = (this.#width * y + x) * 8;
        this.#buffer.setUint32(byteOffset + 4, elementTail, ElementArea.LITTLE_ENDIAN);
    }

    getElement(x, y) {
        const byteOffset = (this.#width * y + x) * 8;
        const elementHead = this.#buffer.getUint32(byteOffset, ElementArea.LITTLE_ENDIAN);
        const elementTail = this.#buffer.getUint32(byteOffset + 4, ElementArea.LITTLE_ENDIAN);
        return new Element(elementHead, elementTail);
    }

    getElementHead(x, y) {
        const byteOffset = (this.#width * y + x) * 8;
        return this.#buffer.getUint32(byteOffset, ElementArea.LITTLE_ENDIAN);
    }

    getElementTail(x, y) {
        const byteOffset = (this.#width * y + x) * 8;
        return this.#buffer.getUint32(byteOffset + 4, ElementArea.LITTLE_ENDIAN);
    }

    swap(x, y, x2, y2) {
        const elementHead = this.getElementHead(x, y);
        const elementHead2 = this.getElementHead(x2, y2);
        this.setElementHead(x2, y2, elementHead);
        this.setElementHead(x, y, elementHead2);

        const elementTail = this.getElementTail(x, y);
        const elementTail2 = this.getElementTail(x2, y2);
        this.setElementTail(x2, y2, elementTail);
        this.setElementTail(x, y, elementTail2);
    }

    /**
     *
     * @return {ArrayBuffer}
     */
    getData() {
        return this.#buffer.buffer;
    }

    /**
     *
     * @return {number}
     */
    getWidth() {
        return this.#width;
    }

    /**
     *
     * @return {number}
     */
    getHeight() {
        return this.#height;
    }
}