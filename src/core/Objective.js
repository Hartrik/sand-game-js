
/**
 * @typedef {object} ObjectiveConfig
 * @property {string} name
 * @property {string} description
 * @property {boolean} visible
 * @property {boolean} active
 */

/**
 *
 * @author Patrik Harag
 * @version 2024-01-11
 */
export class Objective {

    /** @type ObjectiveConfig */
    #config;

    /** @type boolean */
    #visible;
    /** @type function(boolean)[] */
    #onVisibleChanged = [];

    /** @type boolean */
    #active;
    /** @type function(boolean)[] */
    #onActiveChanged = [];

    /** @type boolean */
    #completed = false;
    /** @type function(boolean)[] */
    #onCompletedChanged = [];

    /**
     *
     * @param config {ObjectiveConfig}
     */
    constructor(config) {
        this.#config = config;
        this.#visible = config.visible === true;
        this.#active = config.active === true;
    }

    getConfig() {
        return this.#config;  // TODO: immutable
    }

    // visible

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

    // active

    isActive() {
        return this.#active;
    }

    setActive(active) {
        this.#active = active;
        for (let handler of this.#onActiveChanged) {
            handler(active);
        }
    }

    addOnActiveChanged(handler) {
        this.#onActiveChanged.push(handler);
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
}
