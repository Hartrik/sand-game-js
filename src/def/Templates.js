import _ASSET_ROCK_1 from './assets/rock-1.png'
import _ASSET_ROCK_2 from './assets/rock-2.png'
import _ASSET_ROCK_3 from './assets/rock-3.png'
import _ASSET_ROCK_4 from './assets/rock-4.png'
import _ASSET_ROCK_5 from './assets/rock-5.png'
import _ASSET_ROCK_6 from './assets/rock-6.png'

import _ASSET_ROCK_SM_1 from './assets/rock-sm-1.png'
import _ASSET_ROCK_SM_2 from './assets/rock-sm-2.png'
import _ASSET_ROCK_SM_3 from './assets/rock-sm-3.png'

import _ASSET_ROCK_LG_1 from './assets/rock-lg-1.png'
import _ASSET_ROCK_LG_2 from './assets/rock-lg-2.png'

import _ASSET_WOODEN_HOUSE from './assets/wooden-house.png'

/**
 *
 * @author Patrik Harag
 * @version 2023-07-23
 */
export class Templates {

    static TOOLS = [
        {
            name: "Rock SM",
            category: "template",
            type: "template",
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
                        randomFlipHorizontally: true
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
                        randomFlipHorizontally: true
                    },
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_3,
                        brush: "wall",
                        threshold: 50,
                        randomFlipHorizontally: true
                    },
                    {
                        type: "image-template",
                        imageData: _ASSET_ROCK_4,
                        brush: "wall",
                        threshold: 50,
                        randomFlipHorizontally: true
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
                        randomFlipHorizontally: true
                    }
                ]
            }
        },
        {
            name: "Rock LG",
            category: "template",
            type: "template",
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
                        threshold: 50
                    }
                ]
            }
        },
        {
            name: "Wooden house",
            category: "template",
            type: "template",
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
