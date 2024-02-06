import { Brushes } from "../core/brush/Brushes";
import { Tool } from "../core/tool/Tool.js";
import { Tools } from "../core/tool/Tools";
import { BrushDefs } from "./BrushDefs";
import { ToolInfo } from "../core/tool/ToolInfo";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-06
 */
export class ToolDefs {

    static DEFAULT_SIZE = 6;

    static CATEGORY_BRUSH = 'brush';
    static CATEGORY_TEMPLATE = 'template';

    static NONE = Tools.actionTool(() => {}, new ToolInfo({
        codeName: 'none',
        displayName: 'None',
        category: ToolDefs.CATEGORY_BRUSH,
    }));

    static ERASE = Tools.roundBrushTool(BrushDefs.AIR, ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'erase',
        displayName: 'Erase',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#e6e6e6',
            color: 'black'
        }
    }));

    static MOVE = Tools.moveTool(13, new ToolInfo({
        codeName: 'move',
        displayName: 'Move',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#e6e6e6',
            color: 'black'
        }
    }));

    static SAND = Tools.roundBrushTool(BrushDefs.SAND, ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'sand',
        displayName: 'Sand',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#b7a643',
        }
    }));

    static SOIL = Tools.roundBrushTool(BrushDefs.SOIL, ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'soil',
        displayName: 'Soil',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#8e6848',
        }
    }));

    static GRAVEL = Tools.roundBrushTool(BrushDefs.GRAVEL, ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'gravel',
        displayName: 'Gravel',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#656565',
        }
    }));

    static WALL = Tools.roundBrushTool(BrushDefs.WALL, ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'wall',
        displayName: 'Wall',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#383838',
        }
    }));

    static ROCK = Tools.roundBrushTool(BrushDefs.ROCK, ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'rock',
        displayName: 'Rock',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#383838',
        }
    }));

    static WOOD = Tools.roundBrushTool(BrushDefs.TREE_WOOD, ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'wood',
        displayName: 'Wood',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#573005',
        }
    }));

    static WATER = Tools.roundBrushTool(BrushDefs.WATER, ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'water',
        displayName: 'Water',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#0487ba',
        }
    }));

    static FIRE = Tools.roundBrushTool(Brushes.temperatureOrBrush(50, BrushDefs.FIRE), ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'fire',
        displayName: 'Fire',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#ff5900',
        }
    }));

    static METEOR = Tools.meteorTool(new ToolInfo({
        codeName: 'meteor',
        displayName: 'Meteor',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#ff5900',
        }
    }));

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
        Tools.pointBrushTool(BrushDefs.GRASS, new ToolInfo({
            codeName: 'grass',
            displayName: 'Grass',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.pointBrushTool(BrushDefs.TREE, new ToolInfo({
            codeName: 'tree',
            displayName: 'Tree',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.point2BrushTool(BrushDefs.FISH_HEAD, BrushDefs.FISH_BODY, new ToolInfo({
            codeName: 'fish',
            displayName: 'Fish',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_BURNT, ToolDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_burnt',
            displayName: 'Burnt',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_NOISE_SM, ToolDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_noise_sm',
            displayName: 'Noise SM',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_NOISE_MD, ToolDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_noise_md',
            displayName: 'Noise MD',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_NOISE_LG, ToolDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_noise_lg',
            displayName: 'Noise LG',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_0, ToolDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_temp_0',
            displayName: 'Temp 0',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_127, ToolDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_temp_127',
            displayName: 'Temp 127',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_200, ToolDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_temp_200',
            displayName: 'Temp 200',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_255, ToolDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_temp_255',
            displayName: 'Temp 255',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.roundBrushTool(BrushDefs.ASH, ToolDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'ash',
            displayName: 'Ash',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.roundBrushTool(BrushDefs.METAL, ToolDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'metal',
            displayName: 'Metal',
            category: ToolDefs.CATEGORY_BRUSH,
        })),
        Tools.roundBrushTool(BrushDefs.METAL_MOLTEN, ToolDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'metal_molten',
            displayName: 'Molten Metal',
            category: ToolDefs.CATEGORY_BRUSH,
        }))
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
