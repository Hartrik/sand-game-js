import {ElementHead} from "./ElementHead.js";

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
export class GrassElement {
    static couldGrowUpHere(elementArea, x, y) {
        if (x < 0 || y - 1 < 0) {
            return false;
        }
        if (x >= elementArea.getWidth() || y + 1 >= elementArea.getHeight()) {
            return false;
        }
        let e1 = elementArea.getElementHead(x, y);
        if (ElementHead.getWeight(e1) !== ElementHead.WEIGHT_AIR) {
            return false;
        }
        let e2 = elementArea.getElementHead(x, y + 1);
        if (ElementHead.getBehaviour(e2) !== ElementHead.BEHAVIOUR_SOIL) {
            return false;
        }
        let e3 = elementArea.getElementHead(x, y - 1);
        if (ElementHead.getWeight(e3) !== ElementHead.WEIGHT_AIR) {
            return false;
        }
        return true;
    }
}