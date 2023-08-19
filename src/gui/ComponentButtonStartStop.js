import { Action } from "./Action";
import { ComponentButton } from "./ComponentButton";
import { Analytics } from "../Analytics";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ComponentButtonStartStop extends ComponentButton {

    constructor(cssClass) {
        super('', cssClass, Action.create(controller => {
            controller.switchStartStop();
            Analytics.triggerFeatureUsed(Analytics.FEATURE_PAUSE);
        }));
    }

    createNode(controller) {
        const btn = super.createNode(controller);

        controller.addOnStarted(() => btn.text('Pause'));
        controller.addOnStopped(() => btn.text('Start'));

        return btn;
    }
}
