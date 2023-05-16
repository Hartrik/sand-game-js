import {ElementHead} from "./ElementHead.js";
import {Brushes} from "./Brushes.js";
import {ProcessorContext} from "./ProcessorContext.js";
import {DeterministicRandom} from "./DeterministicRandom.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-25
 */
export class ProcessorModuleTree {

    static spawnHere(elementArea, x, y, type, brush, random, processorContext) {
        type = type % (1 << ElementHead.FIELD_SPECIAL_SIZE);

        const element = brush.apply(x, y, random);
        element.elementHead = ElementHead.setSpecial(element.elementHead, type);  // override tree type
        elementArea.setElement(x, y, element);

        // tree fast grow
        const template = TreeTemplates.getTemplate(type);
        const treeModule = new ProcessorModuleTree(elementArea, random, processorContext);
        treeModule.#treeGrow(element.elementHead, x, y, template, true);

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

    constructor(elementArea, random, processorContext) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#processorContext = processorContext;
    }

    behaviourTree(elementHead, x, y) {
        const random = this.#random.nextInt(ProcessorContext.OPT_CYCLES_PER_SECOND);
        if (random === 0) {
            const template = TreeTemplates.getTemplate(ElementHead.getSpecial(elementHead));
            const level = this.#treeGrow(elementHead, x, y, template, false);
            this.#treeCheckStatus(x, y, level, template);
        }
    }

    #treeGrow(elementHead, x, y, template, fullGrow) {
        let level = 0;
        let stack = [];
        for (let child of template.root.children) {
            stack.push(child);
        }

