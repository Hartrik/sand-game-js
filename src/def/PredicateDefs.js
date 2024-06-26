// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ElementHead from "../core/ElementHead";

/**
 *
 * @author Patrik Harag
 * @version 2024-04-27
 */
export default class PredicateDefs {

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

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static TRUE = function (elementHead, elementTail) {
        return true;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_AIR = function (elementHead, elementTail) {
        return ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_AIR;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_EFFECT = function (elementHead, elementTail) {
        return ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_EFFECT;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_GAS = function (elementHead, elementTail) {
        return ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_GAS;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_FLUID = function (elementHead, elementTail) {
        return ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_FLUID;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_WATER = function (elementHead, elementTail) {
        // TODO
        return ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_LIQUID
            && ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_FLUID;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_POWDER = function (elementHead, elementTail) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        return typeClass === ElementHead.TYPE_POWDER
            || typeClass === ElementHead.TYPE_POWDER_FLOATING
            || typeClass === ElementHead.TYPE_POWDER_WET;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_SAND = function (elementHead, elementTail) {
        if (PredicateDefs.IS_POWDER(elementHead, elementTail)) {
            return ElementHead.getBehaviour(elementHead) === 0
                && ElementHead.getTypeModifierPowderMomentum(elementHead) === 6;
        }
        return false;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_SOIL = function (elementHead, elementTail) {
        if (PredicateDefs.IS_POWDER(elementHead, elementTail)) {
            const behaviour = ElementHead.getBehaviour(elementHead);
            return behaviour === ElementHead.BEHAVIOUR_SOIL;
        }
        return false;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_GRAVEL = function (elementHead, elementTail) {
        if (PredicateDefs.IS_POWDER(elementHead, elementTail)) {
            return ElementHead.getBehaviour(elementHead) === 0
                && ElementHead.getTypeModifierPowderMomentum(elementHead) === 3;
        }
        return false;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_STATIC = function (elementHead, elementTail) {
        return ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_STATIC;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_SOLID_BODY = function (elementHead, elementTail) {
        return ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_STATIC
            && ElementHead.getTypeModifierSolidBodyId(elementHead) > 0;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_ENTITY = function (elementHead, elementTail) {
        return ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_ENTITY;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_BIOMASS = function (elementHead, elementTail) {
        const behaviour = ElementHead.getBehaviour(elementHead);
        return behaviour === ElementHead.BEHAVIOUR_GRASS
            || behaviour === ElementHead.BEHAVIOUR_TREE
            || behaviour === ElementHead.BEHAVIOUR_TREE_LEAF
            || behaviour === ElementHead.BEHAVIOUR_TREE_TRUNK
            || behaviour === ElementHead.BEHAVIOUR_TREE_ROOT
            || behaviour === ElementHead.BEHAVIOUR_ENTITY;
    };

    /** @type {function(elementHead:number, elementTail:number):boolean} */
    static IS_TREE_PART = function (elementHead, elementTail) {
        const behaviour = ElementHead.getBehaviour(elementHead);
        return behaviour === ElementHead.BEHAVIOUR_TREE
            || behaviour === ElementHead.BEHAVIOUR_TREE_LEAF
            || behaviour === ElementHead.BEHAVIOUR_TREE_TRUNK
            || behaviour === ElementHead.BEHAVIOUR_TREE_ROOT;
    };
}