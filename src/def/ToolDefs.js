import { Tool } from "../core/Tool.js";
import { Tools } from "../core/Tools";
import { BrushDefs } from "./BrushDefs";
import { Brush } from "../core/Brush";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-14
 */
export class ToolDefs {

    static DEFAULT_SIZE = 5;

    static CATEGORY_BRUSH = 'brush';
    static CATEGORY_TEMPLATE = 'template';

    /** @type Tool[] */
    static DEFAULT_TOOLS = [
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'air', 'Erase', BrushDefs.AIR, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'sand', 'Sand', BrushDefs.SAND, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'soil', 'Soil', BrushDefs.SOIL, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'gravel', 'Gravel', BrushDefs.GRAVEL,ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'wall', 'Rock', BrushDefs.ROCK, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'water', 'Water', BrushDefs.WATER, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'fire', 'Fire', Brush.temperatureOrBrush(50, BrushDefs.FIRE), ToolDefs.DEFAULT_SIZE),
        Tools.meteorTool(ToolDefs.CATEGORY_BRUSH, 'meteor', 'Meteor'),
    ];

    /** @type Tool[] */
    static TEST_TOOLS = [
        Tools.pointBrushTool(ToolDefs.CATEGORY_BRUSH, 'grass', 'Grass', BrushDefs.GRASS),
        Tools.pointBrushTool(ToolDefs.CATEGORY_BRUSH, 'tree', 'Tree', BrushDefs.TREE),
        Tools.point2BrushTool(ToolDefs.CATEGORY_BRUSH, 'fish', 'Fish', BrushDefs.FISH_HEAD, BrushDefs.FISH_BODY),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'effect_burnt', 'Burnt', BrushDefs.EFFECT_BURNT, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'effect_noise_sm', 'Noise SM', BrushDefs.EFFECT_NOISE_SM, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'effect_noise_md', 'Noise MD', BrushDefs.EFFECT_NOISE_MD, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'effect_noise_lg', 'Noise LG', BrushDefs.EFFECT_NOISE_LG, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'effect_temp_0', 'Temp 0', BrushDefs.EFFECT_TEMP_0, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'effect_temp_127', 'Temp 127', BrushDefs.EFFECT_TEMP_127, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'effect_temp_200', 'Temp 200', BrushDefs.EFFECT_TEMP_200, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'effect_temp_255', 'Temp 255', BrushDefs.EFFECT_TEMP_255, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'ash', 'Ash', BrushDefs.ASH, ToolDefs.DEFAULT_SIZE),
        Tools.rectangleBrushTool(ToolDefs.CATEGORY_BRUSH, 'metal', 'Metal', BrushDefs.METAL, ToolDefs.DEFAULT_SIZE),
    ];

    static byCodeName(codeName) {
        for (let tool of this.DEFAULT_TOOLS) {
            if (tool.getCodeName() === codeName) {
                return tool;
            }
        }
        return null;
    }
}
