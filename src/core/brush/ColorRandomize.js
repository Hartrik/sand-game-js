// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import AbstractEffectBrush from "./AbstractEffectBrush";
import Element from "../Element";
import ElementTail from "../ElementTail";

/**
 * This brush provides a bit of randomness to element colors.
 *
 * @author Patrik Harag
 * @version 2024-03-12
 */
export default class ColorRandomize extends AbstractEffectBrush {

    #maxDiff;

    constructor(innerBrush, maxDiff) {
        super(innerBrush);
        this.#maxDiff = maxDiff;
    }

    apply(x, y, random, oldElement) {
        const element = this._retrieveElement(x, y, random, oldElement);

        let r = ElementTail.getColorRed(element.elementTail);
        let g = ElementTail.getColorGreen(element.elementTail);
        let b = ElementTail.getColorBlue(element.elementTail);

        r += random.nextInt(this.#maxDiff) * (random.nextInt(2) === 0 ? 1 : -1);
        g += random.nextInt(this.#maxDiff) * (random.nextInt(2) === 0 ? 1 : -1);
        b += random.nextInt(this.#maxDiff) * (random.nextInt(2) === 0 ? 1 : -1);

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        const newElementTail = ElementTail.setColor(element.elementTail, r, g, b);
        return new Element(element.elementHead, newElementTail);
    }
}