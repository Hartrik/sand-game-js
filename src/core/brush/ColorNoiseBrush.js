// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import AbstractEffectBrush from "./AbstractEffectBrush";
import Element from "../Element";
import VisualEffects from "../processing/VisualEffects";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-06
 */
export default class ColorNoiseBrush extends AbstractEffectBrush {

    #r; #g; #b;

    /**
     * @type {object|object[]}
     */
    #coefficients;

    #noise;

    constructor(innerBrush, coefficients, r, g, b) {
        super(innerBrush);
        this.#coefficients = coefficients;
        this.#r = r;
        this.#g = g;
        this.#b = b;
        if (Array.isArray(coefficients)) {
            this.#noise = VisualEffects.visualNoiseProvider(coefficients.map(c => c.seed));
        } else {
            this.#noise = VisualEffects.visualNoiseProvider(coefficients.seed);
        }
    }

    apply(x, y, random, oldElement) {
        const element = this._retrieveElement(x, y, random, oldElement);

        const coefficients = this.#coefficients;
        const r = this.#r;  // it could be null...
        const g = this.#g;
        const b = this.#b;

        let newElementTail;
        if (Array.isArray(coefficients)) {
            newElementTail = this.#noise.visualNoiseCombined(element.elementTail, x, y, coefficients, r, g, b);
        } else {
            const factor = coefficients.factor;  // it could be null...
            const threshold = coefficients.threshold;
            const force = coefficients.force;
            newElementTail = this.#noise.visualNoise(element.elementTail, x, y, factor, threshold, force, r, g, b);
        }
        return new Element(element.elementHead, newElementTail);
    }
}