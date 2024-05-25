// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Tools from "../core/tool/Tools";
import BrushDefs from "./BrushDefs";
import ToolInfo from "../core/tool/ToolInfo";
import EntityFactories from "../core/entity/EntityFactories";

/**
 *
 * @author Patrik Harag
 * @version 2024-05-25
 */
export default class ToolDevDefs {

    static DEFAULT_SIZE = 6;

    static CATEGORY_NONE = undefined;
    static CATEGORY_POWDER = 'powders';
    static CATEGORY_FLUIDS = 'fluids';
    static CATEGORY_SOLIDS = 'solids';
    static CATEGORY_EFFECTS = 'effects';
    static CATEGORY_BIOLOGICAL = 'biological';

    static BIRD = Tools.insertEntityTool(EntityFactories.birdFactory, new ToolInfo({
        codeName: 'bird',
        displayName: 'Bird',
        category: ToolDevDefs.CATEGORY_BIOLOGICAL,
    }));

    static BUTTERFLY = Tools.insertEntityTool(EntityFactories.butterflyFactory, new ToolInfo({
        codeName: 'butterfly',
        displayName: 'Butterfly',
        category: ToolDevDefs.CATEGORY_BIOLOGICAL,
    }));

    static FISH = Tools.insertEntityTool(EntityFactories.fishFactory, new ToolInfo({
        codeName: 'fish',
        displayName: 'Fish',
        category: ToolDevDefs.CATEGORY_BIOLOGICAL,
    }));

    /** @type Tool[] */
    static TEST_TOOLS = [
        Tools.pointBrushTool(BrushDefs.GRASS, new ToolInfo({
            codeName: 'grass',
            displayName: 'Grass',
            category: ToolDevDefs.CATEGORY_BIOLOGICAL,
        })),
        Tools.pointBrushTool(BrushDefs.TREE, new ToolInfo({
            codeName: 'tree',
            displayName: 'Tree',
            category: ToolDevDefs.CATEGORY_BIOLOGICAL,
        })),
        ToolDevDefs.BIRD,
        ToolDevDefs.BUTTERFLY,
        ToolDevDefs.FISH,
        Tools.actionTool((x, y, graphics) => {
            graphics.entities().assignWaypoint(x, y);
        }, new ToolInfo({
            codeName: 'entity_waypoint',
            displayName: 'Waypoint',
            category: ToolDevDefs.CATEGORY_BIOLOGICAL,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_BURNT, ToolDevDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_burnt',
            displayName: 'Burnt',
            category: ToolDevDefs.CATEGORY_EFFECTS,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_NOISE_SM, ToolDevDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_noise_sm',
            displayName: 'Noise SM',
            category: ToolDevDefs.CATEGORY_EFFECTS,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_NOISE_MD, ToolDevDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_noise_md',
            displayName: 'Noise MD',
            category: ToolDevDefs.CATEGORY_EFFECTS,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_NOISE_LG, ToolDevDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_noise_lg',
            displayName: 'Noise LG',
            category: ToolDevDefs.CATEGORY_EFFECTS,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_0, ToolDevDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_temp_0',
            displayName: 'Temp 0',
            category: ToolDevDefs.CATEGORY_EFFECTS,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_127, ToolDevDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_temp_127',
            displayName: 'Temp 127',
            category: ToolDevDefs.CATEGORY_EFFECTS,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_200, ToolDevDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_temp_200',
            displayName: 'Temp 200',
            category: ToolDevDefs.CATEGORY_EFFECTS,
        })),
        Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_255, ToolDevDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'effect_temp_255',
            displayName: 'Temp 255',
            category: ToolDevDefs.CATEGORY_EFFECTS,
        })),
        Tools.roundBrushTool(BrushDefs.ASH, ToolDevDefs.DEFAULT_SIZE, new ToolInfo({
            codeName: 'ash',
            displayName: 'Ash',
            category: ToolDevDefs.CATEGORY_POWDER,
        }))
    ];

    static _LIST = {};
    static {
        for (const tool of ToolDevDefs.TEST_TOOLS) {
            ToolDevDefs._LIST[tool.getInfo().getCodeName()] = tool;
        }
    }

    static byCodeName(codeName) {
        const tool = ToolDevDefs._LIST[codeName];
        if (tool !== undefined) {
            return tool;
        }
        return null;
    }
}
