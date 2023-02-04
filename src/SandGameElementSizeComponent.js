import {DomBuilder} from "./DomBuilder.js";

/**
 *
 * @author Patrik Harag
 * @version 2022-11-06
 */
export class SandGameElementSizeComponent {

    /** @type function(scale) */
    #selectFunction;

    #initialScale;
    #assetsContextPath;

    #selected = null;

    constructor(selectFunction, initialScale, assetsContextPath) {
        this.#selectFunction = selectFunction;
        this.#initialScale = initialScale;
        this.#assetsContextPath = assetsContextPath;
    }

    createNode() {
        let content = DomBuilder.div({class: 'element-size-options'}, []);
        for (let sizeDef of SandGameElementSizes.SIZES) {
            let node = this.#createSizeCard(sizeDef.scale, this.#assetsContextPath + '/' + sizeDef.image);

            if (sizeDef.scale === this.#initialScale) {
                this.#selected = node;
                node.addClass('selected-size');
            }

            node.on('click', e => {
                if (this.#selected) {
                    this.#selected.removeClass('selected-size');
                }
                node.addClass('selected-size');
                this.#selected = node;
                this.#selectFunction(sizeDef.scale);
            })
            content.append(node);
        }

        return content;
    }

    /**
     *
     * @param scale {number}
     * @param image {string}
     */
    #createSizeCard(scale, image) {
        return DomBuilder.div({class: 'card'}, [
            DomBuilder.element('img', {src: image})
        ]);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-11-04
 */
class SandGameElementSizes {
    static SIZES = [
        {
            scale: 0.75,
            image: 'element-size-1.png'
        },
        {
            scale: 0.5,
            image: 'element-size-2.png'
        },
        {
            scale: 0.375,
            image: 'element-size-3.png'
        },
        {
            scale: 0.25,
            image: 'element-size-4.png'
        },
    ];
}