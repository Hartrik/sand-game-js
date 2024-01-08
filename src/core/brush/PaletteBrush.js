import {DeterministicRandom} from "../DeterministicRandom";
import {ElementTail} from "../ElementTail";
import {Brush} from "./Brush";

/**
 *
 * @author Patrik Harag
 * @version 2023-11-20
 */
export class PaletteBrush extends Brush {

    /** @type Brush */
    #innerBrush;

    /** @type number[][] */
    #palette;

    constructor(innerBrush, palette) {
        super();
        this.#innerBrush = innerBrush;
        this.#palette = palette;
    }

    apply(x, y, random, oldElement) {
        const element = this.#innerBrush.apply(x, y, random);
        if (element === null) {
            return null;
        }

        const i = ((random) ? random : DeterministicRandom.DEFAULT).nextInt(this.#palette.length);
        const [r, g, b] = this.#palette[i];

        element.elementTail = ElementTail.setColor(element.elementTail, r, g, b);
        return element;
    }
}