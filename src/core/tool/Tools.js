import {RoundBrushTool} from "./RoundBrushTool";
import {RoundBrushToolForSolidBody} from "./RoundBrushToolForSolidBody";
import {PointBrushTool} from "./PointBrushTool";
import {Point2BrushTool} from "./Point2BrushTool";
import {MeteorTool} from "./MeteorTool";
import {InsertElementAreaTool} from "./InsertElementAreaTool";
import {InsertRandomSceneTool} from "./InsertRandomSceneTool";
import {ActionTool} from "./ActionTool";
import {MoveTool} from "./MoveTool";
import {TemplateSelectionFakeTool} from "./TemplateSelectionFakeTool";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-26
 */
export class Tools {

    static roundBrushTool(brush, size, info) {
        return new RoundBrushTool(info, brush, size);
    }

    static roundBrushToolForSolidBody(brush, size, info) {
        return new RoundBrushToolForSolidBody(info, brush, size);
    }

    static pointBrushTool(brush, info) {
        return new PointBrushTool(info, brush);
    }

    static point2BrushTool(brush1, brush2, info) {
        return new Point2BrushTool(info, brush1, brush2);
    }

    static meteorTool(info) {
        return new MeteorTool(info);
    }

    static insertScenesTool(scenes, handler, info) {
        if (scenes.length === 1) {
            const elementArea = InsertElementAreaTool.asElementArea(scenes[0]);
            return new InsertElementAreaTool(info, elementArea, handler);
        } else {
            return new InsertRandomSceneTool(info, scenes, handler);
        }
    }

    static actionTool(handler, info) {
        return new ActionTool(info, handler);
    }

    static moveTool(size, info) {
        return new MoveTool(info, size);
    }

    static templateSelectionTool(templateDefinitions, info) {
        return new TemplateSelectionFakeTool(info, templateDefinitions);
    }
}
