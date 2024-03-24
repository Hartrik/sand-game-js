// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import AbstractEffectBrush from "./AbstractEffectBrush";
import ElementTail from "../ElementTail";
import Element from "../Element";

/**
 *
 * @author Patrik Harag
 * @version 2024-03-12
 */
export default class ColorMovingPaletteBrush extends AbstractEffectBrush {

    /** @type number[][] */
    #palette;

    /** @type number */
    #stepSize;

    #i = 0;
    #direction = 1;
    #current = 0;

    constructor(innerBrush, palette, stepSize) {
        super(innerBrush);
        this.#palette = palette;
        this.#stepSize = stepSize;
    }

    apply(x, y, random, oldElement) {
        const element = this._retrieveElement(x, y, random, oldElement);

        if (this.#palette.length === 0) {
            return element;
        }

        // retrieve current color
        const [r, g, b] = this.#palette[this.#i];

        if (this.#palette.length > 1) {
            // count next index
            this.#current += 1;
            if (this.#current >= this.#stepSize) {
                this.#current = 0;
                this.#i += this.#direction;
                if (this.#i < 0) {
                    // switch direction
                    this.#direction = 1;
                    this.#i = 1;
                } else if (this.#i >= this.#palette.length) {
                    // switch direction
                    this.#direction = -1;
                    this.#i = this.#palette.length - 2;
                }
            }
        }

        const newElementTail = ElementTail.setColor(element.elementTail, r, g, b);
        return new Element(element.elementHead, newElementTail);
    }
}