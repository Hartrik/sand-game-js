import {DomBuilder} from "./DomBuilder.js";
import {SandGameControls} from "./SandGameControls.js";
import {Templates} from "../def/Templates.js";
import {ResourceIO} from "../core/ResourceIO.js";
import {Tool} from "../core/Tool.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-07-23
 */
export class SandGameTemplatesComponent {

    /** @type SandGameControls */
    #controls;

    /**
     * @param sandGameControls {SandGameControls}
     */
    constructor(sandGameControls) {
        this.#controls = sandGameControls;
    }

    createNode() {
        let buttons = [];

        for (const toolDefinition of Templates.TOOLS) {
            const name = toolDefinition.name;
            let loadedTool = null;

            let button = DomBuilder.button(name, { class: 'btn btn-primary'}, () => {
                if (loadedTool !== null) {

                    const oldPrimary = this.#controls.getPrimaryTool();
                    const oldSecondary = this.#controls.getSecondaryTool();
                    this.#controls.setPrimaryTool(loadedTool);
                    this.#controls.setSecondaryTool(Tool.actionTool(null, null, null, () => {
                        this.#controls.setPrimaryTool(oldPrimary);
                        this.#controls.setSecondaryTool(oldSecondary);
                    }));

                } else {
                    // this should not happen
                }
            });
            buttons.push(button);

            ResourceIO.parseToolDefinition(toolDefinition).then(tool => {
                loadedTool = tool;
            }).catch(e => {
                console.warn('Template loading failed: ' + e);
            });
        }

        return DomBuilder.div({ class: 'sand-game-templates' }, buttons);
    }
}
