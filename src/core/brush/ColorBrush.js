// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import AbstractEffectBrush from "./AbstractEffectBrush";
import Element from "../Element";
import ElementTail from "../ElementTail";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-05
 */
export default class ColorBrush extends AbstractEffectBrush {

    #r; #g; #b;

    constructor(r, g, b, innerBrush) {
        super(innerBrush);
        this.#r = r;
        this.#g = g;
        this.#b = b;
    }

    apply(x, y, random, oldElement) {
        const element = this._retrieveElement(x, y, random, oldElement);

        const newElementTail = ElementTail.setColor(element.elementTail, this.#r, this.#g, this.#b);
        return new Element(element.elementHead, newElementTail);
    }
}