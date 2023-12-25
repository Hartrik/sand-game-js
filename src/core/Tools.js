import {RoundBrushTool} from "./tool/RoundBrushTool";
import {PointBrushTool} from "./tool/PointBrushTool";
import {Point2BrushTool} from "./tool/Point2BrushTool";
import {MeteorTool} from "./tool/MeteorTool";
import {InsertSceneTool} from "./tool/InsertSceneTool";
import {InsertRandomSceneTool} from "./tool/InsertRandomSceneTool";
import {ActionTool} from "./tool/ActionTool";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-25
 */
export class Tools {

    static roundBrushTool(info, brush, size) {
        return new RoundBrushTool(info, brush, size);
    }

    static pointBrushTool(info, brush) {
        return new PointBrushTool(info, brush);
    }

    static point2BrushTool(info, brush1, brush2) {
        return new Point2BrushTool(info, brush1, brush2);
    }

    static meteorTool(info) {
        return new MeteorTool(info);
    }

    static insertElementAreaTool(info, scenes, handler) {
        if (scenes.length === 1) {
            return new InsertSceneTool(info, scenes[0], handler);
        } else {
            return new InsertRandomSceneTool(info, scenes, handler);
        }
    }

    static actionTool(info, handler) {
        return new ActionTool(info, handler);
    }
}
