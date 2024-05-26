// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ElementHead from "../ElementHead";

/**
 *
 * @author Patrik Harag
 * @version 2024-05-26
 */
export default class EntityUtils {

    static isElementFallingHeavy(elementHead) {
        if (elementHead === null) {
            return false;
        }
        const typeClass = ElementHead.getTypeClass(elementHead);
        if (typeClass === ElementHead.TYPE_POWDER || typeClass === ElementHead.TYPE_POWDER_WET) {
            return true;
        }
        if (typeClass === ElementHead.TYPE_STATIC) {
            if (ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_ENTITY) {
                return false;
            }
            if (ElementHead.getTypeModifierSolidBodyId(elementHead) > 0) {
                return true;
            }
        }
        return false;
    }

    static isElementLight(elementHead) {
        if (elementHead === null) {
            return false;
        }
        const typeClass = ElementHead.getTypeClass(elementHead);
        return typeClass <= ElementHead.TYPE_GAS;

    }

    static isElementWater(elementHead) {
        if (elementHead === null) {
            return false;
        }
        const typeClass = ElementHead.getTypeClass(elementHead);
        return typeClass === ElementHead.TYPE_FLUID
            && ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_LIQUID
            && ElementHead.getSpecial(elementHead) === ElementHead.SPECIAL_LIQUID_WATER;
    }

    static isElementEntity(elementHead) {
        if (elementHead === null) {
            return false;
        }
        const behaviour = ElementHead.getBehaviour(elementHead);
        return behaviour === ElementHead.BEHAVIOUR_ENTITY
    }
}