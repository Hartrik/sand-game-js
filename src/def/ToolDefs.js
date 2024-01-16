import { Brushes } from "../core/brush/Brushes";
import { Tool } from "../core/tool/Tool.js";
import { Tools } from "../core/tool/Tools";
import { BrushDefs } from "./BrushDefs";
import { ToolInfo } from "../core/tool/ToolInfo";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-16
 */
export class ToolDefs {

    static DEFAULT_SIZE = 6;

    static CATEGORY_BRUSH = 'brush';
    static CATEGORY_TEMPLATE = 'template';

    static #info(codeName, displayName, category = ToolDefs.CATEGORY_BRUSH) {
        return new ToolInfo(category, codeName, displayName);
    }

    static NONE = Tools.actionTool(ToolDefs.#info('none', 'None'), () => {});

    static ERASE = Tools.roundBrushTool(ToolDefs.#info('erase', 'Erase'), BrushDefs.AIR, ToolDefs.DEFAULT_SIZE);
    static MOVE = Tools.moveTool(ToolDefs.#info('move', 'Move'), 13);
    static SAND = Tools.roundBrushTool(ToolDefs.#info('sand', 'Sand'), BrushDefs.SAND, ToolDefs.DEFAULT_SIZE);
    static SOIL = Tools.roundBrushTool(ToolDefs.#info('soil', 'Soil'), BrushDefs.SOIL, ToolDefs.DEFAULT_SIZE);
    static GRAVEL = Tools.roundBrushTool(ToolDefs.#info('gravel', 'Gravel'), BrushDefs.GRAVEL,ToolDefs.DEFAULT_SIZE);
    static WALL = Tools.roundBrushTool(ToolDefs.#info('wall', 'Wall'), BrushDefs.WALL, ToolDefs.DEFAULT_SIZE);
    static ROCK = Tools.roundBrushTool(ToolDefs.#info('rock', 'Rock'), BrushDefs.ROCK, ToolDefs.DEFAULT_SIZE);
    static WATER = Tools.roundBrushTool(ToolDefs.#info('water', 'Water'), BrushDefs.WATER, ToolDefs.DEFAULT_SIZE);
    static FIRE = Tools.roundBrushTool(ToolDefs.#info('fire', 'Fire'), Brushes.temperatureOrBrush(50, BrushDefs.FIRE), ToolDefs.DEFAULT_SIZE);
    static METEOR = Tools.meteorTool(ToolDefs.#info('meteor', 'Meteor'));

    /** @type Tool[] */
    static DEFAULT_TOOLS = [
        this.ERASE,
        this.MOVE,
        this.SAND,
        this.SOIL,
        this.GRAVEL,
        this.ROCK,
        this.WATER,
        this.FIRE,
        this.METEOR,
    ];

    /** @type Tool[] */
    static TEST_TOOLS = [
        Tools.pointBrushTool(ToolDefs.#info( 'grass', 'Grass'), BrushDefs.GRASS),
        Tools.pointBrushTool(ToolDefs.#info( 'tree', 'Tree'), BrushDefs.TREE),
        Tools.point2BrushTool(ToolDefs.#info( 'fish', 'Fish'), BrushDefs.FISH_HEAD, BrushDefs.FISH_BODY),
        Tools.roundBrushTool(ToolDefs.#info( 'effect_burnt', 'Burnt'), BrushDefs.EFFECT_BURNT, ToolDefs.DEFAULT_SIZE),
        Tools.roundBrushTool(ToolDefs.#info( 'effect_noise_sm', 'Noise SM'), BrushDefs.EFFECT_NOISE_SM, ToolDefs.DEFAULT_SIZE),
        Tools.roundBrushTool(ToolDefs.#info( 'effect_noise_md', 'Noise MD'), BrushDefs.EFFECT_NOISE_MD, ToolDefs.DEFAULT_SIZE),
        Tools.roundBrushTool(ToolDefs.#info( 'effect_noise_lg', 'Noise LG'), BrushDefs.EFFECT_NOISE_LG, ToolDefs.DEFAULT_SIZE),
        Tools.roundBrushTool(ToolDefs.#info( 'effect_temp_0', 'Temp 0'), BrushDefs.EFFECT_TEMP_0, ToolDefs.DEFAULT_SIZE),
        Tools.roundBrushTool(ToolDefs.#info( 'effect_temp_127', 'Temp 127'), BrushDefs.EFFECT_TEMP_127, ToolDefs.DEFAULT_SIZE),
        Tools.roundBrushTool(ToolDefs.#info( 'effect_temp_200', 'Temp 200'), BrushDefs.EFFECT_TEMP_200, ToolDefs.DEFAULT_SIZE),
        Tools.roundBrushTool(ToolDefs.#info( 'effect_temp_255', 'Temp 255'), BrushDefs.EFFECT_TEMP_255, ToolDefs.DEFAULT_SIZE),
        Tools.roundBrushTool(ToolDefs.#info( 'ash', 'Ash'), BrushDefs.ASH, ToolDefs.DEFAULT_SIZE),
        Tools.roundBrushTool(ToolDefs.#info( 'metal', 'Metal'), BrushDefs.METAL, ToolDefs.DEFAULT_SIZE),
    ];

    static _LIST = {};
    static {
        for (const tool of [ToolDefs.NONE, ...ToolDefs.DEFAULT_TOOLS, ...ToolDefs.TEST_TOOLS]) {
            ToolDefs._LIST[tool.getInfo().getCodeName()] = tool;
        }
    }

    static byCodeName(codeName) {
        const tool = ToolDefs._LIST[codeName];
        if (tool !== undefined) {
            return tool;
        }
        return null;
    }
}
