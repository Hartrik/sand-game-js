import {Component} from "./Component";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-04
 */
export class ComponentSimple extends Component {

    #node;

    /**
     *
     * @param node {HTMLElement}
     */
    constructor(node) {
        super();
        this.#node = node;
    }

    createNode(controller) {
        return this.#node;
    }
}
