import {AbstractEffectBrush} from "./AbstractEffectBrush";
import {DeterministicRandom} from "../DeterministicRandom";
import {ElementTail} from "../ElementTail";
import {Element} from "../Element";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-05
 */
export class ColorPaletteBrush extends AbstractEffectBrush {

    /** @type number[][] */
    #palette;

    constructor(innerBrush, palette) {
        super(innerBrush);
        if (typeof palette === 'string') {
            // parse
            this.#palette = palette.split('\n').map(line => line.split(',').map(Number));
        } else {
            this.#palette = palette;
        }
    }

    apply(x, y, random, oldElement) {
        const element = this._retrieveElement(x, y, random, oldElement);

        const i = ((random) ? random : DeterministicRandom.DEFAULT).nextInt(this.#palette.length);
        const [r, g, b] = this.#palette[i];

        const newElementTail = ElementTail.setColor(element.elementTail, r, g, b);
        return new Element(element.elementHead, newElementTail);
    }
}