import {DomBuilder} from "./DomBuilder.js";
import {SandGameControls} from "./SandGameControls.js";
import {Tools} from "../def/Tools.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-29
 */
export class SandGameBrushComponent {

    /** @type SandGameControls */
    #controls;

    /** @type Tool[] */
    #tools;


    /**
     * @param sandGameControls {SandGameControls}
     * @param tools {Tool[]}
     */
    constructor(sandGameControls, tools) {
        this.#controls = sandGameControls;
        this.#tools = tools;
    }

    createNode() {
        let buttons = [];

        for (let tool of this.#tools) {
            let cssName = tool.getCodeName();
            let displayName = tool.getDisplayName();
            let button = DomBuilder.button(displayName, { class: 'badge badge-secondary ' + cssName }, () => {
                // unselect last
                for (let b of buttons) {
                    b.removeClass('selected');
                }

                // select
                button.addClass('selected');

                this.#controls.setPrimaryTool(tool);
                this.#controls.setSecondaryTool(Tools.byCodeName('air'));
            });
            // initial select
            if (tool === this.#controls.getPrimaryTool()) {
                button.addClass('selected');
            }

            buttons.push(button);
        }

        return DomBuilder.div({ class: 'sand-game-brushes' }, buttons);
    }
}
