import {ElementHead} from "../ElementHead.js";

/**
 *
 * @author Patrik Harag
 * @version 2024-03-23
 */
export class ProcessorModuleSolidBody {

    static #QUEUED_PAINT_ID = 255;
    static #NEWLY_CREATED_PAINT_ID = 254;
    static #BODY_SIZE_LIMIT_MAX = 8192;
    static #BODY_SIZE_LIMIT_MIN = 32;


    /** @type ElementArea */
    #elementArea;

    /** @type DeterministicRandom */
    #random;

    /** @type ProcessorContext */
    #processorContext;

    /** @type Uint8Array */
    #elementAreaOverlay;

    /** @type Set */
    #moved;

    constructor(elementArea, random, processorContext) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#processorContext = processorContext;
        this.#elementAreaOverlay = new Uint8Array(elementArea.getWidth() * elementArea.getHeight());
        this.#moved = new Set();
        this.#reusableLowerBorderMinY = new Uint16Array(elementArea.getWidth());
    }

    onSolidCreated(elementHead, x, y) {
        this.#elementAreaOverlay[x + (y * this.#elementArea.getWidth())] = ProcessorModuleSolidBody.#NEWLY_CREATED_PAINT_ID;
    }

    onNextIteration() {
        // TODO: optimize - do not clean if not used or needed
        this.#elementAreaOverlay.fill(0);
        this.#moved.clear();
    }

    behaviourSolid(elementHead, x, y) {
        const bodyId = ElementHead.getTypeModifierSolidBodyId(elementHead);
        // TODO: optimize - map paint id
        const paintId = bodyId;

        const point = x + (y * this.#elementArea.getWidth());
        const currentPaintId = this.#elementAreaOverlay[point];
        if (currentPaintId === ProcessorModuleSolidBody.#NEWLY_CREATED_PAINT_ID) {
            // this handles newly created tree branches etc.
            return true;
        }
        if (currentPaintId === paintId) {
            // already processed
            return this.#moved.has(paintId);
        }

        const [
            originalCount, upperBorderStack, lowerBorderStack, lowerBorderMin, properties
        ] = this.#discoverBoundaries(x, y, elementHead, paintId);

        const extendedCount = this.#extendUpperBoundaries(upperBorderStack, lowerBorderMin, paintId);
        const count = originalCount + extendedCount;

        const [
            borderCount, borderCountCanMove
        ] = this.#determineCanMove(lowerBorderStack.shadowClone(), paintId);

        // if (count >= ProcessorModuleSolidBody.#BODY_SIZE_LIMIT_MAX) {
        //     // too big
        //     return false;
        // }

        // if (count < ProcessorModuleSolidBody.#BODY_SIZE_LIMIT_MIN) {
        //     this.#bodyDestroy(paintId, borderStack);
        //     return true;
        // }

        if (properties.tree) {
            // living trees are more stable
            if (borderCount === borderCountCanMove) {
                // falling
                this.#bodyMove(paintId, lowerBorderStack);
                this.#moved.add(paintId);
                return true;
            }
        } else {
            if (borderCountCanMove / borderCount > 0.95) {
                // falling or very unstable
                this.#bodyMove(paintId, lowerBorderStack);
                this.#moved.add(paintId);
                return true;
            }

            if (borderCountCanMove / borderCount > 0.75) {
                // unstable
                this.#bodyPush(paintId, lowerBorderStack);
                return false;
            }
        }

        return false;
    }

    #bodyDestroy(paintId, lowerBorderStack) {
        const w = this.#elementArea.getWidth();

        let point;
        while ((point = lowerBorderStack.pop()) !== null) {
            // process "column"

            if (point === 0xffffffff) {
                // null point
                continue;
            }

            const bx = point % w;
            const by = Math.trunc(point / w);

            let i = 0;
            do {
                let elementHead = this.#elementArea.getElementHead(bx, by + i);

                const type = this.#random.nextInt(100) < 20 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
                elementHead = ElementHead.setType(elementHead, ElementHead.type8Powder(type, 4));

                let elementTail = this.#elementArea.getElementTail(bx, by + i);
                this.#elementArea.setElementHead(bx, by + i, elementHead);
                this.#elementArea.setElementTail(bx, by + i, elementTail);

                if (by + i >= 0) {
                    const nextPaintId = this.#elementAreaOverlay[bx + ((by + i - 1) * w)];
                    if (nextPaintId === paintId) {
                        i--;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            } while (true);
        }
    }

    #bodyMove(paintId, lowerBorderStack) {
        const w = this.#elementArea.getWidth();
        const h = this.#elementArea.getHeight();

        let point;
        while ((point = lowerBorderStack.pop()) !== null) {
            // process "column"

            if (point === 0xffffffff) {
                // null point
                continue;
            }

            const bx = point % w;
            const by = Math.trunc(point / w);

            let elementHeadOld = null;
            let elementTailOld = null;
            if (by + 1 < h) {
                elementHeadOld = this.#elementArea.getElementHead(bx, by + 1);
                elementTailOld = this.#elementArea.getElementTail(bx, by + 1);
            }

            let i = 0;
            do {
                const ty = by + 1 + i;
                if (ty < h) {
                    this.#elementArea.setElementHead(bx, ty, this.#elementArea.getElementHead(bx, by + i));
                    this.#elementArea.setElementTail(bx, ty, this.#elementArea.getElementTail(bx, by + i));
                    this.#elementAreaOverlay[bx + (ty * w)] = paintId;
                }

                if (by + i >= 0) {
                    const nextPaintId = this.#elementAreaOverlay[bx + ((by + i - 1) * w)];
                    if (nextPaintId === paintId) {
                        i--;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            } while (true);

            // deal with the old element

            let reuseElement = false;
            if (elementHeadOld != null) {
                const typeClass = ElementHead.getTypeClass(elementHeadOld);
                if (typeClass === ElementHead.TYPE_AIR) {
                    reuseElement = true;
                } else if (typeClass <= ElementHead.TYPE_FLUID) {
                    reuseElement = (this.#random.nextInt(4) === 0);
                }
            }

            if (reuseElement) {
                // move element above the solid body
                this.#elementArea.setElementHead(bx, by + i, elementHeadOld);
                this.#elementArea.setElementTail(bx, by + i, elementTailOld);
            } else {
                // set default element
                this.#elementArea.setElement(bx, by + i, this.#processorContext.getDefaults().getDefaultElement());
            }

            // create some movement below

            this.triggerPowderElement(bx, by + 2);
        }
    }

    #bodyPush(paintId, lowerBorderStack) {
        const w = this.#elementArea.getWidth();

        let point;
        while ((point = lowerBorderStack.pop()) !== null) {
            // process "column"

            if (point === 0xffffffff) {
                // null point
                continue;
            }

            const bx = point % w;
            const by = Math.trunc(point / w);

            // create some movement below

            this.triggerPowderElement(bx, by + 1);
        }
    }

    triggerPowderElement(x, y) {
        if (this.#elementArea.isValidPosition(x, y)) {
            const elementHeadUnder = this.#elementArea.getElementHead(x, y);
            const typeUnder = ElementHead.getTypeClass(elementHeadUnder);

            if (typeUnder === ElementHead.TYPE_POWDER || typeUnder === ElementHead.TYPE_POWDER_WET) {
                let modified = elementHeadUnder;
                modified = ElementHead.setTypeModifierPowderSliding(modified, 1);
                if (this.#random.nextInt(15) === 0) {
                    // change direction only once a while to make it less chaotic
                    modified = ElementHead.setTypeModifierPowderDirection(modified, this.#random.nextInt(2));
                }
                this.#elementArea.setElementHead(x, y, modified);
            }
        }
    }

    #determineCanMove(lowerBorderStack, paintId) {
        const w = this.#elementArea.getWidth();
        const h = this.#elementArea.getHeight();

        let borderCount = 0;
        let borderCountCanMove = 0;

        let point;
        while ((point = lowerBorderStack.pop()) !== null) {

            const bx = point % w;
            const by = Math.trunc(point / w);

            if (by + 1 < h) {
                const elementHead = this.#elementArea.getElementHead(bx, by + 1);

                // check whether is not connected with other "column" by extendUpperBoundaries
                if (this.#elementAreaOverlay[bx + ((by + 1) * w)] === paintId) {
                    lowerBorderStack.removePrevious();  // remove
                    continue;
                }

                borderCount++;

                // can move here?
                const typeClass = ElementHead.getTypeClass(elementHead);
                switch (typeClass) {
                    case ElementHead.TYPE_AIR:
                    case ElementHead.TYPE_EFFECT:
                    case ElementHead.TYPE_GAS:
                    case ElementHead.TYPE_FLUID:
                        borderCountCanMove++;
                }
            } else {
                borderCount++;
            }
        }

        return [borderCount, borderCountCanMove];
    }

    #extendUpperBoundaries(upperBorderStack, lowerBorderMinY, paintId) {
        // handles e.g. sand /stuck/ inside a solid body

        const w = this.#elementArea.getWidth();
        const h = this.#elementArea.getHeight();

        let extendedCount = 0;

        let point;
        while ((point = upperBorderStack.pop()) !== null) {
            const bx = point % w;
            const by = Math.trunc(point / w);

            const columnLowerBorderMinY = lowerBorderMinY[bx];
            if (columnLowerBorderMinY >= by) {
                continue;
            }
            // there is at leas one lower border above this upper border

            let i = 0;
            let ty;
            while ((ty = by - (i + 1)) >= 0 && ty > columnLowerBorderMinY) {
                const nextPaintId = this.#elementAreaOverlay[bx + (ty * w)];

                if (nextPaintId === paintId) {
                    // lower boundary reached
                    break;
                }

                if (nextPaintId !== 0) {
                    // already in another body
                    break;
                }

                const elementHead = this.#elementArea.getElementHead(bx, ty);
                const typeClass = ElementHead.getTypeClass(elementHead);

                // TODO: Im not sure here
                /*if (typeClass <= ElementHead.TYPE_FLUID) {
                    // light element
                    break;
                } else*/ if (typeClass < ElementHead.TYPE_STATIC) {
                    // extend
                    this.#elementAreaOverlay[bx + (ty * w)] = paintId;
                    extendedCount++;
                    i++;
                } else {
                    // too heavy element
                    break;
                }
            }
        }

        return extendedCount;
    }

    #reusableWorkStack = new Uint32Stack();
    #reusableUpperBorderStack = new Uint32Stack();
    #reusableLowerBorderStack = new Uint32Stack();
    #reusableLowerBorderMinY;  // new Uint16Array(width);

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param elementHead {number}
     * @param paintId {number}
     * @return {[number, Uint32Stack, Uint32Stack, Uint16Array, object]} result
     */
    #discoverBoundaries(x, y, elementHead, paintId) {
        const pattern = 0b11110111;  // falling id and type class
        const matcher = this.#elementArea.getElementHead(x, y) & pattern;

        const w = this.#elementArea.getWidth();

        const stack = this.#reusableWorkStack;
        stack.reset();

        const upperBorderStack = this.#reusableUpperBorderStack;
        upperBorderStack.reset();

        const lowerBorderStack = this.#reusableLowerBorderStack;
        lowerBorderStack.reset();

        const lowerBorderMinY = this.#reusableLowerBorderMinY;
        lowerBorderMinY.fill(0xffff);  // not set

        const properties = {
            tree: ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_TREE  // default value
        };

        let count = 0;
        let point = x + y * w;
        do {
            const x = point % w;
            const y = Math.trunc(point / w);

            this.#elementAreaOverlay[point] = paintId;
            count++;

            const upperBorder = this.#discoverNeighbour(x, y - 1, pattern, matcher, stack, paintId, properties);
            if (upperBorder) {
                upperBorderStack.push(point);
            }

            this.#discoverNeighbour(x + 1, y, pattern, matcher, stack, paintId, properties);
            this.#discoverNeighbour(x - 1, y, pattern, matcher, stack, paintId, properties);

            if (ElementHead.getTypeModifierSolidNeighbourhoodType(this.#elementArea.getElementHead(x, y)) === 0) {
                // extended neighbourhood
                this.#discoverNeighbour(x + 1, y - 1, pattern, matcher, stack, paintId, properties);
                this.#discoverNeighbour(x - 1, y - 1, pattern, matcher, stack, paintId, properties);
                this.#discoverNeighbour(x + 1, y + 1, pattern, matcher, stack, paintId, properties);
                this.#discoverNeighbour(x - 1, y + 1, pattern, matcher, stack, paintId, properties);
            }

            const lowerBorder = this.#discoverNeighbour(x, y + 1, pattern, matcher, stack, paintId, properties);
            if (lowerBorder) {
                lowerBorderStack.push(point);
                const oldMin = lowerBorderMinY[x];
                lowerBorderMinY[x] = (oldMin === 0xffff) ? y : Math.min(oldMin, y);
            }

        } while ((point = stack.pop()) != null);

        return [count, upperBorderStack, lowerBorderStack, lowerBorderMinY, properties];
    }

    #discoverNeighbour(x, y, pattern, matcher, stack, targetPaintId, properties) {
        if (x < 0 || y < 0) {
            return true;  // border
        }

        const w = this.#elementArea.getWidth();
        const h = this.#elementArea.getHeight();
        if (x >= w || y >= h) {
            return true;  // border
        }

        const point = x + (y * w);
        const currentPaintId = this.#elementAreaOverlay[point];
        if (currentPaintId === ProcessorModuleSolidBody.#QUEUED_PAINT_ID) {
            // already queued
            return false;  // no border
        }
        if (currentPaintId === targetPaintId) {
            // already done
            return false;  // no border
        }

        const elementHead = this.#elementArea.getElementHead(x, y);

        if (!properties.tree) {
            if (ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_TREE) {
                properties.tree = true;
            }
        }

        if ((elementHead & pattern) !== matcher) {
            // no match
            return true;  // border
        }

        this.#elementAreaOverlay[point] = ProcessorModuleSolidBody.#QUEUED_PAINT_ID;
        stack.push(point);
        return false;  // no border
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2024-03-23
 */
class Uint32Stack {
    static create(size) {
        return new Uint32Stack(new Uint32Array(Math.max(1, size)));
    }

    /** @type Uint32Array */
    #array;
    #i = -1;

    constructor(array = new Uint32Array(1)) {
        this.#array = array;
    }

    push(value) {
        if (this.#array.length === this.#i + 1) {
            // increase size
            const newArray = new Uint32Array(this.#array.length * 2);
            newArray.set(this.#array);
            this.#array = newArray;
        }
        this.#array[++this.#i] = value;
    }

    pop() {
        if (this.#i === -1) {
            return null;
        }
        return this.#array[this.#i--];
    }

    shadowClone() {
        const clone = new Uint32Stack(this.#array);
        clone.#i = this.#i;
        return clone;
    }

    removePrevious() {
        this.#array[this.#i + 1] = 0xffffffff;
    }

    reset() {
        this.#i = -1;
    }
}
