import {Assets} from "./Assets.js";
import {DomBuilder} from "./DomBuilder.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-04
 */
export class SandGameElementSizeComponent {

    static SIZES = [
        { scale: 0.750, image: Assets.IMG_ELEMENT_SIZE_1 },
        { scale: 0.500, image: Assets.IMG_ELEMENT_SIZE_2 },
        { scale: 0.375, image: Assets.IMG_ELEMENT_SIZE_3 },
        { scale: 0.250, image: Assets.IMG_ELEMENT_SIZE_4 },
    ];


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
        for (let sizeDef of SandGameElementSizeComponent.SIZES) {
            let node = this.#createSizeCard(sizeDef.scale, sizeDef.image);

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
