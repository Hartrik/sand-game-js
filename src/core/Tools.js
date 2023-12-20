import {RectangleBrushTool} from "./tool/RectangleBrushTool";
import {PointBrushTool} from "./tool/PointBrushTool";
import {Point2BrushTool} from "./tool/Point2BrushTool";
import {MeteorTool} from "./tool/MeteorTool";
import {InsertSceneTool} from "./tool/InsertSceneTool";
import {InsertRandomSceneTool} from "./tool/InsertRandomSceneTool";
import {ActionTool} from "./tool/ActionTool";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-20
 */
export class Tools {

    static rectangleBrushTool(category, codeName, displayName, brush, size) {
        return new RectangleBrushTool(category, codeName, displayName, brush, size);
    }

    static pointBrushTool(category, codeName, displayName, brush) {
        return new PointBrushTool(category, codeName, displayName, brush);
    }

    static point2BrushTool(category, codeName, displayName, brush1, brush2) {
        return new Point2BrushTool(category, codeName, displayName, brush1, brush2);
    }

    static meteorTool(category, codeName, displayName) {
        return new MeteorTool(category, codeName, displayName);
    }

    static insertElementAreaTool(category, codeName, displayName, scenes, handler) {
        if (scenes.length === 1) {
            return new InsertSceneTool(category, codeName, displayName, scenes[0], handler);
        } else {
            return new InsertRandomSceneTool(category, codeName, displayName, scenes, handler);
        }
    }

    static actionTool(category, codeName, displayName, handler) {
        return new ActionTool(category, codeName, displayName, handler);
    }
}
