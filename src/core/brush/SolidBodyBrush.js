import { AbstractEffectBrush } from "./AbstractEffectBrush";
import { Element } from "../Element";
import { ElementHead } from "../ElementHead";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-26
 */
export class SolidBodyBrush extends AbstractEffectBrush {

    #solidBodyId;

    constructor(solidBodyId, innerBrush) {
        super(innerBrush);
        this.#solidBodyId = solidBodyId;
    }

    apply(x, y, random, oldElement) {
        const element = this._retrieveElement(x, y, random, oldElement);

        let elementHead = element.elementHead;
        elementHead = ElementHead.setType(elementHead, ElementHead.type8Solid(ElementHead.TYPE_STATIC, this.#solidBodyId));
        return new Element(elementHead, element.elementTail);
    }
}