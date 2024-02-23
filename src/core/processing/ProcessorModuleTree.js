import {ElementHead} from "../ElementHead.js";
import {ElementTail} from "../ElementTail";
import {BrushDefs} from "../../def/BrushDefs.js";
import {ProcessorContext} from "./ProcessorContext.js";
import {DeterministicRandom} from "../DeterministicRandom.js";
import {VisualEffects} from "./VisualEffects";

// TODO: direct BrushDefs access >> Defaults

/**
 *
 * @author Patrik Harag
 * @version 2023-12-20
 */
export class ProcessorModuleTree {

    static TYPE_TRUNK = 1;
    static TYPE_BRANCH = 2;
    static TYPE_LEAF = 3;
    static TYPE_ROOT = 4;

    static #MAX_TREE_TEMPERATURE = 100;
    static #MAX_WOOD_TEMPERATURE = 50;
    static #MAX_LEAF_TEMPERATURE = 40;

    static #NOISE = VisualEffects.visualNoiseProvider(7616891641);

    static #LEAF_NOISE = (elementTail, x, y) => {
        return ProcessorModuleTree.#NOISE.visualNoise(elementTail, x, y, 10, 0.5, 1, 68, 77, 40);
    };

    static #TRUNK_NOISE = (elementTail, x, y) => {
        return ProcessorModuleTree.#NOISE.visualNoise(elementTail, x, y, 4, 0.5, 0.9, 87, 61, 39);
    };

    static spawnHere(elementArea, x, y, type, brush, random, processorContext, levelsToGrow = -1) {
        type = type % (1 << ElementHead.FIELD_SPECIAL_SIZE);

        const element = brush.apply(x, y, random);
        element.elementHead = ElementHead.setSpecial(element.elementHead, type);  // override tree type
        elementArea.setElement(x, y, element);

        // tree fast grow
        const template = processorContext.getDefaults().getTreeTrunkTemplates()[type];
        if (template === undefined) {
            throw 'Tree template not found: ' + type;
        }
        const treeModule = new ProcessorModuleTree(elementArea, random, processorContext);
        treeModule.#treeGrow(element.elementHead, x, y, template, levelsToGrow);

        // roots fast grow
        for (let i = 1; i < 10; i++) {
            for (let j = 0; j < 9; j++) {
                const tx = x + j - 4;
                const ty = y + i;

                if (!elementArea.isValidPosition(tx, ty)) {
                    continue;
                }
                const targetElement = elementArea.getElementHead(tx, ty);
                if (ElementHead.getBehaviour(targetElement) !== ElementHead.BEHAVIOUR_TREE_ROOT) {
                    continue;
                }
                const growIndex = ElementHead.getSpecial(targetElement);
                if (growIndex === 0) {
                    continue;
                }

                const direction = random.nextInt(10);
                treeModule.#treeRootGrow(tx, ty, targetElement, growIndex, direction);
            }
        }
    }


    /** @type ElementArea */
    #elementArea;

    /** @type DeterministicRandom */
    #random;

    /** @type ProcessorContext */
    #processorContext;

    #trunkTreeTemplates;
    #leafClusterTemplates;

    constructor(elementArea, random, processorContext) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#processorContext = processorContext;

        this.#trunkTreeTemplates = this.#processorContext.getDefaults().getTreeTrunkTemplates()
        this.#leafClusterTemplates = this.#processorContext.getDefaults().getTreeLeafClusterTemplates()
    }

    behaviourTree(elementHead, x, y) {
        // check temperature
        if (ElementHead.getTemperature(elementHead) > ProcessorModuleTree.#MAX_TREE_TEMPERATURE) {
            // => destroy tree instantly
            this.#elementArea.setElementHead(x, y, ElementHead.setBehaviour(elementHead, 0));
            return;
        }

        const random = this.#random.nextInt(ProcessorContext.OPT_CYCLES_PER_SECOND);
        if (random === 0) {
            // check status
            const trunkTemplateId = ElementHead.getSpecial(elementHead);
            const template = this.#trunkTreeTemplates[trunkTemplateId];
            if (template === undefined) {
                throw 'Tree template not found: ' + trunkTemplateId;
            }
            const level = this.#treeGrow(elementHead, x, y, template, 1);
            this.#treeCheckStatus(x, y, level, template);
        }
    }

    #treeGrow(elementHead, x, y, template, levelsToGrow = 1) {
        let leafClusterIdRndSalt = this.#treeCreateOrGetSeed(x, y - 2);

        let level = 0;
        let levelGrown = 0;

        let parallelBranches = [{
            entries: template.entries,
            index: 0,
            x: 0,
            y: 0,
            brush: null
        }];

        let grow = (nx, ny, brush, noise, increment) => {
            let element = brush.apply(nx, ny, this.#random);
            if (noise === null) {
                this.#elementArea.setElement(nx, ny, element);
            } else {
                const tx = (x - nx) + (10 * x);  // unique pattern for each tree
                const ty = (y - ny) + (10 * y);
                const modifiedTail = noise(element.elementTail, tx, ty);
                this.#elementArea.setElementHeadAndTail(nx, ny, element.elementHead, modifiedTail);
            }
            this.#processorContext.trigger(nx, ny);
            if (increment) {
                level++;
                levelGrown++;
            }
        }

        while (parallelBranches.length > 0) {
            const length = parallelBranches.length;
            let cleanupBranches = false;

            for (let i = 0; i < length; i++) {
                const branch = parallelBranches[i];

                if (branch.index >= branch.entries.length) {
                    // end of branch
                    cleanupBranches = true;
                    continue;
                }

                const node = branch.entries[branch.index++];
                const [templateX, templateY, nodeType] = node;
                const nx = x + templateX + branch.x;
                const ny = y - templateY - branch.y;

                if (this.#elementArea.isValidPosition(nx, ny)) {
                    const currentElementHead = this.#elementArea.getElementHead(nx, ny);
                    const currentElementBehaviour = ElementHead.getBehaviour(currentElementHead);

                    switch (nodeType) {
                        case ProcessorModuleTree.TYPE_LEAF:
                            if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_LEAF) {
                                // is already here
                                // update leaf vitality (if not dead already)
                                if (ElementHead.getSpecial(currentElementHead) < 15) {
                                    this.#elementArea.setElementHead(nx, ny, ElementHead.setSpecial(currentElementHead, 0));
                                }
                            } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_TRUNK) {
                                // replace trunk
                                grow(nx, ny, branch.brush, ProcessorModuleTree.#LEAF_NOISE, false);
                            } else if (ElementHead.getTypeClass(currentElementHead) === ElementHead.TYPE_AIR) {
                                grow(nx, ny, branch.brush, ProcessorModuleTree.#LEAF_NOISE, false);
                            }
                            break;

                        case ProcessorModuleTree.TYPE_TRUNK:
                            if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_TRUNK) {
                                level++;  // trunk is already here
                            } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_LEAF) {
                                level++;  // leaf is already here
                            }
                            let trunkGrow = false;
                            if (ElementHead.getTypeClass(currentElementHead) === ElementHead.TYPE_AIR) {
                                trunkGrow = true;
                            } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_SOIL) {
                                trunkGrow = true;
                            } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_GRASS) {
                                trunkGrow = true;
                            } else if (templateY < 5) {
                                // bottom trunk only...
                                if (ElementHead.getTypeClass(currentElementHead) !== ElementHead.TYPE_STATIC) {
                                    trunkGrow = true;
                                }
                            }
                            if (trunkGrow) {
                                const treeBrush = (templateY > 0) ? BrushDefs.TREE_WOOD : BrushDefs.TREE_WOOD_DARK;
                                grow(nx, ny, treeBrush, ProcessorModuleTree.#TRUNK_NOISE, true);
                                if (templateY === 2 && templateX === 0) {
                                    // set seed
                                    this.#treeSetSeed(nx, ny, leafClusterIdRndSalt);
                                }
                            }
                            break;

                        case ProcessorModuleTree.TYPE_BRANCH:
                            let branchGrow = false;
                            if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_LEAF) {
                                level++;  // is already here
                                // update leaf vitality (if not dead already)
                                if (ElementHead.getSpecial(currentElementHead) < 15) {
                                    this.#elementArea.setElementHead(nx, ny, ElementHead.setSpecial(currentElementHead, 0));
                                }
                            } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_TRUNK) {
                                level++;  // is already here
                            } else if (ElementHead.getTypeClass(currentElementHead) === ElementHead.TYPE_AIR) {
                                branchGrow = true;
                            } else {
                                break;  // an obstacle...
                            }

                            let rnd = DeterministicRandom.next(leafClusterIdRndSalt + templateX + templateY);
                            let leafClusterId = Math.trunc(rnd * this.#leafClusterTemplates.length);
                            let leafCluster = this.#leafClusterTemplates[leafClusterId];
                            let leafBrush = (Math.trunc(rnd * 1024) % 2 === 0)
                                    ? BrushDefs.TREE_LEAF_LIGHTER
                                    : BrushDefs.TREE_LEAF_DARKER;
                            parallelBranches.push({
                                entries: leafCluster.entries,
                                index: 0,
                                x: templateX,
                                y: templateY,
                                brush: leafBrush
                            });
                            if (branchGrow) {
                                grow(nx, ny, leafBrush, ProcessorModuleTree.#LEAF_NOISE, true);
                            }
                            break;

                        case ProcessorModuleTree.TYPE_ROOT:
                            if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_ROOT) {
                                level++;  // is already here
                            } else {
                                grow(nx, ny, BrushDefs.TREE_ROOT, null, true);
                            }
                            break;

                        default:
                            throw 'Unknown type: ' + nodeType;
                    }
                }

                let newParallelEntries = (node.length > 3) ? node[3] : undefined;
                if (newParallelEntries !== undefined) {
                    parallelBranches.push({
                        entries: newParallelEntries,
                        index: 0,
                        x: branch.x,
                        y: branch.y,
                        brush: branch.brush
                    });
                }
            }

            if (levelsToGrow !== -1 && levelGrown >= levelsToGrow) {
                break;  // terminate
            }

            if (cleanupBranches) {
                for (let i = parallelBranches.length - 1; i >= 0; i--) {
                    let branch = parallelBranches[i];
                    if (branch.index >= branch.entries.length) {
                        parallelBranches.splice(i, 1);
                    }
                }
            }
        }
        return level;
    }

    #treeCreateOrGetSeed(x, y) {
        if (this.#elementArea.isValidPosition(x, y)) {
            let elementHead = this.#elementArea.getElementHead(x, y);
            if (ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_TREE_TRUNK) {
                return ElementHead.getSpecial(elementHead);
            }
        }
        return this.#random.nextInt(1 << ElementHead.FIELD_SPECIAL_SIZE);
    }

    #treeSetSeed(x, y, seed) {
        // assume point exists
        // assume tree trunk
        let elementHead = this.#elementArea.getElementHead(x, y);
        elementHead = ElementHead.setSpecial(elementHead, seed);
        this.#elementArea.setElementHead(x, y, elementHead)
    }

    #treeCheckStatus(x, y, level, template) {
        // check tree status
        // - last tree status is carried by tree trunk above
        if (y > 0) {
            let carrierElementHead = this.#elementArea.getElementHead(x, y - 1);
            if (ElementHead.getBehaviour(carrierElementHead) === ElementHead.BEHAVIOUR_TREE_TRUNK) {
                const maxStage = 15;
                let lastStage = ElementHead.getSpecial(carrierElementHead);
                let currentStage = Math.trunc(level / template.entriesCount * maxStage);
                if (lastStage - currentStage > 5) {
                    // too big damage taken => kill tree
                    this.#elementArea.setElementHead(x, y - 1, ElementHead.setSpecial(carrierElementHead, 0));
                    this.#elementArea.setElement(x, y, BrushDefs.TREE_WOOD.apply(x, y, this.#random));
                } else {
                    // update stage
                    this.#elementArea.setElementHead(x, y - 1, ElementHead.setSpecial(carrierElementHead, currentStage));
                }
            }
        }
    }

    behaviourTreeRoot(elementHead, x, y) {
        // check temperature
        if (ElementHead.getTemperature(elementHead) > ProcessorModuleTree.#MAX_TREE_TEMPERATURE) {
            // => destroy instantly
            this.#elementArea.setElementHead(x, y, ElementHead.setBehaviour(elementHead, 0));
            return;
        }

        let growIndex = ElementHead.getSpecial(elementHead);
        if (growIndex === 0) {
            // maximum size
            if (this.#processorContext.getIteration() % 1000 === 0) {
                this.#treeRootHardenSurroundingElements(x, y);
            }
            return;
        }

        let random = this.#random.nextInt(ProcessorContext.OPT_CYCLES_PER_SECOND * 10);
        if (random < 10) {
            this.#treeRootGrow(x, y, elementHead, growIndex, random);
        }
    }

    #treeRootHardenSurroundingElements(x, y) {
        const targetX = x + this.#random.nextInt(3) - 1;
        const targetY = y + this.#random.nextInt(3) - 1;

        if (this.#elementArea.isValidPosition(targetX, targetY)) {
            let targetElementHead = this.#elementArea.getElementHead(targetX, targetY);
            let type = ElementHead.getTypeClass(targetElementHead);
            if (type === ElementHead.TYPE_POWDER || type === ElementHead.TYPE_POWDER_WET || type === ElementHead.TYPE_POWDER_FLOATING) {
                let newType = ElementHead.type8(ElementHead.type8Solid(ElementHead.TYPE_STATIC, 3));
                let modifiedElementHead = ElementHead.setType(targetElementHead, newType);
                this.#elementArea.setElementHead(targetX, targetY, modifiedElementHead);
            }
        }
    }

    #treeRootGrow(x, y, elementHead, growIndex, direction) {
        let doGrow = (nx, ny) => {
            this.#elementArea.setElementHead(x, y, ElementHead.setSpecial(elementHead, 0));

            let element = BrushDefs.TREE_ROOT.apply(nx, ny, this.#random);
            let modifiedHead = ElementHead.setSpecial(element.elementHead, growIndex - 1);
            this.#elementArea.setElementHead(nx, ny, modifiedHead);
            this.#elementArea.setElementTail(nx, ny, element.elementTail);
        }

        // grow down first if there is a free space
        if (y < this.#elementArea.getHeight() - 1) {
            let targetElementHead = this.#elementArea.getElementHead(x, y + 1);
            if (ElementHead.getTypeClass(targetElementHead) === ElementHead.TYPE_AIR) {
                doGrow(x, y + 1);
                return;
            }
        }

        // grow in random way
        let nx = x;
        let ny = y;
        if (direction === 9 || direction === 8 || direction === 7) {
            nx += 1;
            ny += 1;
        } else if (direction === 6 || direction === 5 || direction === 4) {
            nx += -1;
            ny += 1;
        } else {
            ny += 1;
        }

        if (this.#elementArea.isValidPosition(nx, ny)) {
            let targetElementHead = this.#elementArea.getElementHead(nx, ny);
            if (ElementHead.getTypeClass(targetElementHead) !== ElementHead.TYPE_STATIC) {
                doGrow(nx, ny);
            }
        }
    }

    behaviourTreeLeaf(elementHead, x, y) {
        let vitality = ElementHead.getSpecial(elementHead);
        if (vitality < 15) {
            // check temperature
            const temperature = ElementHead.getTemperature(elementHead);
            if (temperature > ProcessorModuleTree.#MAX_LEAF_TEMPERATURE) {
                // => destroy instantly, keep temperature
                this.#dryLeaf(elementHead, x, y);
                return;
            }

            // decrement vitality (if not dead already)
            if (this.#processorContext.getIteration() % 32 === 0) {
                if (this.#random.nextInt(10) === 0) {
                    vitality++;
                    if (vitality >= 15) {
                        this.#dryLeaf(elementHead, x, y);
                        return;
                    } else {
                        elementHead = ElementHead.setSpecial(elementHead, vitality);
                        this.#elementArea.setElementHead(x, y, elementHead);
                    }
                }
            }
        }

        // approx one times per 5 seconds... check if it's not buried or levitating
        if (this.#processorContext.getIteration() % ProcessorContext.OPT_CYCLES_PER_SECOND === 0) {
            const random = this.#random.nextInt(5);

            if (random === 0) {
                // - check if it's not buried

                const directions = [[0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0]];
                const randomDirection = directions[this.#random.nextInt(directions.length)];
                const targetX = x + randomDirection[0];
                const targetY = y + randomDirection[1];

                if (this.#elementArea.isValidPosition(targetX, targetY)) {
                    const elementHeadAbove = this.#elementArea.getElementHead(targetX, targetY);
                    if (ElementHead.getTypeClass(elementHeadAbove) !== ElementHead.TYPE_STATIC
                            && ElementHead.getTypeClass(elementHeadAbove) >= ElementHead.TYPE_FLUID) {
                        this.#elementArea.setElement(x, y, this.#processorContext.getDefaults().getDefaultElement());
                    }
                }
            }
            if (random === 1) {
                // - check it's not levitating
                // TODO
            }
        }
    }

    #dryLeaf(elementHead, x, y) {
        const elementTail = this.#elementArea.getElementTail(x, y);

        // multiplication and alpha blending (for lighter color)
        const alpha = 0.85;
        const whiteBackground = 255 * (1.0 - alpha);
        let newElementTail = ElementTail.setColor(
            Math.trunc(ElementTail.getColorRed(elementTail) * 1.4 * alpha + whiteBackground) & 0xFF,
            Math.trunc(ElementTail.getColorGreen(elementTail) * 0.9 * alpha + whiteBackground) & 0xFF,
            Math.trunc(ElementTail.getColorBlue(elementTail) * 0.8 * alpha + whiteBackground) & 0xFF
        )

        const newElementHead = ElementHead.setSpecial(elementHead, 15);
        this.#elementArea.setElementHeadAndTail(x, y, newElementHead, newElementTail);
    }
}
