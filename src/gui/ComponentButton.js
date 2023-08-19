import { DomBuilder } from "./DomBuilder";
import { Action } from "./Action";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ComponentButton {

    static CLASS_PRIMARY = 'btn-primary';
    static CLASS_SECONDARY = 'btn-secondary';
    static CLASS_INFO = 'btn-info';
    static CLASS_SUCCESS = 'btn-success';
    static CLASS_WARNING = 'btn-warning';
    static CLASS_LIGHT = 'btn-light';


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

    createNode(sandGameControls) {
        return DomBuilder.button(this.#label, { class: 'btn ' + this.#cssClass }, e => {
            this.#action.performAction(sandGameControls);
        });
    }
}
