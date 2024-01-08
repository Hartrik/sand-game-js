import Spline from "cubic-spline";
import { ProcessorModuleGrass } from "./processing/ProcessorModuleGrass.js";
import { ProcessorModuleTree } from "./processing/ProcessorModuleTree.js";
import { BrushDefs } from "../def/BrushDefs";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-20
 */
export class TemplateLayeredPainter {

    static #spline(points) {
        const xs = new Array(points.length);
        const ys = new Array(points.length);
        for (let i = 0; i < points.length; i++) {
            xs[i] = points[i][0];
            ys[i] = points[i][1];
        }
        const spline = new Spline(xs, ys);
        return function (x) {
            return Math.max(Math.trunc(spline.at(x)), 0);
        };
    }

    static #constant(height) {
        return function(x) {
            return Math.trunc(height);
        };
    }


    /** @type ElementArea */
    #elementArea;

    /** @type SandGameGraphics */
    #graphics;

    /** @type DeterministicRandom */
    #random;

    /** @type ProcessorContext */
    #processorContext;

    #lastLevel;

    /**
     *
     * @param elementArea {ElementArea}
     * @param graphics {SandGameGraphics}
     * @param random {DeterministicRandom}
     * @param processorContext {ProcessorContext}
     */
    constructor(elementArea, graphics, random, processorContext) {
        this.#elementArea = elementArea;
        this.#graphics = graphics;
        this.#random = random;
        this.#processorContext = processorContext;
        this.#lastLevel = new Array(elementArea.getWidth()).fill(0);
    }

    layer(layer, relative, brush, shuffleWithLevelBelow = 0) {
        const f = (typeof layer === 'number')
                ? TemplateLayeredPainter.#constant(layer)
                : TemplateLayeredPainter.#spline(layer);

        for (let x = 0; x < this.#elementArea.getWidth(); x++) {
            const lastLevel = this.#lastLevel[x];

            const level = (relative)
                    ? lastLevel + f(x)
                    : f(x);

            if (lastLevel < level) {
                let count = 0;
                for (let i = lastLevel; i < level && i < this.#elementArea.getHeight(); i++) {
                    let y = this.#elementArea.getHeight() - 1 - i;
                    this.#graphics.draw(x, y, brush);
                    count++;
                }

                // shuffle
                if (shuffleWithLevelBelow > 0 && count > 0) {
                    for (let i = 0; i < shuffleWithLevelBelow; i++) {
                        const max = Math.min(Math.trunc(count / 2), 10);
                        if (max > 1) {
                            const r = this.#random.nextInt(Math.ceil(max)) - Math.trunc(max / 2);
                            const y1 = this.#elementArea.getHeight() - 1 - lastLevel + r;
                            const y2 = this.#elementArea.getHeight() - 1 - lastLevel + r + 1;
                            if (y1 < this.#elementArea.getHeight() && y2 < this.#elementArea.getHeight()) {
                                this.#elementArea.swap(x, y1, x, y2);
                            }
                        }
                    }
                }

                this.#lastLevel[x] = level;
            }
        }
        return this;
    }

    grass(from = 0, to = -1) {
        if (to === -1) {
            to = this.#elementArea.getWidth();
        }
        for (let x = from; x < to; x++) {
            const lastLevel = this.#lastLevel[x];
            const y = this.#elementArea.getHeight() - 1 - lastLevel;

            if (ProcessorModuleGrass.canGrowUpHere(this.#elementArea, x, y)) {
                const brush = this.#processorContext.getDefaults().getBrushGrass();
                ProcessorModuleGrass.spawnHere(this.#elementArea, x, y, brush, this.#random);
            }
        }

        // TODO: update lastLevel
        return this;
    }

    tree(x, type = 0, levelsToGrow = undefined) {
        if (x <= 5 || x >= this.#elementArea.getWidth() - 5) {
            return this;  // out of bounds
        }

        const lastLevel = this.#lastLevel[x];
        const y = this.#elementArea.getHeight() - 1 - lastLevel;

        const brush = this.#processorContext.getDefaults().getBrushTree();
        ProcessorModuleTree.spawnHere(this.#elementArea, x, y, type, brush, this.#random, this.#processorContext, levelsToGrow);

        // TODO: update lastLevel
        return this;
    }

    fish(x, relativeY = 0) {
        if (x < 0 || x >= this.#elementArea.getWidth() - 1) {
            return this;  // out of bounds
        }

        const lastLevelHead = this.#lastLevel[x];

        const y = this.#elementArea.getHeight() - relativeY - lastLevelHead;
        if (y < 0 || y >= this.#elementArea.getHeight()) {
            return this;  // out of bounds
        }
        this.#elementArea.setElement(x, y, BrushDefs.FISH_HEAD.apply(0, 0, this.#random, null));
        this.#elementArea.setElement(x + 1, y, BrushDefs.FISH_BODY.apply(0, 0, this.#random, null));

        // TODO: update lastLevel
        return this;
    }

    tool(x, relativeY, tool) {
        if (x < 0 || x >= this.#elementArea.getWidth()) {
            return this;  // out of bounds
        }

        const lastLevel = this.#lastLevel[x];
        const y = this.#elementArea.getHeight() - relativeY - lastLevel;
        if (y < 0 || y >= this.#elementArea.getHeight()) {
            return this;  // out of bounds
        }

        tool.applyPoint(x, y, this.#graphics, false);

        // TODO: update lastLevel
        return this;
    }
}