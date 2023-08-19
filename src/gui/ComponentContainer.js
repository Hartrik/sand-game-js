import { DomBuilder } from "./DomBuilder";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ComponentContainer {

    #cssClass;
    #components;

    /**
     *
     * @param cssClass {string}
     * @param components {Component[]}
     */
    constructor(cssClass, components) {
        this.#cssClass = cssClass;
        this.#components = components;
    }

    createNode(sandGameControls) {
        const content = DomBuilder.div({ class: this.#cssClass }, []);
        for (let component of this.#components) {
            content.append(component.createNode(sandGameControls));
        }
        return content;
    }
}
