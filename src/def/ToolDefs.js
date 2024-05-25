// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Brushes from "../core/brush/Brushes";
import Tools from "../core/tool/Tools";
import BrushDefs from "./BrushDefs";
import TemplateDefs from "./TemplateDefs";
import EntityFactories from "../core/entity/EntityFactories";

import _ASSET_ICON_POWDERS from './assets/tools/powder.svg'
import _ASSET_ICON_SOLID from './assets/tools/solid.svg'
import _ASSET_ICON_EFFECTS from './assets/tools/fire.svg'
import _ASSET_ICON_FLUIDS from './assets/tools/droplet-fill.svg'

/**
 *
 * @author Patrik Harag
 * @version 2024-05-25
 */
export default class ToolDefs {

    static DEFAULT_SIZE = 6;

    static CATEGORY_NONE = undefined;
    static CATEGORY_POWDER = 'powders';
    static CATEGORY_FLUIDS = 'fluids';
    static CATEGORY_SOLIDS = 'solids';
    static CATEGORY_EFFECTS = 'effects';
    static CATEGORY_BIOLOGICAL = 'biological';

    static DEFAULT_CATEGORY_DEFINITIONS = {};
    static {
        ToolDefs.DEFAULT_CATEGORY_DEFINITIONS[ToolDefs.CATEGORY_POWDER] = {
            displayName: 'Powders',
            icon: {
                svg: _ASSET_ICON_POWDERS
            },
            badgeStyle: {
                color: 'black',
                backgroundColor: '#d9bc7a',
            }
        };
        ToolDefs.DEFAULT_CATEGORY_DEFINITIONS[ToolDefs.CATEGORY_FLUIDS] = {
            displayName: 'Fluids',
            icon: {
                svg: _ASSET_ICON_FLUIDS
            },
            badgeStyle: {
                color: 'black',
                backgroundColor: '#6aa6bd',
            }
        };
        ToolDefs.DEFAULT_CATEGORY_DEFINITIONS[ToolDefs.CATEGORY_SOLIDS] = {
            displayName: 'Solids',
            icon: {
                svg: _ASSET_ICON_SOLID
            },
            badgeStyle: {
                color: 'black',
                backgroundColor: '#adadad',
            }
        };
        ToolDefs.DEFAULT_CATEGORY_DEFINITIONS[ToolDefs.CATEGORY_EFFECTS] = {
            displayName: 'Effects',
            icon: {
                svg: _ASSET_ICON_EFFECTS
            },
            badgeStyle: {
                color: 'black',
                backgroundColor: '#ff945b',
            }
        };
    }


    static NONE = Tools.actionTool(() => {}, {
        codeName: 'none',
        displayName: 'None',
        category: ToolDefs.CATEGORY_NONE,
    });

    static ERASE = Tools.roundBrushTool(BrushDefs.AIR, ToolDefs.DEFAULT_SIZE, {
        codeName: 'erase',
        displayName: 'Erase',
        category: ToolDefs.CATEGORY_NONE,
        badgeStyle: {
            backgroundColor: '#e6e6e6',
            color: 'black'
        }
    });

    static MOVE = Tools.moveTool(13, 2048, {
        codeName: 'move',
        displayName: 'Move',
        category: ToolDefs.CATEGORY_NONE,
        badgeStyle: {
            backgroundColor: '#e6e6e6',
            color: 'black'
        }
    });

    static FLIP_VERTICALLY = Tools.globalActionTool(sg => sg.graphics().flipVertically(), {
        codeName: 'flip_vertically',
        displayName: 'Flip \u2195',
        category: ToolDefs.CATEGORY_NONE,
        badgeStyle: {
            backgroundColor: '#e6e6e6',
            color: 'black'
        }
    });

    static FLIP_HORIZONTALLY = Tools.globalActionTool(sg => sg.graphics().flipHorizontally(), {
        codeName: 'flip_horizontally',
        displayName: 'Flip \u2194',
        category: ToolDefs.CATEGORY_NONE,
        badgeStyle: {
            backgroundColor: '#e6e6e6',
            color: 'black'
        }
    });

