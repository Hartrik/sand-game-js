import {Element} from "../Element.js";
import {ElementHead} from "../ElementHead.js";
import {DeterministicRandom} from "../DeterministicRandom";
import {VisualEffects} from "../processing/VisualEffects";
import {RandomBrush} from "./RandomBrush";
import {PaletteBrush} from "./PaletteBrush";
import {TextureBrush} from "./TextureBrush";
import {CustomBrush} from "./CustomBrush";
import {CountingBrush} from "./CountingBrush";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-10
 */
export class Brushes {

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
     * @param elements {Element[]}
     * @returns {Brush}
     */
    static random(elements) {
        return new RandomBrush(elements);
    }

    static textureBrush(base64, innerBrush) {
        return new TextureBrush(innerBrush, base64);
    }

    /**
     *
     * @param palette {number[][]|string}
     * @param innerBrush
     * @returns {Brush}
     */
    static paletteBrush(palette, innerBrush) {
        if (typeof palette === 'string') {
            // parse
            palette = palette.split('\n').map(line => line.split(',').map(Number));
        }
        return new PaletteBrush(innerBrush, palette);
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
        return Brushes.custom((x, y, random, oldElement) => {
            if (ElementHead.getTypeClass(oldElement.elementHead) === ElementHead.TYPE_AIR) {
                return brush.apply(x, y, random, oldElement);
            }
            return null;
        });
    }

    /**
     * Brush will paint only over other physical elements.
     *
     * @param brush {Brush}
     */
    static physical(brush) {
        return Brushes.custom((x, y, random, oldElement) => {
            if (oldElement === null) {
                return null;
            }

            const typeClass = ElementHead.getTypeClass(oldElement.elementHead);
            switch (typeClass) {
                case ElementHead.TYPE_POWDER:
                case ElementHead.TYPE_POWDER_WET:
                case ElementHead.TYPE_POWDER_FLOATING:
                case ElementHead.TYPE_FLUID:
                case ElementHead.TYPE_GAS:
                case ElementHead.TYPE_STATIC:
                    return brush.apply(x, y, random, oldElement);
                default:
                    return null;
            }
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

    static noise(seed = 0, factor, threshold, force, nr, ng, nb) {
        const noise = VisualEffects.visualNoiseProvider(seed);
        return Brushes.custom((x, y, random, oldElement) => {
            if (oldElement === null) {
                return null;
            }
            const newElementTail = noise.visualNoise(oldElement.elementTail, x, y, factor, threshold, force, nr, ng, nb);
            return new Element(oldElement.elementHead, newElementTail);
        });
    }
}