        while (stack.length > 0) {
            let node = stack.pop();

            let nx = x + node.x;
            let ny = y + node.y;
            if (this.#elementArea.isValidPosition(nx, ny)) {
                let isHereAlready = false;
                let canGrowHere = false;

                const currentElementHead = this.#elementArea.getElementHead(nx, ny);
                const currentElementBehaviour = ElementHead.getBehaviour(currentElementHead);

                switch (node.type) {
                    case TreeTemplateNode.TYPE_TRUNK:
                    case TreeTemplateNode.TYPE_ROOT:
                        if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_TRUNK) {
                            isHereAlready = true;
                        } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_LEAF) {
                            canGrowHere = true;
                        } else if (ElementHead.getWeight(currentElementHead) === ElementHead.WEIGHT_AIR) {
                            canGrowHere = true;
                        } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_SOIL) {
                            canGrowHere = true;
                        } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_GRASS) {
                            canGrowHere = true;
                        } else if (node.y > Math.min(-4, -7 + Math.abs(node.x))) {
                            // roots & bottom trunk only...
                            if (ElementHead.getTypeOrdinal(currentElementHead) !== ElementHead.TYPE_STATIC) {
                                canGrowHere = true;
                            }
                        }
                        break;
                    case TreeTemplateNode.TYPE_LEAF:
                        if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_LEAF) {
                            isHereAlready = true;
                            // update leaf vitality (if not dead already)
                            if (ElementHead.getSpecial(currentElementHead) < 15) {
                                this.#elementArea.setElementHead(nx, ny, ElementHead.setSpecial(currentElementHead, 0));
                            }
                        } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_TRUNK) {
                            isHereAlready = true;
                        } else if (ElementHead.getWeight(currentElementHead) === ElementHead.WEIGHT_AIR) {
                            canGrowHere = true;
                        }
                        break;
                    default:
                        throw 'Unknown type: ' + node.type;
                }

                if (canGrowHere || isHereAlready) {
                    level++;
                }

                if (canGrowHere) {
                    this.#elementArea.setElement(nx, ny, node.brush.apply(nx, ny, this.#random));
                    this.#processorContext.trigger(nx, ny);
                }

                if (fullGrow || isHereAlready) {
                    for (let child of node.children) {
                        stack.push(child);
                    }
                }
            }
        }
        return level;
    }

    #treeCheckStatus(x, y, level, template) {
        // check tree status
        // - last tree status is carried by tree trunk above
        if (y > 0) {
            let carrierElementHead = this.#elementArea.getElementHead(x, y - 1);
            if (ElementHead.getBehaviour(carrierElementHead) === ElementHead.BEHAVIOUR_TREE_TRUNK) {
                const maxStage = 15;
                let lastStage = ElementHead.getSpecial(carrierElementHead);
                let currentStage = Math.trunc(level / template.nodes * maxStage);
                if (lastStage - currentStage > 5) {
                    // too big damage taken => kill tree
                    this.#elementArea.setElementHead(x, y - 1, ElementHead.setSpecial(carrierElementHead, 0));
                    this.#elementArea.setElement(x, y, Brushes.TREE_WOOD.apply(x, y, this.#random));
                } else {
                    // update stage
                    this.#elementArea.setElementHead(x, y - 1, ElementHead.setSpecial(carrierElementHead, currentStage));
                }
            }
        }
    }

    behaviourTreeRoot(elementHead, x, y) {
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
            let type = ElementHead.getTypeOrdinal(targetElementHead);
            if (type === ElementHead.TYPE_SAND_1 || type === ElementHead.TYPE_SAND_2) {
                let modifiedElementHead = ElementHead.setType(targetElementHead, ElementHead.TYPE_STATIC);
                this.#elementArea.setElementHead(targetX, targetY, modifiedElementHead);
            }
        }
    }

    #treeRootGrow(x, y, elementHead, growIndex, direction) {
        let doGrow = (nx, ny) => {
            this.#elementArea.setElementHead(x, y, ElementHead.setSpecial(elementHead, 0));

            let element = Brushes.TREE_ROOT.apply(nx, ny, this.#random);
            let modifiedHead = ElementHead.setSpecial(element.elementHead, growIndex - 1);
            this.#elementArea.setElementHead(nx, ny, modifiedHead);
            this.#elementArea.setElementTail(nx, ny, element.elementTail);
        }

        // grow down first if there is a free space
        if (y < this.#elementArea.getHeight() - 1) {
            let targetElementHead = this.#elementArea.getElementHead(x, y + 1);
            if (ElementHead.getWeight(targetElementHead) === ElementHead.WEIGHT_AIR) {
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
            if (ElementHead.getTypeOrdinal(targetElementHead) !== ElementHead.TYPE_STATIC) {
                doGrow(nx, ny);
            }
        }
    }

    behaviourTreeLeaf(elementHead, x, y) {
        // decrement vitality (if not dead already)
        let vitality = ElementHead.getSpecial(elementHead);
        if (vitality < 15) {
            if (this.#processorContext.getIteration() % 32 === 0) {
                if (this.#random.nextInt(10) === 0) {
                    vitality++;
                    if (vitality >= 15) {
                        this.#elementArea.setElement(x, y, Brushes.TREE_LEAF_DEAD.apply(x, y, this.#random));
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
                    if (ElementHead.getTypeOrdinal(elementHeadAbove) !== ElementHead.TYPE_STATIC
                        && ElementHead.getWeight(elementHeadAbove) >= ElementHead.WEIGHT_WATER) {
                        this.#elementArea.setElement(x, y, this.#processorContext.getDefaultElement());
                    }
                }
            }
            if (random === 1) {
                // - check it's not levitating
                // TODO
            }
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-05-04
 */
class TreeTemplates {
    static TEMPLATES = [];

    /**
     *
     * @param id {number} template id
     * @returns {TreeTemplate} template
     */
    static getTemplate(id) {
        let template = TreeTemplates.TEMPLATES[id];
        if (!template) {
            let root = TreeTemplates.#generate(id);
            let count = TreeTemplates.#countNodes(root);
            template = new TreeTemplate(root, count);
            TreeTemplates.TEMPLATES[id] = template;
        }
        return template;
    }

    static #generate(id) {
        let random = new DeterministicRandom(id);
        let root = new TreeTemplateNode(0, 0, TreeTemplateNode.TYPE_TRUNK, Brushes.TREE_WOOD);
        root.children.push(new TreeTemplateNode(0, 1, TreeTemplateNode.TYPE_ROOT, Brushes.TREE_ROOT));

        let size = [20, 37, 35, 42][(id & 0b1100) >> 2];
        let firstSplit = ((id & 0b0010) !== 0) ? 1 : -1;
        let firstIncrement = ((id & 0b0001) !== 0) ? 1 : -1;

        let splits = [15, 19, 22, 25, 29, 32, 35];
        if (size < 25) {
            splits.unshift(12);  // small trees
        }
        let splitDirection = firstSplit;

        let incrementWidth = [12, 20, 28, 32];
        let incrementX = [1, -1, 2, -2, 3, -3].map(v => v * firstIncrement);
        let incrementNext = 0;

        let centerTrunkNodes = [root];

        for (let i = 1; i <= size; i++) {
            const remainingSize = size - i;

            // increment trunk size
            if (incrementWidth.includes(i)) {
                let nx = incrementX[incrementNext++];
                let node = new TreeTemplateNode(nx, 0, TreeTemplateNode.TYPE_TRUNK, Brushes.TREE_WOOD);
                node.children.push(new TreeTemplateNode(nx, 1, TreeTemplateNode.TYPE_ROOT, Brushes.TREE_ROOT));

                centerTrunkNodes[0].children.push(node);
                centerTrunkNodes.push(node);
            }

            // add split
            if (splits.includes(i)) {
                let branchLength = 12;
                if (remainingSize < 10) {
                    branchLength = 8;
                }
                if (remainingSize < 6) {
                    branchLength = 5;
                }

                let branchRoot = this.#generateBranch(branchLength, splitDirection, i, remainingSize, random);
                centerTrunkNodes[0].children.push(branchRoot);

                splitDirection = splitDirection * -1;
            }

            // add next trunk level
            for (let j = 0; j < centerTrunkNodes.length; j++) {
                let last = centerTrunkNodes[j];

                let node = (j !== 0 || remainingSize > 3)
                    ? new TreeTemplateNode(last.x, last.y - 1, TreeTemplateNode.TYPE_TRUNK, Brushes.TREE_WOOD)
                    : new TreeTemplateNode(last.x, last.y - 1, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_DARKER);

                last.children.push(node);
                centerTrunkNodes[j] = node;
            }

            // add trunk leaves
            if (i > 20) {
                let brush = (remainingSize > 3) ? Brushes.TREE_LEAF_DARKER : Brushes.TREE_LEAF_LIGHTER;

                let leafR = new TreeTemplateNode(1, -i, TreeTemplateNode.TYPE_LEAF, brush);
                centerTrunkNodes[0].children.push(leafR);
                let leafL = new TreeTemplateNode(-1, -i, TreeTemplateNode.TYPE_LEAF, brush);
                centerTrunkNodes[0].children.push(leafL);

                if (remainingSize > 1) {
                    leafR.children.push(new TreeTemplateNode(2, -i, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_LIGHTER));
                    leafL.children.push(new TreeTemplateNode(-2, -i, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_LIGHTER));
                }
            }
        }
        return root;
    }

    static #generateBranch(branchLength, splitDirection, i, remainingSize, random) {
        let shift = 0;
        let branchRoot = null;
        let branchLast = null;

        for (let j = 1; j <= branchLength; j++) {
            const remainingBranchSize = branchLength - j;

            if (j > 3 && random.next() < 0.2) {
                shift++;
            }
            let nx = splitDirection * j;
            let ny = -i - shift;

            let next = (remainingSize > 3 && remainingBranchSize > 1)
                ? new TreeTemplateNode(nx, ny, TreeTemplateNode.TYPE_TRUNK, Brushes.TREE_WOOD)
                : new TreeTemplateNode(nx, ny, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_LIGHTER);

            if (branchRoot === null) {
                branchRoot = next;
            }

            if (branchLast !== null) {
                branchLast.children.push(next);
            }
            branchLast = next;

            // generate branch leaves

            let leafAbove = new TreeTemplateNode(nx, ny - 1, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_LIGHTER);
            let leafBelow = new TreeTemplateNode(nx, ny + 1, TreeTemplateNode.TYPE_LEAF,
                (remainingBranchSize > 3) ? Brushes.TREE_LEAF_DARKER : Brushes.TREE_LEAF_LIGHTER);

            if (remainingBranchSize > 3) {
                leafAbove.children.push(new TreeTemplateNode(nx, ny - 2, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_LIGHTER));
                leafBelow.children.push(new TreeTemplateNode(nx, ny + 2, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_LIGHTER));
            }

            next.children.push(leafAbove);
            next.children.push(leafBelow);
        }
        return branchRoot;
    }

    static #countNodes(root) {
        let count = 0;

        let stack = [root];
        while (stack.length > 0) {
            let node = stack.pop();
            count++;
            for (let child of node.children) {
                stack.push(child);
            }
        }
        return count;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-10-01
 */
class TreeTemplate {

    /** @type TreeTemplateNode */
    root;

    /** @type number */
    nodes;

    constructor(root, nodes) {
        this.root = root;
        this.nodes = nodes;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-29
 */
class TreeTemplateNode {
    static TYPE_TRUNK = 1;
    static TYPE_LEAF = 2;
    static TYPE_ROOT = 3;


    /** @type number */
    x;

    /** @type number */
    y;

    /** @type number */
    type;

    /** @type Brush */
    brush;

    /** @type TreeTemplateNode[] */
    children = [];

    constructor(x, y, type, brush) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.brush = brush;
    }
}
