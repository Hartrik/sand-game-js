// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import _ASSET_ROCK_ICON from './assets/templates/rock-icon.png'
import _ASSET_ROCK_1 from './assets/templates/rock-1.png'
import _ASSET_ROCK_2 from './assets/templates/rock-2.png'
import _ASSET_ROCK_3 from './assets/templates/rock-3.png'
import _ASSET_ROCK_4 from './assets/templates/rock-4.png'
import _ASSET_ROCK_5 from './assets/templates/rock-5.png'
import _ASSET_ROCK_6 from './assets/templates/rock-6.png'

import _ASSET_ROCK_SM_ICON from './assets/templates/rock-sm-icon.png'
import _ASSET_ROCK_SM_1 from './assets/templates/rock-sm-1.png'
import _ASSET_ROCK_SM_2 from './assets/templates/rock-sm-2.png'
import _ASSET_ROCK_SM_3 from './assets/templates/rock-sm-3.png'

import _ASSET_ROCK_LG_ICON from './assets/templates/rock-lg-icon.png'
import _ASSET_ROCK_LG_1 from './assets/templates/rock-lg-1.png'
import _ASSET_ROCK_LG_2 from './assets/templates/rock-lg-2.png'

import _ASSET_WOODEN_HOUSE_ICON from './assets/templates/wooden-house-icon.png'
import _ASSET_WOODEN_HOUSE from './assets/templates/wooden-house.png'

import _ASSET_SAND_CASTLE from './assets/templates/sand-castle.png'

/**
 *
 * @author Patrik Harag
 * @version 2024-05-25
 */
export default class TemplateDefs {

    static ROCK_SM = {
        info: {
            displayName: "Small Rock",
            category: "template",
            // icon: {
            //     imageData: _ASSET_ROCK_SM_ICON
            // }
        },
        action: {
            type: "random-template",
            actions: [
                {
                    type: "image-template",
                    imageData: _ASSET_ROCK_SM_1,
                    brush: "rock",
                    threshold: 50,
                    randomFlipHorizontally: true
                },
                {
                    type: "image-template",
                    imageData: _ASSET_ROCK_SM_2,
                    brush: "rock",
                    threshold: 50,
                    randomFlipHorizontally: true,
                    randomFlipVertically: true
                },
                {
                    type: "image-template",
                    imageData: _ASSET_ROCK_SM_3,
                    brush: "rock",
                    threshold: 50,
                    randomFlipHorizontally: true
                }
            ]
        }
    };

    static ROCK_MD =  {
        info: {
            displayName: "Medium Rock",
            category: "template",
            // icon: {
            //     imageData: _ASSET_ROCK_ICON
            // }
        },
        action: {
            type: "random-template",
            actions: [
                {
                    type: "image-template",
                    imageData: _ASSET_ROCK_1,
                    brush: "rock",
                    threshold: 50,
                    randomFlipHorizontally: true
                },
                {
                    type: "image-template",
                    imageData: _ASSET_ROCK_2,
                    brush: "rock",
                    threshold: 50,
                    randomFlipHorizontally: true,
                    randomFlipVertically: true
                },
                {
                    type: "image-template",
                    imageData: _ASSET_ROCK_3,
                    brush: "rock",
                    threshold: 50,
                    randomFlipHorizontally: true,
                    randomFlipVertically: true
                },
                {
                    type: "image-template",
                    imageData: _ASSET_ROCK_4,
                    brush: "rock",
                    threshold: 50,
                    randomFlipHorizontally: true,
                    randomFlipVertically: true
                },
                {
                    type: "image-template",
                    imageData: _ASSET_ROCK_5,
                    brush: "rock",
                    threshold: 50,
                    randomFlipHorizontally: true
                },
                {
                    type: "image-template",
                    imageData: _ASSET_ROCK_6,
                    brush: "rock",
                    threshold: 50,
                    randomFlipHorizontally: true,
                    randomFlipVertically: true
                }
            ]
        }
    };

    static ROCK_LG = {
        info: {
            displayName: "Large Rock",
            category: "template",
            // icon: {
            //     imageData: _ASSET_ROCK_LG_ICON
            // }
        },
        action: {
            type: "random-template",
            actions: [
                {
                    type: "image-template",
                    imageData: _ASSET_ROCK_LG_1,
                    brush: "rock",
                    threshold: 50
                },
                {
                    type: "image-template",
                    imageData: _ASSET_ROCK_LG_2,
                    brush: "rock",
                    threshold: 50,
                    randomFlipHorizontally: true
                }
            ]
        }
    };

    static CABIN = {
        info: {
            displayName: "Cabin",
            category: "template",
            // icon: {
            //     imageData: _ASSET_WOODEN_HOUSE_ICON
            // }
        },
        action: {
            type: "image-template",
            imageData: _ASSET_WOODEN_HOUSE,
            brush: "wood",
            threshold: 50,
            randomFlipHorizontally: true
        }
    };

    static SAND_CASTLE = {
        info: {
            displayName: "Sand Castle",
            category: "template"
        },
        action: {
            type: "image-template",
            imageData: _ASSET_SAND_CASTLE,
            brush: "sand",
            threshold: 1
        }
    };
}
