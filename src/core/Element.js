// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
export default class Element {
    elementHead;
    elementTail;

    constructor(elementHead = 0, elementTail = 0) {
        this.elementHead = elementHead;
        this.elementTail = elementTail;
    }
}