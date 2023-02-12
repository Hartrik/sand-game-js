import {DomBuilder} from "./DomBuilder.js";
import {SandGameControls} from "./SandGameControls.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-12
 */
export class SandGameBrushComponent {

    /** @type SandGameControls */
    #controls;

    /** @type BrushDeclaration[] */
    #brushDeclarations;


    /**
     * @param sandGameControls {SandGameControls}
     * @param brushDeclarations {BrushDeclaration[]}
     */
    constructor(sandGameControls, brushDeclarations) {
        this.#controls = sandGameControls;
        this.#brushDeclarations = brushDeclarations;
    }

    createNode() {
        let buttons = [];

        for (let d of this.#brushDeclarations) {
            let button = DomBuilder.link(d.name, { class: 'badge badge-secondary ' + d.cssName }, () => {
                // unselect last
                for (let b of buttons) {
                    b.removeClass('selected');
                }

                // select
                button.addClass('selected');

                this.#controls.setBrush(d.brush);
            });
            // initial select
            if (d.brush === this.#controls.getBrush()) {
                button.addClass('selected');
            }

            buttons.push(button);
        }

        return DomBuilder.div({ class: 'sand-game-brushes' }, buttons);
    }
}