    static SAND = Tools.roundBrushTool(BrushDefs.SAND, ToolDefs.DEFAULT_SIZE, {
        codeName: 'sand',
        displayName: 'Sand',
        category: ToolDefs.CATEGORY_POWDER,
        badgeStyle: {
            backgroundColor: '#b7a643',
        }
    });

    static SOIL = Tools.roundBrushTool(BrushDefs.SOIL, ToolDefs.DEFAULT_SIZE, {
        codeName: 'soil',
        displayName: 'Soil',
        category: ToolDefs.CATEGORY_POWDER,
        badgeStyle: {
            backgroundColor: '#8e6848',
        }
    });

    static GRAVEL = Tools.roundBrushTool(BrushDefs.GRAVEL, ToolDefs.DEFAULT_SIZE, {
        codeName: 'gravel',
        displayName: 'Gravel',
        category: ToolDefs.CATEGORY_POWDER,
        badgeStyle: {
            backgroundColor: '#656565',
        }
    });

    static COAL = Tools.roundBrushTool(BrushDefs.COAL, ToolDefs.DEFAULT_SIZE, {
        codeName: 'coal',
        displayName: 'Coal',
        category: ToolDefs.CATEGORY_POWDER,
        badgeStyle: {
            backgroundColor: '#343434',
        }
    });

    static THERMITE = Tools.roundBrushTool(BrushDefs.THERMITE, ToolDefs.DEFAULT_SIZE, {
        codeName: 'thermite',
        displayName: 'Thermite',
        category: ToolDefs.CATEGORY_POWDER,
        badgeStyle: {
            backgroundColor: '#914e47',
        }
    });

    static WALL = Tools.roundBrushTool(BrushDefs.WALL, ToolDefs.DEFAULT_SIZE, {
        codeName: 'wall',
        displayName: 'Wall',
        category: ToolDefs.CATEGORY_SOLIDS,
        badgeStyle: {
            backgroundColor: '#383838',
        }
    });

    static ROCK = Tools.roundBrushTool(BrushDefs.ROCK, ToolDefs.DEFAULT_SIZE, {
        codeName: 'rock',
        displayName: 'Rock',
        category: ToolDefs.CATEGORY_SOLIDS,
        badgeStyle: {
            backgroundColor: '#383838',
        }
    });

    static ROCK_TEMPLATES = Tools.templateSelectionTool([
        TemplateDefs.ROCK_SM,
        TemplateDefs.ROCK_MD,
        TemplateDefs.ROCK_LG
    ], {
        codeName: 'rock_templates',
        displayName: 'Rock',
        category: ToolDefs.CATEGORY_SOLIDS,
        badgeStyle: {
            backgroundColor: '#383838',
        }
    });

    static WOOD = Tools.roundBrushTool(BrushDefs.TREE_WOOD, ToolDefs.DEFAULT_SIZE, {
        codeName: 'wood',
        displayName: 'Wood',
        category: ToolDefs.CATEGORY_SOLIDS,
        badgeStyle: {
            backgroundColor: '#573005',
        }
    });

    static METAL = Tools.roundBrushToolForSolidBody(BrushDefs.METAL, ToolDefs.DEFAULT_SIZE, {
        codeName: 'metal',
        displayName: 'Metal',
        category: ToolDefs.CATEGORY_SOLIDS,
        badgeStyle: {
            backgroundColor: '#7c7c7c',
        }
    });

    static METAL_MOLTEN = Tools.roundBrushTool(BrushDefs.METAL_MOLTEN, ToolDefs.DEFAULT_SIZE, {
        codeName: 'metal_molten',
        displayName: 'M. Metal',
        category: ToolDefs.CATEGORY_FLUIDS,
        badgeStyle: {
            backgroundColor: '#e67d00',
        }
    });

    static WATER = Tools.roundBrushTool(BrushDefs.WATER, ToolDefs.DEFAULT_SIZE, {
        codeName: 'water',
        displayName: 'Water',
        category: ToolDefs.CATEGORY_FLUIDS,
        badgeStyle: {
            backgroundColor: '#0487ba',
        }
    });

