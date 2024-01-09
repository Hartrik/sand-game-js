import {Splash} from "./Splash";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-09
 */
export class SandGameScenario {

    /** @type Splash[] */
    #splashes = [];

    /** @type function(Splash)[] */
    #onSplashAdded = [];

    constructor() {
        // empty
    }

    createObjective() {
        // TODO
    }

    /**
     *
     * @param config {SplashConfig}
     * @param visible {boolean}
     * @returns {Splash}
     */
    createSplash(config, visible = true) {
        const splash = new Splash(config, visible);
        this.#splashes.push(splash);
        for (let handler of this.#onSplashAdded) {
            handler();
        }
    }

    getSplashes() {
        return [...this.#splashes];
    }

    addOnSplashAdded(handler) {
        this.#onSplashAdded.push(handler);
    }
}