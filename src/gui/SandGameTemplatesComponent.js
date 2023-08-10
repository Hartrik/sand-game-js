import {DomBuilder} from "./DomBuilder.js";
import {SandGameControls} from "./SandGameControls.js";
import {Templates} from "../def/Templates.js";
import {ResourceIO} from "../core/ResourceIO.js";
import {Tool} from "../core/Tool.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-10
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

            let button = DomBuilder.button(name, { class: 'btn btn-light template-button', 'data-dismiss': 'modal'}, () => {
                if (loadedTool !== null) {

                    const toolManager = this.#controls.getToolManager();
                    const revert = toolManager.createRevertAction();

                    toolManager.setPrimaryTool(loadedTool);
                    toolManager.setSecondaryTool(Tool.actionTool(null, null, null, revert));

                } else {
                    // this should not happen
                }
            });
            button.css('background-image', `url(${ toolDefinition.icon.imageData })`);

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
