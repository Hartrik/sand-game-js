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
        super('', cssClass, Action.create(controls => {
            controls.switchStartStop();
            Analytics.triggerFeatureUsed(Analytics.FEATURE_PAUSE);
        }));
    }

    createNode(sandGameControls) {
        const btn = super.createNode(sandGameControls);

        sandGameControls.addOnStarted(() => btn.text('Pause'));
        sandGameControls.addOnStopped(() => btn.text('Start'));

        return btn;
    }
}
