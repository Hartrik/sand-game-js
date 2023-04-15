import { Tool } from "./Tool.js";
import { Brushes } from "./Brushes";
import { Brush } from "./Brush";

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-04-15
 */
export class Tools {

    static DEFAULT_SIZE = 5;

    static CATEGORY_BRUSH = 'brush';

    /** @type Tool[] */
    static DEFAULT_TOOLS = [
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'sand', 'Sand', Brushes.SAND, Tools.DEFAULT_SIZE),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'soil', 'Soil', Brushes.SOIL, Tools.DEFAULT_SIZE),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'gravel', 'Gravel', Brushes.STONE,Tools.DEFAULT_SIZE),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'wall', 'Rock', Brushes.ROCK, Tools.DEFAULT_SIZE),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'water', 'Water', Brushes.WATER, Tools.DEFAULT_SIZE),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'fire', 'Fire', Brush.gentle(Brushes.FIRE), Tools.DEFAULT_SIZE),
        Tool.pointBrushTool(Tools.CATEGORY_BRUSH, 'meteor', 'Meteor', Brushes.METEOR),
        Tool.rectangleBrushTool(Tools.CATEGORY_BRUSH, 'air', 'Erase', Brushes.AIR, Tools.DEFAULT_SIZE),
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
