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

    performAction(sandGameControls) {
        let elementSizeComponent = new ComponentViewElementSizeSelection();

        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent('Adjust Scale');
        dialog.setBodyContent(DomBuilder.div({ class: 'sand-game-component' }, [
            elementSizeComponent.createNode(sandGameControls)
        ]));
        dialog.addSubmitButton("Set size manually", () => {
            new ActionDialogChangeCanvasSize().performAction(sandGameControls);
        });
        dialog.addCloseButton('Close');
        dialog.show(sandGameControls.getDialogAnchor());
    }
}
