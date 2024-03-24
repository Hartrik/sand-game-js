// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Element from "./Element.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-10-11
 */
export default class ElementArea {

    /**
     * This element is used for templates etc.
     * @type {Element}
     */
    static TRANSPARENT_ELEMENT = new Element(0xFFFFFFFF, 0xFFFFFFFF);

    static LITTLE_ENDIAN = true;

    static create(width, height, defaultElement) {
        let bufferHeads = new DataView(new ArrayBuffer(width * height * 4));
        let bufferTails = new DataView(new ArrayBuffer(width * height * 4));
        let instance = new ElementArea(width, height, bufferHeads, bufferTails);

        // set default elements
        for (let y = 0; y < instance.#height; y++) {
            for (let x = 0; x < instance.#width; x++) {
                instance.setElement(x, y, defaultElement);
            }
        }
        return instance;
    }

    /**
     *
     * @param width
     * @param height
     * @param dataHeads {ArrayBuffer}
     * @param dataTails {ArrayBuffer}
     * @returns {ElementArea}
     */
    static from(width, height, dataHeads, dataTails) {
        return new ElementArea(width, height, new DataView(dataHeads), new DataView(dataTails));
    }


    /** @type number */
    #width;

    /** @type number */
    #height;

    /** @type DataView */
    #bufferHeads;

    /** @type DataView */
    #bufferTails;

    constructor(width, height, bufferHeads, bufferTails) {
        this.#width = width;
        this.#height = height;
        this.#bufferHeads = bufferHeads;
        this.#bufferTails = bufferTails;
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
        const byteOffset = (this.#width * y + x) * 4;
        this.#bufferHeads.setUint32(byteOffset, elementHead, ElementArea.LITTLE_ENDIAN);
        this.#bufferTails.setUint32(byteOffset, elementTail, ElementArea.LITTLE_ENDIAN);
    }

    setElementHead(x, y, elementHead) {
        const byteOffset = (this.#width * y + x) * 4;
        this.#bufferHeads.setUint32(byteOffset, elementHead, ElementArea.LITTLE_ENDIAN);
    }

    setElementTail(x, y, elementTail) {
        const byteOffset = (this.#width * y + x) * 4;
        this.#bufferTails.setUint32(byteOffset, elementTail, ElementArea.LITTLE_ENDIAN);
    }

    getElement(x, y) {
        const byteOffset = (this.#width * y + x) * 4;
        const elementHead = this.#bufferHeads.getUint32(byteOffset, ElementArea.LITTLE_ENDIAN);
        const elementTail = this.#bufferTails.getUint32(byteOffset, ElementArea.LITTLE_ENDIAN);
        return new Element(elementHead, elementTail);
    }

    getElementHead(x, y) {
        const byteOffset = (this.#width * y + x) * 4;
        return this.#bufferHeads.getUint32(byteOffset, ElementArea.LITTLE_ENDIAN);
    }

    getElementHeadOrNull(x, y) {
        if (this.isValidPosition(x, y)) {
            return this.getElementHead(x, y);
        }
        return null;
    }

    getElementTail(x, y) {
        const byteOffset = (this.#width * y + x) * 4;
        return this.#bufferTails.getUint32(byteOffset, ElementArea.LITTLE_ENDIAN);
    }

    getElementTailOrNull(x, y) {
        if (this.isValidPosition(x, y)) {
            return this.getElementTail(x, y);
        }
        return null;
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
    getDataHeads() {
        return this.#bufferHeads.buffer;
    }

    /**
     *
     * @return {ArrayBuffer}
     */
    getDataTails() {
        return this.#bufferTails.buffer;
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