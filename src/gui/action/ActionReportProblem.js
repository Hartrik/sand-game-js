import { Action } from "./Action";
import { DomBuilder } from "../DomBuilder";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-04
 */
export class ActionReportProblem extends Action {

    /** @type function(type:string,message:string,controller:Controller) */
    #handler;

    constructor(handler) {
        super();
        this.#handler = handler;
    }

    performAction(controller) {
        let formBuilder = DomBuilder.bootstrapSimpleFormBuilder();
        formBuilder.addTextArea('Message', 'message');

        let dialog = DomBuilder.bootstrapDialogBuilder();
        dialog.setHeaderContent('Report a problem');
        dialog.setBodyContent(formBuilder.createNode());
        dialog.addSubmitButton('Submit', () => {
            let data = formBuilder.getData();
            let message = data['message'];
            if (message.trim() !== '') {
                this.#handler("user", message, controller);
            }
        });
        dialog.addCloseButton('Close');
        dialog.show(controller.getDialogAnchor());
    }
}
