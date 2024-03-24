// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Spline from "cubic-spline";
import { createNoise2D } from "simplex-noise";
import ProcessorModuleGrass from "./processing/ProcessorModuleGrass.js";
import ProcessorModuleTree from "./processing/ProcessorModuleTree.js";
import BrushDefs from "../def/BrushDefs";
import DeterministicRandom from "./DeterministicRandom";
import ElementHead from "./ElementHead";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-18
 */
export default class TemplateLayeredPainter {

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

    /**
     *
     * @param constant {number}
     * @param relative {boolean}
     * @param brush {Brush}
     * @param shuffleWithLevelBelow {number}
     * @returns {TemplateLayeredPainter}
     */
    layer(constant, relative, brush, shuffleWithLevelBelow = 0) {
        function func(x) {
            return Math.trunc(constant);
        }

        this.layerFunction(func, relative, brush, shuffleWithLevelBelow);
        return this;
    }

    /**
     *
     * @param points {[number,number][]}
     * @param relative {boolean}
     * @param brush {Brush}
     * @param shuffleWithLevelBelow {number}
     * @returns {TemplateLayeredPainter}
     */
    layerSpline(points, relative, brush, shuffleWithLevelBelow = 0) {
        const xs = new Array(points.length);
        const ys = new Array(points.length);
        for (let i = 0; i < points.length; i++) {
            xs[i] = points[i][0];
            ys[i] = points[i][1];
        }
        const spline = new Spline(xs, ys);
        function func (x) {
            return Math.max(Math.trunc(spline.at(x)), 0);
        }

        this.layerFunction(func, relative, brush, shuffleWithLevelBelow);
        return this;
    }

    /**
     *
     * @param config {{seed:number,factor:number,threshold:number,force:number}[]}
     * @param relative {boolean}
     * @param brush {Brush}
     * @param shuffleWithLevelBelow {number}
     * @returns {TemplateLayeredPainter}
     */
    layerPerlin(config, relative, brush, shuffleWithLevelBelow = 0) {
        const levels = [];
        for (let levelConfig of config) {
            if (levelConfig.seed === undefined) {
                DeterministicRandom.DEFAULT.next();
                levelConfig.seed = DeterministicRandom.DEFAULT.getState();
            }
            if (levelConfig.factor === undefined) {
                throw 'factor not defined';
            }
            if (levelConfig.threshold === undefined) {
                throw 'threshold not defined';
            }
            if (levelConfig.force === undefined) {
                throw 'force not defined';
            }

            const random = new DeterministicRandom(levelConfig.seed);
            const noise2d = createNoise2D(() => random.next());

            levels.push({ instance: noise2d, levelConfig: levelConfig });
        }

        function func(x) {
            let result = 0;
            for (const { instance, levelConfig } of levels) {
                const { factor, threshold, force } = levelConfig;

                let value = (instance(x / factor, 0) + 1) / 2;  // 0..1

                // apply threshold
                if (value < threshold) {
                    value = 0;
                }
                value = (value - threshold) * (1 / (1 - threshold));  // normalized 0..1

                // apply force
                value = value * force;

                result += value;
            }
            return Math.trunc(result);
        }

        this.layerFunction(func, relative, brush, shuffleWithLevelBelow);
        return this;
    }

    /**
     *
     * @param func {function(x:number):number}
     * @param relative {boolean}
     * @param brush {Brush}
     * @param shuffleWithLevelBelow {number}
     * @returns {TemplateLayeredPainter}
     */
    layerFunction(func, relative, brush, shuffleWithLevelBelow = 0) {
        for (let x = 0; x < this.#elementArea.getWidth(); x++) {
            const lastLevel = this.#lastLevel[x];

            const level = (relative)
                    ? lastLevel + func(x)
                    : func(x);

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

    tree(x, type = undefined, levelsToGrow = undefined) {
        if (x <= 5 || x >= this.#elementArea.getWidth() - 5) {
            return this;  // out of bounds
        }

        const lastLevel = this.#lastLevel[x];
        const y = this.#elementArea.getHeight() - 1 - lastLevel;

        const brush = this.#processorContext.getDefaults().getBrushTree();

        // check element under
        if (this.#elementArea.isValidPosition(x, y + 1)) {
            const elementHeadUnder = this.#elementArea.getElementHead(x, y + 1);
            if (ElementHead.getBehaviour(elementHeadUnder) !== ElementHead.BEHAVIOUR_SOIL) {
                return this;
            }
        } else {
            return this;
        }

        if (type === undefined) {
            type = this.#random.nextInt(8);
        }

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