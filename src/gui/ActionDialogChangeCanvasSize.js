import { DomBuilder } from "./DomBuilder";
import { Action } from "./Action";
import { Analytics } from "../Analytics";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ActionDialogChangeCanvasSize extends Action {

    performAction(controller) {
        let formBuilder = DomBuilder.bootstrapSimpleFormBuilder();
        formBuilder.addInput('Width', 'width', '' + controller.getCurrentWidthPoints());
        formBuilder.addInput('Height', 'height', '' + controller.getCurrentHeightPoints());
        formBuilder.addInput('Scale', 'scale', '' + controller.getCurrentScale());

        let dialog = DomBuilder.bootstrapDialogBuilder();
        dialog.setHeaderContent('Change canvas size manually');
        dialog.setBodyContent(formBuilder.createNode());
        dialog.addSubmitButton('Submit', () => {
            let data = formBuilder.getData();
            let w = Number.parseInt(data['width']);
            let h = Number.parseInt(data['height']);
            let s = Number.parseFloat(data['scale']);
            controller.changeCanvasSize(w, h, s);
            Analytics.triggerFeatureUsed(Analytics.FEATURE_CANVAS_SIZE_CHANGE);
        });
        dialog.addCloseButton('Close');
        dialog.show(controller.getDialogAnchor());
    }
}
