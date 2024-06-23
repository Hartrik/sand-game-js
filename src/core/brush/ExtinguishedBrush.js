// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Element from "../Element";
import ElementHead from "../ElementHead";
import AbstractEffectBrush from "./AbstractEffectBrush";

/**
 *
 * @author Patrik Harag
 * @version 2024-06-23
 */
export default class ExtinguishedBrush extends AbstractEffectBrush {

    constructor(innerBrush) {
        super(innerBrush);
    }

    apply(x, y, random, oldElement) {
        const element = this._retrieveElement(x, y, random, oldElement);
        if (element === null) {
            return null;
        }

        if (ElementHead.getFireSource(element.elementHead) === 1) {
            const newElementHead = ElementHead.setFireSource(element.elementHead, 0);
            return new Element(newElementHead, element.elementTail);
        } else {
            return null;
        }
    }
}