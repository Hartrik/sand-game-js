// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Element from "../Element.js";
import ElementHead from "../ElementHead.js";
import Brush from "./Brush";
import DeterministicRandom from "../DeterministicRandom";
import RandomBrush from "./RandomBrush";
import RandomElementBrush from "./RandomElementBrush";
import ColorBrush from "./ColorBrush";
import ColorPaletteRandomBrush from "./ColorPaletteRandomBrush";
import ColorTextureBrush from "./ColorTextureBrush";
import ColorNoiseBrush from "./ColorNoiseBrush";
import ColorPaletteCyclicBrush from "./ColorMovingPaletteBrush";
import ColorRandomize from "./ColorRandomize";
import CustomBrush from "./CustomBrush";
import CountingBrush from "./CountingBrush";
import PredicateDefs from "../../def/PredicateDefs";
import MeltingBrush from "./MeltingBrush";
import SolidBodyBrush from "./SolidBodyBrush";

/**
 *
 * @author Patrik Harag
 * @version 2024-03-12
 */
export default class Brushes {

    static #parsePalette(string) {
        return string.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => line.split(',').map(Number));
    }


    /**
     *
     * @param predicate {(function(elementHead:number, elementTail:number):boolean)|undefined}
     * @returns {CountingBrush}
     */
    static counting(predicate) {
        return new CountingBrush(predicate);
    }

    /**
     *
     * @param func {function(x: number, y: number, random: DeterministicRandom, oldElement: Element)}
     * @returns {Brush}
     */
    static custom(func) {
        return new CustomBrush(func);
    }

    /**
     *
     * @param list {Element[]|Brush[]}
     * @returns {Brush}
     */
    static random(list) {
        let hasBrushes = undefined;
        for (let item of list) {
            if (item instanceof Element) {
                if (hasBrushes === true) {
                    throw 'Mixing Element and Brush instances';
                }
                hasBrushes = false;
            } else if (item instanceof Brush) {
                if (hasBrushes === false) {
                    throw 'Mixing Element and Brush instances';
                }
                hasBrushes = true;
            } else {
                throw 'Element or Brush instances expected';
            }
        }
        return (hasBrushes) ? new RandomBrush(list) : new RandomElementBrush(list);
    }

    /**
     *
     * @param r {number} 0..255
     * @param g {number} 0..255
     * @param b {number} 0..255
     * @param innerBrush {Brush|undefined}
     * @return {Brush}
     */
    static color(r = 0, g = 0, b = 0, innerBrush = undefined) {
        return new ColorBrush(r, g, b, innerBrush);
    }

    /**
     *
     * @param base64
     * @param innerBrush {Brush|undefined}
     * @return {ColorTextureBrush}
     */
    static colorTexture(base64, innerBrush = undefined) {
        return new ColorTextureBrush(innerBrush, base64);
    }

    /**
     *
     * @param palette {number[][]|string}
     * @param innerBrush {Brush|undefined}
     * @returns {Brush}
     */
    static colorPaletteRandom(palette, innerBrush = undefined) {
        if (typeof palette === 'string') {
            palette = Brushes.#parsePalette(palette);
        }
        return new ColorPaletteRandomBrush(innerBrush, palette);
    }

    /**
     *
     * @param palette {number[][]|string}
     * @param stepSize {number}
     * @param innerBrush {Brush|undefined}
     * @returns {Brush}
     */
    static colorPaletteCyclic(palette, stepSize = 1, innerBrush = undefined) {
        if (typeof palette === 'string') {
            palette = Brushes.#parsePalette(palette);
        }
        return new ColorPaletteCyclicBrush(innerBrush, palette, stepSize);
    }

    /**
     * This brush provides a bit of randomness to element colors.
     *
     * @param maxDiff {number}
     * @param innerBrush {Brush|undefined}
     * @returns {Brush}
     */
    static colorRandomize(maxDiff, innerBrush = undefined) {
        return new ColorRandomize(innerBrush, maxDiff);
    }

    /**
     *
     * @param coefficients {
     * {
     *     seed: number|undefined,
     *     factor: number|undefined,
     *     threshold: number|undefined,
     *     force: number|undefined,
     * }
     * |
     * {
     *     seed: number|undefined,
     *     factor: number|undefined,
     *     threshold: number|undefined,
     *     force: number|undefined,
     * }[]
     * }
     * @param r {number} 0..255
     * @param g {number} 0..255
     * @param b {number} 0..255
     * @param innerBrush {Brush|undefined}
     * @return {Brush}
     */
    static colorNoise(coefficients, r = undefined, g = undefined, b = undefined,
            innerBrush = undefined) {

        return new ColorNoiseBrush(innerBrush, coefficients, r, g, b);
    }

    /**
     *
     * @param brush {Brush}
     * @param intensity {number} 0..1
     * @returns {Brush}
     */
    static withIntensity(intensity, brush) {
        return Brushes.custom((x, y, random, oldElement) => {
            let rnd = ((random) ? random : DeterministicRandom.DEFAULT).next();
            if (rnd < intensity) {
                return brush.apply(x, y, random, oldElement);
            }
            return null;
        });
    }

    /**
     * Brush will not paint over other elements.
     *
     * @param brush {Brush}
     */
    static gentle(brush) {
        return Brushes.conditional(PredicateDefs.IS_AIR, brush);
    }

    /**
     * Brush will paint only over specific elements.
     *
     * @param predicate {function(elementHead:number, elementTail:number):boolean}
     * @param brush {Brush}
     */
    static conditional(predicate, brush) {
        return Brushes.custom((x, y, random, oldElement) => {
            if (oldElement === null) {
                return null;
            }
            if (predicate(oldElement.elementHead, oldElement.elementTail)) {
                return brush.apply(x, y, random, oldElement);
            }
            return null;
        });
    }

    static temperature(value) {
        return Brushes.custom((x, y, random, oldElement) => {
            if (oldElement === null) {
                return null;
            }
            const newElementHead = ElementHead.setTemperature(oldElement.elementHead, value & 0xFF);
            return new Element(newElementHead, oldElement.elementTail);
        });
    }

    static temperatureOrBrush(value, brush) {
        return Brushes.custom((x, y, random, oldElement) => {
            if (oldElement === null) {
                return brush.apply(x, y, random, null);
            }

            const typeClass = ElementHead.getTypeClass(oldElement.elementHead);
            switch (typeClass) {
                case ElementHead.TYPE_AIR:
                case ElementHead.TYPE_EFFECT:
                    return brush.apply(x, y, random, oldElement);

                case ElementHead.TYPE_POWDER:
                case ElementHead.TYPE_POWDER_WET:
                case ElementHead.TYPE_POWDER_FLOATING:
                case ElementHead.TYPE_FLUID:
                case ElementHead.TYPE_GAS:
                case ElementHead.TYPE_STATIC:
                    const newElementHead = ElementHead.setTemperature(oldElement.elementHead, value & 0xFF);
                    return new Element(newElementHead, oldElement.elementTail);

                default:
                    return brush.apply(x, y, random, null);
            }
        });
    }

    static concat(first, second) {
        return Brushes.custom((x, y, random, oldElement) => {
            const firstResult = first.apply(x, y, random, oldElement);
            const secondResult = second.apply(x, y, random, firstResult !== null ? firstResult : oldElement);
            return (secondResult !== null) ? secondResult : firstResult;
        });
    }

    static join(brushes) {
        return Brushes.custom((x, y, random, oldElement) => {
            let last = oldElement;
            for (let brush of brushes) {
                const next = brush.apply(x, y, random, last);
                if (next !== null) {
                    last = next;
                }
            }
            return last;
        });
    }

    static molten() {
        return new MeltingBrush();
    }

    /**
     * @param solidBodyId {number}
     * @param extendedNeighbourhood {boolean|undefined}
     * @param innerBrush {Brush|undefined}
     * @return {SolidBodyBrush}
     */
    static toSolidBody(solidBodyId, extendedNeighbourhood = undefined, innerBrush = undefined) {
        return new SolidBodyBrush(solidBodyId, extendedNeighbourhood, innerBrush);
    }
}
