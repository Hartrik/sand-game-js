import {Assets} from "./Assets.js";
import {DomBuilder} from "./DomBuilder.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-03-08
 */
export class SandGameElementSizeComponent {

    static CLASS_SELECTED = 'selected-size';

    static SIZES = [
        { scale: 0.75,  image: Assets.IMG_ELEMENT_SIZE_1, description: 'Very small elements' },
        { scale: 0.5,   image: Assets.IMG_ELEMENT_SIZE_2, description: 'Small elements' },
        { scale: 0.375, image: Assets.IMG_ELEMENT_SIZE_3, description: 'Medium elements' },
        { scale: 0.25,  image: Assets.IMG_ELEMENT_SIZE_4, description: 'Big elements' },
    ];


    /** @type SandGameControls */
    #controls;

    /** @type function(scale) */
    #selectFunction;

    #initialScale;

    #nodes = [];

    #selected = null;
    #selectedScale = null;

    #dialogAccepted = false;

    /**
     *
     * @param sandGameControls {SandGameControls}
     * @param selectFunction
     * @param initialScale
     */
    constructor(sandGameControls, initialScale, selectFunction) {
        this.#controls = sandGameControls;
        this.#initialScale = initialScale;
        this.#selectFunction = selectFunction;
    }

    createNode() {
        for (let sizeDef of SandGameElementSizeComponent.SIZES) {
            let node = this.#createSizeCard(sizeDef.scale, sizeDef.image, sizeDef.description);

            // initial scale
            if (sizeDef.scale === this.#initialScale) {
                this.#mark(node, sizeDef.scale);
            }

            node.on('click', e => {
                this.#onSelect(node, sizeDef.scale);
            })

            this.#nodes.push(node);
        }

        this.#controls.addOnInitialized(() => {
            this.#onExternalScaleChange(this.#controls.getCurrentScale());
        });

        return DomBuilder.div({class: 'element-size-options'}, this.#nodes);
    }

    #onSelect(node, scale) {
        if (this.#selectedScale === scale) {
            return;  // already selected
        }

        if (this.#dialogAccepted) {
            this.#select(node, scale);
        } else {
            this.#showConfirmDialog(() => {
                this.#dialogAccepted = true;
                this.#select(node, scale);
            });
        }
    }

    #showConfirmDialog(onConfirm) {
        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent('Scale change');
        dialog.setBodyContent([
            DomBuilder.par(null, "Increasing the size of the elements will result in the top and right" +
                " parts of the canvas being clipped."),
            DomBuilder.par(null, "Reducing the size of the elements will result in an expansion of" +
                " the canvas in the upper and right parts."),
            DomBuilder.par(null, "Only the scale of the current scene will be changed.")
        ]);
        dialog.addSubmitButton('Confirm', onConfirm);
        dialog.addCloseButton('Close');
        dialog.show(this.#controls.getDialogAnchor());
    }

    #select(node, scale) {
        if (this.#selected) {
            this.#selected.removeClass(SandGameElementSizeComponent.CLASS_SELECTED);
        }
        this.#mark(node, scale);
        this.#selectFunction(scale);
    }

    #mark(node, scale) {
        node.addClass(SandGameElementSizeComponent.CLASS_SELECTED);
        this.#selected = node;
        this.#selectedScale = scale;
    }

    /**
     *
     * @param scale {number}
     * @param image {string}
     * @param description {string}
     */
    #createSizeCard(scale, image, description) {
        return DomBuilder.div({ class: 'card' }, [
            DomBuilder.element('img', { src: image, alt: description })
        ]);
    }

    #onExternalScaleChange(scale) {
        if (this.#selected) {
            if (this.#selectedScale === scale) {
                return;  // no change
            }
            // change
            this.#selected.removeClass(SandGameElementSizeComponent.CLASS_SELECTED);
        }

        for (let i = 0; i < SandGameElementSizeComponent.SIZES.length; i++) {
            const sizeDef = SandGameElementSizeComponent.SIZES[i];
            if (sizeDef.scale === scale) {
                this.#mark(this.#nodes[i], sizeDef.scale);
                return;
            }
        }

        // no match
        this.#selected = null;
        this.#selectedScale = null;
    }
}
