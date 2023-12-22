import { DomBuilder } from "./DomBuilder";
import { Action } from "./Action";
import { ActionDialogChangeCanvasSize } from "./ActionDialogChangeCanvasSize";
import { ComponentViewElementSizeSelection } from "./ComponentViewElementSizeSelection";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ActionDialogChangeElementSize extends Action {

    performAction(controller) {
        let elementSizeComponent = new ComponentViewElementSizeSelection();

        let dialog = DomBuilder.bootstrapDialogBuilder();
        dialog.setHeaderContent('Adjust Scale');
        dialog.setBodyContent(DomBuilder.div({ class: 'sand-game-component' }, [
            elementSizeComponent.createNode(controller)
        ]));
        dialog.addSubmitButton("Set size manually", () => {
            new ActionDialogChangeCanvasSize().performAction(controller);
        });
        dialog.addCloseButton('Close');
        dialog.show(controller.getDialogAnchor());
    }
}
