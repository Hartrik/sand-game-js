// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import DomBuilder from "../DomBuilder";
import Action from "./Action";
import ComponentViewTemplateSelection from "../component/ComponentViewTemplateSelection";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-08
 */
export default class ActionDialogTemplateSelection extends Action {

    #templateDefinitions;
    #additionalInfo;

    constructor(templateDefinitions, additionalInfo = null) {
        super();
        this.#templateDefinitions = templateDefinitions;
        this.#additionalInfo = additionalInfo;
    }

    performAction(controller) {
        let templatesComponent = new ComponentViewTemplateSelection(this.#templateDefinitions);

        let dialog = DomBuilder.bootstrapDialogBuilder();
        dialog.setHeaderContent('Templates');
        dialog.setBodyContent(DomBuilder.div({ class: 'sand-game-component' }, [
            DomBuilder.par(null, "Select a template"),
            templatesComponent.createNode(controller),
            this.#additionalInfo
        ]));
        dialog.addCloseButton('Close');
        dialog.show(controller.getDialogAnchor());
    }
}
