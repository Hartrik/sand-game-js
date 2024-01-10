import {ElementHead} from "../core/ElementHead";

/**
 * @callback ElementPredicate
 * @param {number} elementHead
 * @param {number} elementTail
 * @returns {boolean}
 */

/**
 *
 * @author Patrik Harag
 * @version 2024-01-10
 */
export class PredicateDefs {

    static and(predicateA, predicateB) {
        return function (elementHead, elementTail) {
            return predicateA(elementHead, elementTail) && predicateB(elementHead, elementTail);
        };
    }

    static or(predicateA, predicateB) {
        return function (elementHead, elementTail) {
            return predicateA(elementHead, elementTail) || predicateB(elementHead, elementTail);
        };
    }

    static not(predicate) {
        return function (elementHead, elementTail) {
            return !predicate(elementHead, elementTail);
        };
    }

    /** @type {ElementPredicate} */
    static IS_WATER = function (elementHead, elementTail) {
        return ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_WATER
            && ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_FLUID
    };

    /** @type {ElementPredicate} */
    static IS_POWDER = function (elementHead, elementTail) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        return typeClass === ElementHead.TYPE_POWDER
            || typeClass === ElementHead.TYPE_POWDER_FLOATING
            || typeClass === ElementHead.TYPE_POWDER_WET;
    };

    /** @type {ElementPredicate} */
    static IS_STATIC = function (elementHead, elementTail) {
        return ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_STATIC;
    };

    /** @type {ElementPredicate} */
    static IS_FISH = function (elementHead, elementTail) {
        return ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_FISH;
    };

    /** @type {ElementPredicate} */
    static IS_FISH_PART = function (elementHead, elementTail) {
        const behaviour = ElementHead.getBehaviour(elementHead);
        return behaviour === ElementHead.BEHAVIOUR_FISH || behaviour === ElementHead.BEHAVIOUR_FISH_BODY;
    };
}