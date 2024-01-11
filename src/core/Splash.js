
/**
 * @typedef {object} SplashConfig
 * @property {HTMLElement|string} content
 * @property {CSSStyleDeclaration} style
 * @property {SplashButton[]} buttons
 * @property {boolean} visible
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
    #visible;
    /** @type function(boolean)[] */
    #onVisibleChanged = [];

    /**
     *
     * @param config {SplashConfig}
     */
    constructor(config) {
        this.#config = config;
        this.#visible = config.visible === true;
    }

    getConfig() {
        return this.#config;  // TODO: immutable
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
