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

/**
 *
 * @author Patrik Harag
 * @version 2023-08-10
 */
export class Templates {

    static TOOLS = [
        {
            name: "Rock SM",
            category: "template",
            type: "template",
            icon: {
                imageData: _ASSET_ROCK_SM_ICON,
            },
            action: {
                type: "random",
                actions: [
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_SM_1,
                        brush: "wall",
                        threshold: 50,
                        randomFlipHorizontally: true
                    },
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_SM_2,
                        brush: "wall",
                        threshold: 50,
                        randomFlipHorizontally: true,
                        randomFlipVertically: true
                    },
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_SM_3,
                        brush: "wall",
                        threshold: 50,
                        randomFlipHorizontally: true
                    }
                ]
            }
        },
        {
            name: "Rock",
            category: "template",
            type: "template",
            icon: {
                imageData: _ASSET_ROCK_ICON,
            },
            action: {
                type: "random",
                actions: [
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_1,
                        brush: "wall",
                        threshold: 50,
                        randomFlipHorizontally: true
                    },
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_2,
                        brush: "wall",
                        threshold: 50,
                        randomFlipHorizontally: true,
                        randomFlipVertically: true
                    },
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_3,
                        brush: "wall",
                        threshold: 50,
                        randomFlipHorizontally: true,
                        randomFlipVertically: true
                    },
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_4,
                        brush: "wall",
                        threshold: 50,
                        randomFlipHorizontally: true,
                        randomFlipVertically: true
                    },
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_5,
                        brush: "wall",
                        threshold: 50,
                        randomFlipHorizontally: true
                    },
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_6,
                        brush: "wall",
                        threshold: 50,
                        randomFlipHorizontally: true,
                        randomFlipVertically: true
                    }
                ]
            }
        },
        {
            name: "Rock LG",
            category: "template",
            type: "template",
            icon: {
                imageData: _ASSET_ROCK_LG_ICON,
            },
            action: {
                type: "random",
                actions: [
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_LG_1,
                        brush: "wall",
                        threshold: 50
                    },
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_LG_2,
                        brush: "wall",
                        threshold: 50,
                        randomFlipHorizontally: true
                    }
                ]
            }
        },
        {
            name: "Cabin",
            category: "template",
            type: "template",
            icon: {
                imageData: _ASSET_WOODEN_HOUSE_ICON,
            },
            action: {
                type: "image-template",
                imageData: _ASSET_WOODEN_HOUSE,
                brush: "wood",
                threshold: 50,
                randomFlipHorizontally: true
            }
        }
    ]

}