    static OIL = Tools.roundBrushTool(BrushDefs.OIL, ToolDefs.DEFAULT_SIZE, {
        codeName: 'oil',
        displayName: 'Oil',
        category: ToolDefs.CATEGORY_FLUIDS,
        badgeStyle: {
            backgroundColor: 'rgb(36,26,1)',
        }
    });

    static FIRE = Tools.roundBrushTool(Brushes.temperatureOrBrush(50, BrushDefs.FIRE), ToolDefs.DEFAULT_SIZE, {
        codeName: 'fire',
        displayName: 'Fire',
        category: ToolDefs.CATEGORY_EFFECTS,
        badgeStyle: {
            backgroundColor: '#ff5900',
        }
    });

    static METEOR = Tools.meteorTool(BrushDefs.METEOR, BrushDefs.METEOR_FROM_LEFT, BrushDefs.METEOR_FROM_RIGHT, {
        codeName: 'meteor',
        displayName: 'Meteor',
        category: ToolDefs.CATEGORY_EFFECTS,
        badgeStyle: {
            backgroundColor: '#ff5900',
        }
    });

    static EFFECT_TEMP_MINUS = Tools.roundBrushTool(Brushes.concat(BrushDefs.EFFECT_TEMP_0, BrushDefs.EFFECT_EXTINGUISH),
            ToolDefs.DEFAULT_SIZE, {

        codeName: 'effect_temp_minus',
        displayName: '°C −',
        category: ToolDefs.CATEGORY_EFFECTS,
        badgeStyle: {
            backgroundColor: '#63cffa',
        }
    });

    static EFFECT_TEMP_PLUS = Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_200, ToolDefs.DEFAULT_SIZE, {
        codeName: 'effect_temp_plus',
        displayName: '°C +',
        category: ToolDefs.CATEGORY_EFFECTS,
        badgeStyle: {
            backgroundColor: '#fa9b4e',
        }
    });

    static EFFECT_TEMP_PLUS2 = Tools.roundBrushTool(BrushDefs.EFFECT_TEMP_255, ToolDefs.DEFAULT_SIZE, {
        codeName: 'effect_temp_plus2',
        displayName: '°C ⧺',
        category: ToolDefs.CATEGORY_EFFECTS,
        badgeStyle: {
            backgroundColor: '#fa9b4e',
        }
    });

    /** @type Tool[] */
    static DEFAULT_TOOLS = [
        this.ERASE,
        this.MOVE,
        this.SAND,
        this.SOIL,
        this.GRAVEL,
        this.COAL,
        this.THERMITE,
        this.WALL,
        this.ROCK_TEMPLATES,
        this.METAL,
        this.WATER,
        this.OIL,
        this.METAL_MOLTEN,
        this.FIRE,
        this.METEOR,
        this.EFFECT_TEMP_MINUS,
        this.EFFECT_TEMP_PLUS,
        this.EFFECT_TEMP_PLUS2
    ];

    static BIRD = Tools.insertEntityTool(EntityFactories.birdFactory, {
        codeName: 'bird',
        displayName: 'Bird',
        category: ToolDefs.CATEGORY_BIOLOGICAL,
    });

    static BUTTERFLY = Tools.insertEntityTool(EntityFactories.butterflyFactory, {
        codeName: 'butterfly',
        displayName: 'Butterfly',
        category: ToolDefs.CATEGORY_BIOLOGICAL,
    });

    static FISH = Tools.insertEntityTool(EntityFactories.fishFactory, {
        codeName: 'fish',
        displayName: 'Fish',
        category: ToolDefs.CATEGORY_BIOLOGICAL,
    });


    static _LIST = {};
    static {
        const tools = [
            ToolDefs.NONE,
            ToolDefs.FLIP_HORIZONTALLY,
            ToolDefs.FLIP_VERTICALLY,
            ...ToolDefs.DEFAULT_TOOLS,
            ToolDefs.ROCK,
            ToolDefs.BIRD,
            ToolDefs.BUTTERFLY,
            ToolDefs.FISH
        ];
        for (const tool of tools) {
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
