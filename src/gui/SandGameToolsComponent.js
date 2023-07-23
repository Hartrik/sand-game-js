import {DomBuilder} from "./DomBuilder.js";
import {SandGameControls} from "./SandGameControls.js";
import {Tools} from "../def/Tools.js";
import {SandGameTemplatesComponent} from "./SandGameTemplatesComponent.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-07-23
 */
export class SandGameToolsComponent {

    /** @type SandGameControls */
    #controls;

    /** @type Tool[] */
    #tools;

    /** @type boolean */
    #templates;

    /**
     * @param sandGameControls {SandGameControls}
     * @param tools {Tool[]}
     * @param templates {boolean}
     */
    constructor(sandGameControls, tools, templates) {
        this.#controls = sandGameControls;
        this.#tools = tools;
        this.#templates = templates;
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

        if (this.#templates) {
            let button = DomBuilder.button('Template', { class: 'badge badge-secondary template'}, () => {
                let templatesComponent = new SandGameTemplatesComponent(this.#controls);

                let dialog = new DomBuilder.BootstrapDialog();
                dialog.setHeaderContent('Templates');
                dialog.setBodyContent(DomBuilder.div({ class: 'sand-game-component' }, [
                    DomBuilder.par(null, "Select a template and close the dialog"),
                    templatesComponent.createNode()
                ]));
                dialog.addCloseButton('Close');
                dialog.show(this.#controls.getDialogAnchor());
            });
            buttons.push(button);
        }

        return DomBuilder.div({ class: 'sand-game-tools' }, buttons);
    }
}
