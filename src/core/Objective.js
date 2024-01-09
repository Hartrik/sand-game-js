
/**
 *
 * @author Patrik Harag
 * @version 2024-01-07
 */
export class Objective {

    /** @type string */
    #name;
    /** @type string */
    #description;

    /** @type boolean */
    #completed = false;
    /** @type function(boolean)[] */
    #onCompletedChanged = [];

    /** @type boolean */
    #visible = true;
    /** @type function(boolean)[] */
    #onVisibleChanged = [];

    constructor(name, description) {
        this.#name = name;
        this.#description = description;
    }

    getName() {
        return this.#name;
    }

    getDescription() {
        return this.#description;
    }

    // status

    isCompleted() {
        return this.#completed;
    }

    setCompleted(completed) {
        this.#completed = completed;
        for (let handler of this.#onCompletedChanged) {
            handler(completed);
        }
    }

    addOnCompleted(handler) {
        this.#onCompletedChanged.push(handler);
    }

    // visibility

    isVisible() {
        return this.#visible;
    }

    setVisible(visible) {
        this.#visible = visible;
        for (let handler of this.#onVisibleChanged) {
            handler(visible);
        }
    }

    addOnVisibleChanged(handler) {
        this.#onVisibleChanged.push(handler);
    }
}
