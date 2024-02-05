import {AbstractEffectBrush} from "./AbstractEffectBrush";
import {Element} from "../Element";
import {VisualEffects} from "../processing/VisualEffects";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-05
 */
export class ColorNoiseBrush extends AbstractEffectBrush {

    /**
     * @type {{
     *     seed: number|undefined,
     *     factor: number|undefined,
     *     threshold: number|undefined,
     *     force: number|undefined,
     *     r: number|undefined,
     *     g: number|undefined,
     *     b: number|undefined
     * }}
     */
    #coefficients;

    #noise;

    constructor(innerBrush, coefficients) {
        super(innerBrush);
        this.#coefficients = coefficients;
        this.#noise = VisualEffects.visualNoiseProvider((coefficients.seed !== undefined) ? coefficients.seed : 0);
    }

    apply(x, y, random, oldElement) {
        const element = this._retrieveElement(x, y, random, oldElement);

        const factor = this.#coefficients.factor;
        const threshold = this.#coefficients.threshold;
        const force = this.#coefficients.force;
        const r = this.#coefficients.r;
        const g = this.#coefficients.g;
        const b = this.#coefficients.b;

        const newElementTail = this.#noise.visualNoise(element.elementTail, x, y, factor, threshold, force, r, g, b);
        return new Element(element.elementHead, newElementTail);
    }
}