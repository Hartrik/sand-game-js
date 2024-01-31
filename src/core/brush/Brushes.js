import {Element} from "../Element.js";
import {ElementHead} from "../ElementHead.js";
import {Brush} from "./Brush";
import {DeterministicRandom} from "../DeterministicRandom";
import {VisualEffects} from "../processing/VisualEffects";
import {RandomBrush} from "./RandomBrush";
import {RandomElementBrush} from "./RandomElementBrush";
import {PaletteBrush} from "./PaletteBrush";
import {TextureBrush} from "./TextureBrush";
import {CustomBrush} from "./CustomBrush";
import {CountingBrush} from "./CountingBrush";
import {PredicateDefs} from "../../def/PredicateDefs";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-29
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
        return Brushes.conditional(PredicateDefs.IS_AIR, brush);
    }

    /**
     * Brush will paint only specific elements.
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
