import { DomBuilder } from "./DomBuilder";
import { Component } from "./Component";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-04
 */
export class ComponentContainer extends Component {

    #cssClass;
    #components;

    /**
     *
     * @param cssClass {string|null}
     * @param components {Component[]}
     */
    constructor(cssClass, components) {
        super();
        this.#cssClass = cssClass;
        this.#components = components;
    }

    createNode(controller) {
        const content = DomBuilder.div({ class: this.#cssClass }, []);
        for (let component of this.#components) {
            if (component !== null) {
                content.append(component.createNode(controller));
            }
        }
        return content;
    }
}
