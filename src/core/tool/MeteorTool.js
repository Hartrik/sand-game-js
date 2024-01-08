import {BrushDefs} from "../../def/BrushDefs";
import {DeterministicRandom} from "../DeterministicRandom";
import {Tool} from "./Tool";

// TODO: direct BrushDefs access >> Defaults
/**
 *
 * @author Patrik Harag
 * @version 2023-12-25
 */
export class MeteorTool extends Tool {

    constructor(info) {
        super(info);
    }

    applyPoint(x, y, graphics, aldModifier) {
        const diffSlope4 = Math.trunc(y / 4);
        if (x < diffSlope4 + 10) {
            // right only
            graphics.draw(x + diffSlope4, 0, BrushDefs.METEOR_FROM_RIGHT);
            return;
        }
        if (x > graphics.getWidth() - diffSlope4 - 10) {
            // left only
            graphics.draw(x - diffSlope4, 0, BrushDefs.METEOR_FROM_LEFT);
            return;
        }

        if (x < graphics.getWidth() / 2) {
            if (DeterministicRandom.DEFAULT.next() < 0.8) {
                graphics.draw(x + diffSlope4, 0, BrushDefs.METEOR_FROM_RIGHT);
            } else {
                graphics.draw(x, 0, BrushDefs.METEOR);
            }
        } else {
            if (DeterministicRandom.DEFAULT.next() < 0.8) {
                graphics.draw(x - diffSlope4, 0, BrushDefs.METEOR_FROM_LEFT);
            } else {
                graphics.draw(x, 0, BrushDefs.METEOR);
            }
        }
    }
}