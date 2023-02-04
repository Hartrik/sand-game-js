import {DeterministicRandom} from "./DeterministicRandom.js";
import {Brushes} from "./Brushes.js";

/**
 *
 * @author Patrik Harag
 * @version 2022-11-04
 */
export class TreeTemplates {
    static #random = new DeterministicRandom(0);

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

                let branchRoot = this.#generateBranch(branchLength, splitDirection, i, remainingSize);
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

    static #generateBranch(branchLength, splitDirection, i, remainingSize) {
        let shift = 0;
        let branchRoot = null;
        let branchLast = null;

        for (let j = 1; j <= branchLength; j++) {
            const remainingBranchSize = branchLength - j;

            if (j > 3 && TreeTemplates.#random.next() < 0.2) {
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
export class TreeTemplate {

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
export class TreeTemplateNode {
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