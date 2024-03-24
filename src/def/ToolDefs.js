// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Brushes from "../core/brush/Brushes";
import Tool from "../core/tool/Tool.js";
import Tools from "../core/tool/Tools";
import BrushDefs from "./BrushDefs";
import ToolInfo from "../core/tool/ToolInfo";
import TemplateDefs from "./TemplateDefs";

/**
 *
 * @author Patrik Harag
 * @version 2024-03-13
 */
export default class ToolDefs {

    static DEFAULT_SIZE = 6;

    static CATEGORY_BRUSH = 'brush';
    static CATEGORY_GLOBAL = 'global';
    static CATEGORY_TEMPLATE = 'template';
    static CATEGORY_SELECTION = 'selection';

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

    static FLIP_VERTICALLY = Tools.globalActionTool(sandGame => {
        if (sandGame !== null) {
            sandGame.graphics().flipVertically();
        }
    }, new ToolInfo({
        codeName: 'flip_vertically',
        displayName: 'Flip Vertically',
        category: ToolDefs.CATEGORY_GLOBAL,
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

    static COAL = Tools.roundBrushTool(BrushDefs.COAL, ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'coal',
        displayName: 'Coal',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#343434',
        }
    }));

    static THERMITE = Tools.roundBrushTool(BrushDefs.THERMITE, ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'thermite',
        displayName: 'Thermite',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#914e47',
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

    static ROCK_TEMPLATES = Tools.templateSelectionTool([
        TemplateDefs.ROCK_SM,
        TemplateDefs.ROCK_MD,
        TemplateDefs.ROCK_LG
    ], new ToolInfo({
        codeName: 'rock_templates',
        displayName: 'Rock',
        category: ToolDefs.CATEGORY_SELECTION,
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

    static METAL = Tools.roundBrushToolForSolidBody(BrushDefs.METAL, ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'metal',
        displayName: 'Metal',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#7c7c7c',
        }
    }));

    static METAL_MOLTEN = Tools.roundBrushTool(BrushDefs.METAL_MOLTEN, ToolDefs.DEFAULT_SIZE, new ToolInfo({
        codeName: 'metal_molten',
        displayName: 'M. Metal',
        category: ToolDefs.CATEGORY_BRUSH,
        badgeStyle: {
            backgroundColor: '#e67d00',
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
        this.COAL,
        this.THERMITE,
        this.WATER,
        this.ROCK_TEMPLATES,
        this.WALL,
        this.METAL,
        this.METAL_MOLTEN,
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
