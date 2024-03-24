// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Splash from "./Splash";
import Objective from "./Objective";
import Analytics from "../Analytics";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-11
 */
export default class SandGameScenario {

    /** @type Splash[] */
    #splashes = [];

    /** @type function(Splash)[] */
    #onSplashAdded = [];

    /** @type Objective[] */
    #objectives = [];

    /** @type function(Objective)[] */
    #onObjectiveAdded = [];

    #statusCompleted = false;

    /** @type function()[] */
    #onStatusCompleted = [];

    constructor() {
        // empty
    }

    // splash

    /**
     *
     * @param config {SplashConfig}
     * @returns {Splash}
     */
    createSplash(config) {
        const splash = new Splash(config);
        this.#splashes.push(splash);
        for (let handler of this.#onSplashAdded) {
            handler(splash);
        }
        return splash;
    }

    getSplashes() {
        return [...this.#splashes];
    }

    /**
     *
     * @param handler {function(Splash)}
     */
    addOnSplashAdded(handler) {
        this.#onSplashAdded.push(handler);
    }

    // objectives

    /**
     *
     * @param config {ObjectiveConfig}
     * @returns {Objective}
     */
    createObjective(config) {
        const objective = new Objective(config);
        this.#objectives.push(objective);
        for (let handler of this.#onObjectiveAdded) {
            handler(objective);
        }
        return objective;
    }

    getObjectives() {
        return [...this.#objectives];
    }

    /**
     *
     * @param handler {function(Objective)}
     */
    addOnObjectiveAdded(handler) {
        this.#onObjectiveAdded.push(handler);
    }

    // status

    setCompleted() {
        if (!this.#statusCompleted) {
            this.#statusCompleted = true;
            Analytics.triggerFeatureUsed(Analytics.FEATURE_SCENARIO_COMPLETED);
            for (let handler of this.#onStatusCompleted) {
                handler();
            }
        }
    }

    addOnStatusCompleted(handler) {
        this.#onStatusCompleted.push(handler);
    }
}