
/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class Action {

    /**
     *
     * @param controller {Controller}
     * @returns void
     */
    performAction(controller) {
        throw 'Not implemented';
    }

    /**
     *
     * @param func {function(controller:Controller):void}
     * @returns {ActionAnonymous}
     */
    static create(func) {
        return new ActionAnonymous(func);
    }

    /**
     *
     * @param def {boolean}
     * @param func {function(controller:Controller,v:boolean):void}
     * @returns {ActionAnonymous}
     */
    static createToggle(def, func) {
        let state = def;
        return new ActionAnonymous(function (c) {
            state = !state;
            func(c, state);
        });
    }
}

class ActionAnonymous extends Action {
    #func;

    constructor(func) {
        super();
        this.#func = func;
    }

    performAction(controller) {
        this.#func(controller);
    }
}
