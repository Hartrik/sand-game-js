// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import AbstractEffectBrush from "./AbstractEffectBrush";
import Element from "../Element";
import ElementHead from "../ElementHead";

/**
 *
 * @author Patrik Harag
 * @version 2024-03-23
 */
export default class SolidBodyBrush extends AbstractEffectBrush {

    #solidBodyId;
    #extendedNeighbourhood;

    constructor(solidBodyId, extendedNeighbourhood, innerBrush) {
        super(innerBrush);
        this.#solidBodyId = solidBodyId;
        this.#extendedNeighbourhood = extendedNeighbourhood;
    }

    apply(x, y, random, oldElement) {
        const element = this._retrieveElement(x, y, random, oldElement);

        let elementHead = element.elementHead;
        const newType = ElementHead.type8Solid(ElementHead.TYPE_STATIC, this.#solidBodyId, this.#extendedNeighbourhood);
        elementHead = ElementHead.setType(elementHead, newType);
        return new Element(elementHead, element.elementTail);
    }
}