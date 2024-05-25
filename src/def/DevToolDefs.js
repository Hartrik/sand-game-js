// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

// Warning: dev tools only

const Tools = window.SandGameJS.Tools;
const ToolDefs = window.SandGameJS.ToolDefs;
const BrushDefs = window.SandGameJS.BrushDefs;

/**
 *
 * @author Patrik Harag
 * @version 2024-05-25
 */
export default class DevToolDefs {

    static DEFAULT_SIZE = 6;

    static CATEGORY_NONE = undefined;
    static CATEGORY_POWDER = 'powders';
    static CATEGORY_FLUIDS = 'fluids';
    static CATEGORY_SOLIDS = 'solids';
    static CATEGORY_EFFECTS = 'effects';
    static CATEGORY_BIOLOGICAL = 'biological';

    /** @type Tool[] */
    static TEST_TOOLS = [
        Tools.pointBrushTool(BrushDefs.GRASS, {
            codeName: 'grass',
            displayName: 'Grass',
            category: DevToolDefs.CATEGORY_BIOLOGICAL,
        }),
        Tools.pointBrushTool(BrushDefs.TREE, {
            codeName: 'tree',
            displayName: 'Tree',
            category: DevToolDefs.CATEGORY_BIOLOGICAL,
        }),
        ToolDefs.BIRD,
        ToolDefs.BUTTERFLY,
        ToolDefs.FISH,
        Tools.actionTool((x, y, graphics) => {
            graphics.entities().assignWaypoint(x, y);
        }, {
            codeName: 'entity_waypoint',
            displayName: 'Waypoint',
            category: DevToolDefs.CATEGORY_BIOLOGICAL,
        }),
        Tools.roundBrushTool(BrushDefs.EFFECT_BURNT, DevToolDefs.DEFAULT_SIZE, {
            codeName: 'effect_burnt',
            displayName: 'Burnt',
            category: DevToolDefs.CATEGORY_EFFECTS,
        }),
        Tools.roundBrushTool(BrushDefs.EFFECT_NOISE_SM, DevToolDefs.DEFAULT_SIZE, {
            codeName: 'effect_noise_sm',
            displayName: 'Noise SM',
            category: DevToolDefs.CATEGORY_EFFECTS,
        }),
        Tools.roundBrushTool(BrushDefs.EFFECT_NOISE_MD, DevToolDefs.DEFAULT_SIZE, {
            codeName: 'effect_noise_md',
            displayName: 'Noise MD',
            category: DevToolDefs.CATEGORY_EFFECTS,
        }),
        Tools.roundBrushTool(BrushDefs.EFFECT_NOISE_LG, DevToolDefs.DEFAULT_SIZE, {
            codeName: 'effect_noise_lg',
            displayName: 'Noise LG',
            category: DevToolDefs.CATEGORY_EFFECTS,
        }),
        Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_0, DevToolDefs.DEFAULT_SIZE, {
            codeName: 'effect_temp_0',
            displayName: 'Temp 0',
            category: DevToolDefs.CATEGORY_EFFECTS,
        }),
        Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_127, DevToolDefs.DEFAULT_SIZE, {
            codeName: 'effect_temp_127',
            displayName: 'Temp 127',
            category: DevToolDefs.CATEGORY_EFFECTS,
        }),
        Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_200, DevToolDefs.DEFAULT_SIZE, {
            codeName: 'effect_temp_200',
            displayName: 'Temp 200',
            category: DevToolDefs.CATEGORY_EFFECTS,
        }),
        Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_255, DevToolDefs.DEFAULT_SIZE, {
            codeName: 'effect_temp_255',
            displayName: 'Temp 255',
            category: DevToolDefs.CATEGORY_EFFECTS,
        }),
        Tools.roundBrushTool(BrushDefs.ASH, DevToolDefs.DEFAULT_SIZE, {
            codeName: 'ash',
            displayName: 'Ash',
            category: DevToolDefs.CATEGORY_POWDER,
        })
    ];

    static _LIST = {};
    static {
        for (const tool of DevToolDefs.TEST_TOOLS) {
            DevToolDefs._LIST[tool.getInfo().getCodeName()] = tool;
        }
    }

    static byCodeName(codeName) {
        const tool = DevToolDefs._LIST[codeName];
        if (tool !== undefined) {
            return tool;
        }
        return null;
    }
}
