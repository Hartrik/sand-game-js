import { DomBuilder } from "./DomBuilder";
import { Action } from "./Action";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-05
 */
export class ComponentButton {

    static CLASS_PRIMARY = 'btn-primary';
    static CLASS_SECONDARY = 'btn-secondary';
    static CLASS_INFO = 'btn-info';
    static CLASS_SUCCESS = 'btn-success';
    static CLASS_WARNING = 'btn-warning';
    static CLASS_LIGHT = 'btn-light';

    static CLASS_OUTLINE_PRIMARY = 'btn-outline-primary';
    static CLASS_OUTLINE_SECONDARY = 'btn-outline-secondary';
    static CLASS_OUTLINE_INFO = 'btn-outline-info';
    static CLASS_OUTLINE_SUCCESS = 'btn-outline-success';
    static CLASS_OUTLINE_WARNING = 'btn-outline-warning';
    static CLASS_OUTLINE_LIGHT = 'btn-outline-light';


    #label;
    #action;
    #cssClass;

    /**
     *
     * @param label {string}
     * @param cssClass {string|null}
     * @param action {Action|function}
     */
    constructor(label, cssClass, action) {
        this.#label = label;
        this.#action = (typeof action === "function" ? Action.create(action) : action);
        this.#cssClass = (cssClass == null ? ComponentButton.CLASS_PRIMARY : cssClass);
    }

    createNode(controller) {
        return DomBuilder.button(this.#label, { class: 'btn ' + this.#cssClass }, e => {
            this.#action.performAction(controller);
        });
    }
}
