import { Tool } from "../core/Tool.js";
import { Brushes } from "../core/Brushes";
import { Brush } from "../core/Brush";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-20
 */
export class Tools {

    static DEFAULT_SIZE = 5;

    static CATEGORY_BRUSH = 'brush';
    static CATEGORY_TEMPLATE = 'template';

    /** @type Tool[] */
    static DEFAULT_TOOLS = [
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'air', 'Erase', Brushes.AIR, Tools.DEFAULT_SIZE),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'sand', 'Sand', Brushes.SAND, Tools.DEFAULT_SIZE),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'soil', 'Soil', Brushes.SOIL, Tools.DEFAULT_SIZE),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'gravel', 'Gravel', Brushes.GRAVEL,Tools.DEFAULT_SIZE),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'wall', 'Rock', Brushes.ROCK, Tools.DEFAULT_SIZE),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'water', 'Water', Brushes.WATER, Tools.DEFAULT_SIZE),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'fire', 'Fire', Brush.gentle(Brushes.FIRE), Tools.DEFAULT_SIZE),
        Tool.meteorTool(Tools.CATEGORY_BRUSH, 'meteor', 'Meteor'),
    ];

    /** @type Tool[] */
    static TEST_TOOLS = [
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'effect_burnt', 'Burnt', Brushes.EFFECT_BURNT, Tools.DEFAULT_SIZE),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'ash', 'Ash', Brushes.ASH, Tools.DEFAULT_SIZE),
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
