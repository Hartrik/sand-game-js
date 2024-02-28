import {ElementHead} from "../ElementHead.js";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-28
 */
export class ProcessorModuleSolidBody {

    static #QUEUED_PAINT_ID = 255;
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
        if (paintId === currentPaintId) {
            // already processed
            return this.#moved.has(paintId);
        }

        const [count, borderCount, borderCountCanMove, borderStack, properties] = this.#discover(x, y, elementHead, paintId);
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
                this.#bodyMove(paintId, borderStack);
                this.#moved.add(paintId);
                return true;
            }
        } else {
            if (borderCountCanMove / borderCount > 0.95) {
                // falling or very unstable
                this.#bodyMove(paintId, borderStack);
                this.#moved.add(paintId);
                return true;
            }

            if (borderCountCanMove / borderCount > 0.75) {
                // unstable
                this.#bodyPush(paintId, borderStack);
                return false;
            }
        }

        return false;
    }

    #bodyDestroy(paintId, borderStack) {
        const w = this.#elementArea.getWidth();

        let point;
        while ((point = borderStack.pop()) !== null) {
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

    #bodyMove(paintId, borderStack) {
        const w = this.#elementArea.getWidth();
        const h = this.#elementArea.getHeight();

        let point;
        while ((point = borderStack.pop()) !== null) {
            // process "column"

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

    #bodyPush(paintId, borderStack) {
        const w = this.#elementArea.getWidth();

        let point;
        while ((point = borderStack.pop()) !== null) {
            // process "column"

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

    #reusableWorkStack = new Uint32Stack();
    #reusableBorderStack = new Uint32Stack();

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param elementHead {number}
     * @param paintId {number}
     * @return {[number, number, number, Uint32Stack, object]} result
     */
    #discover(x, y, elementHead, paintId) {
        const pattern = 0b11110111;  // falling id and type class
        const matcher = this.#elementArea.getElementHead(x, y) & pattern;

        const w = this.#elementArea.getWidth();

        const stack = this.#reusableWorkStack;
        stack.reset();

        const borderStack = this.#reusableBorderStack;
        borderStack.reset();

        const properties = {
            tree: ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_TREE  // default value
        };

        let count = 0;
        let borderCount = 0;
        let borderCountCanMove = 0;

        let point = x + y * w;
        do {
            const x = point % w;
            const y = Math.trunc(point / w);

            this.#elementAreaOverlay[point] = paintId;
            count++;

            this.#discoverNeighbour(x, y - 1, pattern, matcher, stack, paintId, properties);
            this.#discoverNeighbour(x + 1, y, pattern, matcher, stack, paintId, properties);
            this.#discoverNeighbour(x - 1, y, pattern, matcher, stack, paintId, properties);

            if (properties.tree) {
                // handle tree branches
                this.#discoverNeighbour(x + 1, y - 1, pattern, matcher, stack, paintId, properties);
                this.#discoverNeighbour(x - 1, y - 1, pattern, matcher, stack, paintId, properties);
                this.#discoverNeighbour(x + 1, y + 1, pattern, matcher, stack, paintId, properties);
                this.#discoverNeighbour(x - 1, y + 1, pattern, matcher, stack, paintId, properties);
            }

            const borderType = this.#discoverNeighbour(x, y + 1, pattern, matcher, stack, paintId, properties, true);

            if (borderType === 0) {

            } else if (borderType === 1) {
                // border
                borderStack.push(point);
                borderCount++;
            } else if (borderType === 2) {
                // border & can move down
                borderStack.push(point);
                borderCount++;
                borderCountCanMove++;
            }

        } while ((point = stack.pop()) != null);

        return [count, borderCount, borderCountCanMove, borderStack, properties];
    }

    #discoverNeighbour(x, y, pattern, matcher, stack, targetPaintId, properties, isBelow) {
        if (x < 0 || y < 0) {
            return 0;
        }

        const w = this.#elementArea.getWidth();
        const h = this.#elementArea.getHeight();
        if (x >= w || y >= h) {
            if (isBelow) {
                return 1;
            }
            return 0;
        }

        const point = x + (y * w);
        const currentPaintId = this.#elementAreaOverlay[point];
        if (currentPaintId === ProcessorModuleSolidBody.#QUEUED_PAINT_ID) {
            // already queued
            return 0;
        }
        if (currentPaintId === targetPaintId) {
            // already done
            return 0;
        }

        const elementHead = this.#elementArea.getElementHead(x, y);

        if (!properties.tree) {
            if (ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_TREE) {
                properties.tree = true;
            }
        }

        if ((elementHead & pattern) !== matcher) {
            // no match
            if (isBelow) {
                // can move here?
                const typeClass = ElementHead.getTypeClass(elementHead);
                switch (typeClass) {
                    case ElementHead.TYPE_AIR:
                    case ElementHead.TYPE_EFFECT:
                    case ElementHead.TYPE_GAS:
                    case ElementHead.TYPE_FLUID:
                        return 2;
                    default:
                        return 1;
                }
            }
            return 0;
        }

        this.#elementAreaOverlay[point] = ProcessorModuleSolidBody.#QUEUED_PAINT_ID;
        stack.push(point);
        return 0;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2024-02-23
 */
class Uint32Stack {
    /** @type Uint32Array */
    #array;
    #i = -1;

    constructor(size = 1) {
        size = Math.max(1, size);
        this.#array = new Uint32Array(size);
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

    reset() {
        this.#i = -1;
    }
}
