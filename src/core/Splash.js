
/**
 * @typedef {object} SplashConfig
 * @property {HTMLElement|string} content
 * @property {CSSStyleDeclaration} style
 * @property {SplashButton[]} buttons
 */
/**
 * @typedef {object} SplashButton
 * @property {string} title
 * @property {string} class
 * @property {boolean} focus
 * @property {function(Splash):void} action
 */

/**
 *
 * @author Patrik Harag
 * @version 2024-01-09
 */
export class Splash {

    /** @type SplashConfig */
    #config;

    /** @type boolean */
    #visible = true;
    /** @type function(boolean)[] */
    #onVisibleChanged = [];

    constructor(config, visible) {
        this.#config = config;
        this.#visible = visible;
    }

    getConfig() {
        return this.#config;
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
